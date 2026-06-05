const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────
const SITES = [
  { name: "Coastal Offroad US", url: "https://coastaloffroad.com" },
  { name: "Coastal Offroad NZ", url: "https://coastaloffroad.co.nz" },
  { name: "Coastal Offroad AU", url: "https://coastaloffroadbumpers.com.au" },
  { name: "Coastal Offroad CA", url: "https://coastaloffroad.ca" },
];

const GA4_EVENTS = [
  "view_item_list",
  "select_item",
  "view_item",
  "add_to_cart",
  "view_cart",
  "begin_checkout",
];

const GA4_ITEM_FIELDS = ["item_name", "item_id", "price", "currency"];

const TIMEOUT = 15000;

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
async function getDataLayer(page) {
  return page.evaluate(() => {
    return window.dataLayer ? JSON.parse(JSON.stringify(window.dataLayer)) : [];
  });
}

async function waitAndGetNewDataLayerEntries(page, prevLength) {
  await new Promise((r) => setTimeout(r, 3000));
  const dl = await getDataLayer(page);
  return dl.slice(prevLength);
}

function classifyEvent(entry) {
  const result = {
    raw: entry,
    hasEventKey: !!entry.event,
    eventName: entry.event || null,
    format: "unknown",
    isGA4: false,
    isUA: false,
    itemFields: {},
    issues: [],
  };

  // GA4 detection: has "items" array
  if (entry.ecommerce && entry.ecommerce.items) {
    result.format = "GA4";
    result.isGA4 = true;
    const firstItem = entry.ecommerce.items[0] || {};
    for (const f of GA4_ITEM_FIELDS) {
      result.itemFields[f] = firstItem[f] !== undefined;
    }
    if (!entry.ecommerce.currency && !firstItem.currency) {
      result.issues.push("currency manquante");
    }
  }
  // UA detection: impressions, products, currencyCode
  else if (
    entry.ecommerce &&
    (entry.ecommerce.impressions ||
      entry.ecommerce.detail ||
      entry.ecommerce.add ||
      entry.ecommerce.checkout ||
      entry.ecommerce.currencyCode ||
      entry.ecommerce.purchase)
  ) {
    result.format = "UA (Enhanced Ecommerce)";
    result.isUA = true;

    // Try to extract product info from UA format
    let product = null;
    if (entry.ecommerce.detail?.products?.[0]) product = entry.ecommerce.detail.products[0];
    else if (entry.ecommerce.add?.products?.[0]) product = entry.ecommerce.add.products[0];
    else if (entry.ecommerce.impressions?.[0]) product = entry.ecommerce.impressions[0];
    else if (entry.ecommerce.checkout?.products?.[0]) product = entry.ecommerce.checkout.products[0];

    if (product) {
      result.itemFields = {
        name: product.name !== undefined,
        id: product.id !== undefined,
        price: product.price !== undefined,
        category: product.category !== undefined,
      };
    }
    result.issues.push("Format UA obsolete - migration GA4 recommandee");
  }

  if (!result.hasEventKey) {
    result.issues.push("Pas de cle 'event' - ne declenchera pas de tag GTM");
  }

  return result;
}

function findProductLink(page) {
  return page.evaluate(() => {
    const allLinks = Array.from(document.querySelectorAll("a[href]"));

    // Odoo pattern: /shop/[slug]-[numeric-id] (NOT /shop/cart, /shop/checkout, etc.)
    const odooLink = allLinks.find((a) => {
      const href = a.href || "";
      return /\/shop\/[a-zA-Z0-9].*-\d+$/.test(href.split("?")[0].split("#")[0]);
    });
    if (odooLink) return odooLink.href;

    // Shopify pattern: /products/[slug]
    const shopifyLink = allLinks.find((a) => {
      const href = a.href || "";
      return /\/products\/[a-zA-Z0-9]/.test(href);
    });
    if (shopifyLink) return shopifyLink.href;

    // Generic /product/ pattern
    const genericLink = allLinks.find((a) => {
      const href = a.href || "";
      return /\/product\/[a-zA-Z0-9]/.test(href);
    });
    return genericLink ? genericLink.href : null;
  });
}

async function findProductFromShopPage(page, baseUrl) {
  // Odoo sites use /shop as the product listing page
  const listingUrls = ["/shop", "/collections/all", "/collections", "/products"];
  for (const cpath of listingUrls) {
    try {
      console.log(`    Trying ${baseUrl}${cpath}...`);
      await page.goto(baseUrl + cpath, { waitUntil: "networkidle2", timeout: TIMEOUT });
      await new Promise((r) => setTimeout(r, 3000));
      const link = await findProductLink(page);
      if (link) return link;
    } catch {
      // try next
    }
  }
  return null;
}

async function clickAddToCart(page) {
  const selectors = [
    // Odoo selectors
    '#add_to_cart',
    'a#add_to_cart',
    '.js_check_product a.btn',
    'form[action*="/shop/cart/update"] button',
    'form[action*="/shop/cart/update"] a.btn',
    '.product_price .btn',
    'a.btn-primary[href*="cart"]',
    // Shopify selectors
    'button[name="add"]',
    'button[type="submit"][name="add"]',
    ".product-form__submit",
    ".add-to-cart",
    "#AddToCart",
    'button[data-action="add-to-cart"]',
    'form[action*="/cart/add"] button[type="submit"]',
    ".btn--add-to-cart",
    'input[type="submit"][name="add"]',
  ];

  for (const sel of selectors) {
    try {
      const btn = await page.$(sel);
      if (btn) {
        const isVisible = await page.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }, btn);
        if (isVisible) {
          await btn.click();
          return true;
        }
      }
    } catch {
      // try next selector
    }
  }

  // Fallback: find button by text content
  try {
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button, input[type='submit']"));
      const addBtn = buttons.find((b) => {
        const text = (b.textContent || b.value || "").toLowerCase();
        return (
          text.includes("add to cart") ||
          text.includes("ajouter") ||
          text.includes("add to bag")
        );
      });
      if (addBtn) {
        addBtn.click();
        return true;
      }
      return false;
    });
    return clicked;
  } catch {
    return false;
  }
}

async function navigateToCart(page, baseUrl) {
  const cartUrls = ["/shop/cart", "/cart", "/checkout"];
  for (const path of cartUrls) {
    try {
      await page.goto(baseUrl + path, { waitUntil: "networkidle2", timeout: TIMEOUT });
      return true;
    } catch {
      // try next
    }
  }
  return false;
}

// ──────────────────────────────────────────────
// Main audit for one site
// ──────────────────────────────────────────────
async function auditSite(browser, site) {
  const result = {
    name: site.name,
    url: site.url,
    steps: [],
    gtmDetected: false,
    dataLayerExists: false,
    allEvents: [],
    errors: [],
  };

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );
  await page.setViewport({ width: 1440, height: 900 });

  // Accept cookies if a banner appears
  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  try {
    // ── Step 1: Homepage ──
    console.log(`  [${site.name}] Step 1: Visiting homepage...`);
    await page.goto(site.url, { waitUntil: "networkidle2", timeout: TIMEOUT });
    await new Promise((r) => setTimeout(r, 3000));

    // Check GTM
    const gtmCheck = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script"));
      const gtmScript = scripts.find(
        (s) => (s.src && s.src.includes("googletagmanager.com")) || (s.innerHTML && s.innerHTML.includes("GTM-"))
      );
      const gtmId =
        (document.documentElement.innerHTML.match(/GTM-[A-Z0-9]+/) || [])[0] || null;
      return { found: !!gtmScript, id: gtmId };
    });
    result.gtmDetected = gtmCheck.found;
    result.gtmId = gtmCheck.id;

    const homepageDL = await getDataLayer(page);
    result.dataLayerExists = homepageDL.length > 0;

    const homepageEcomEvents = homepageDL.filter((e) => e.ecommerce || (e.event && e.event.includes("view")));
    result.steps.push({
      step: "Homepage",
      url: site.url,
      dataLayerLength: homepageDL.length,
      ecommerceEvents: homepageEcomEvents.map(classifyEvent),
      allEntries: homepageDL,
    });

    // ── Step 2: Find & visit product page ──
    console.log(`  [${site.name}] Step 2: Finding product page...`);

    // First try to find a product on homepage, otherwise go to /shop
    let productUrl = await findProductLink(page);

    if (!productUrl) {
      productUrl = await findProductFromShopPage(page, site.url);
    }

    if (productUrl) {
      console.log(`  [${site.name}] Step 2: Visiting ${productUrl}`);
      await page.goto(productUrl, { waitUntil: "networkidle2", timeout: TIMEOUT });
      await new Promise((r) => setTimeout(r, 3000));

      const productDL = await getDataLayer(page);
      const productEcomEvents = productDL.filter(
        (e) => e.ecommerce || (e.event && (e.event.includes("view_item") || e.event.includes("detail")))
      );

      result.steps.push({
        step: "Product Page",
        url: productUrl,
        dataLayerLength: productDL.length,
        ecommerceEvents: productEcomEvents.map(classifyEvent),
        allEntries: productDL,
      });

      // ── Step 3: Add to cart ──
      console.log(`  [${site.name}] Step 3: Attempting add to cart...`);
      const beforeAddDL = await getDataLayer(page);
      const addSuccess = await clickAddToCart(page);
      await new Promise((r) => setTimeout(r, 3000));

      const afterAddDL = await getDataLayer(page);
      const newAddEntries = afterAddDL.slice(beforeAddDL.length);
      const addEvents = newAddEntries.filter(
        (e) => e.ecommerce || (e.event && (e.event.includes("add") || e.event.includes("cart")))
      );

      result.steps.push({
        step: "Add to Cart",
        url: productUrl,
        buttonFound: addSuccess,
        dataLayerLength: afterAddDL.length,
        newEntries: newAddEntries.length,
        ecommerceEvents: addEvents.map(classifyEvent),
        allNewEntries: newAddEntries,
      });

      // ── Step 4: Cart / Checkout ──
      console.log(`  [${site.name}] Step 4: Visiting cart/checkout...`);
      const cartSuccess = await navigateToCart(page, site.url);
      await new Promise((r) => setTimeout(r, 3000));

      if (cartSuccess) {
        const cartDL = await getDataLayer(page);
        const cartEcomEvents = cartDL.filter(
          (e) =>
            e.ecommerce ||
            (e.event &&
              (e.event.includes("cart") ||
                e.event.includes("checkout") ||
                e.event.includes("begin")))
        );

        result.steps.push({
          step: "Cart / Checkout",
          url: page.url(),
          dataLayerLength: cartDL.length,
          ecommerceEvents: cartEcomEvents.map(classifyEvent),
          allEntries: cartDL,
        });
      } else {
        result.steps.push({
          step: "Cart / Checkout",
          url: "N/A",
          error: "Could not navigate to cart page",
          ecommerceEvents: [],
        });
      }
    } else {
      result.errors.push("Could not find any product link on the site");
      result.steps.push({
        step: "Product Page",
        url: "N/A",
        error: "No product link found",
        ecommerceEvents: [],
      });
    }
  } catch (err) {
    result.errors.push(`Fatal error: ${err.message}`);
    console.error(`  [${site.name}] Error: ${err.message}`);
  } finally {
    await page.close();
  }

  return result;
}

// ──────────────────────────────────────────────
// Report generation
// ──────────────────────────────────────────────
function generateReport(results) {
  let md = `# Audit dataLayer eCommerce - Coastal Offroad\n\n`;
  md += `**Date :** ${new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}\n`;
  md += `**Outil :** Puppeteer + script d'audit automatise\n`;
  md += `**Objectif :** Verifier la conformite du tracking ecommerce dataLayer (GA4 / GTM)\n\n`;
  md += `---\n\n`;

  // Summary table
  md += `## Resume global\n\n`;
  md += `| Site | GTM | dataLayer | Format | view_item_list | view_item | add_to_cart | view_cart / begin_checkout |\n`;
  md += `|------|-----|-----------|--------|----------------|-----------|-------------|---------------------------|\n`;

  for (const r of results) {
    const allClassified = [];
    for (const s of r.steps) {
      if (s.ecommerceEvents) allClassified.push(...s.ecommerceEvents);
    }

    const eventNames = allClassified.map((e) => e.eventName).filter(Boolean);
    const format = allClassified.some((e) => e.isGA4)
      ? "GA4"
      : allClassified.some((e) => e.isUA)
        ? "UA"
        : "N/A";

    const check = (names) => names.some((n) => eventNames.includes(n));
    const viewItemList = check(["view_item_list"]) ? "✅" : "❌";
    const viewItem = check(["view_item"]) ? "✅" : "❌";
    const addToCart = check(["add_to_cart"]) ? "✅" : "❌";
    const viewCart = check(["view_cart", "begin_checkout"]) ? "✅" : "❌";

    md += `| ${r.name} | ${r.gtmDetected ? "✅ " + (r.gtmId || "") : "❌"} | ${r.dataLayerExists ? "✅" : "❌"} | ${format} | ${viewItemList} | ${viewItem} | ${addToCart} | ${viewCart} |\n`;
  }

  md += `\n---\n\n`;

  // Detailed per-site
  for (const r of results) {
    md += `## ${r.name}\n`;
    md += `**URL :** ${r.url}\n`;
    md += `**GTM :** ${r.gtmDetected ? "✅ Detecte" + (r.gtmId ? " (" + r.gtmId + ")" : "") : "❌ Non detecte"}\n`;
    md += `**dataLayer :** ${r.dataLayerExists ? "✅ Present" : "❌ Absent"}\n\n`;

    if (r.errors.length > 0) {
      md += `### Erreurs\n`;
      for (const err of r.errors) {
        md += `- ❌ ${err}\n`;
      }
      md += `\n`;
    }

    for (const step of r.steps) {
      md += `### ${step.step}\n`;
      md += `**URL :** ${step.url}\n`;

      if (step.error) {
        md += `**Statut :** ❌ ${step.error}\n\n`;
        continue;
      }

      if (step.buttonFound !== undefined) {
        md += `**Bouton Add to Cart :** ${step.buttonFound ? "✅ Trouve et clique" : "❌ Non trouve"}\n`;
      }

      md += `**Entries dataLayer :** ${step.dataLayerLength || 0}`;
      if (step.newEntries !== undefined) {
        md += ` (${step.newEntries} nouvelles apres action)`;
      }
      md += `\n\n`;

      if (step.ecommerceEvents && step.ecommerceEvents.length > 0) {
        md += `**Events ecommerce detectes :**\n\n`;
        for (const ev of step.ecommerceEvents) {
          const status = ev.hasEventKey ? "✅" : "❌";
          md += `- ${status} \`${ev.eventName || "(pas de cle event)"}\` — Format: **${ev.format}**\n`;

          if (Object.keys(ev.itemFields).length > 0) {
            md += `  - Champs produit :\n`;
            for (const [field, present] of Object.entries(ev.itemFields)) {
              md += `    - ${present ? "✅" : "❌"} \`${field}\`\n`;
            }
          }

          if (ev.issues.length > 0) {
            md += `  - Problemes :\n`;
            for (const issue of ev.issues) {
              md += `    - ⚠️ ${issue}\n`;
            }
          }
        }
      } else {
        md += `**Events ecommerce detectes :** ❌ Aucun event ecommerce dans le dataLayer\n`;
      }

      md += `\n`;
    }

    // Expected events check
    md += `### Bilan des events GA4 attendus\n\n`;
    const allClassified = [];
    for (const s of r.steps) {
      if (s.ecommerceEvents) allClassified.push(...s.ecommerceEvents);
    }
    const foundEvents = allClassified.map((e) => e.eventName).filter(Boolean);

    const expectedMapping = {
      view_item_list: "Page d'accueil / collection",
      view_item: "Fiche produit",
      add_to_cart: "Clic sur Ajouter au panier",
      view_cart: "Page panier",
      begin_checkout: "Debut checkout",
    };

    for (const [ev, desc] of Object.entries(expectedMapping)) {
      const found = foundEvents.includes(ev);
      md += `- ${found ? "✅" : "❌"} \`${ev}\` — ${desc}\n`;
    }

    md += `\n`;

    // Dump raw ecommerce events for reference
    md += `<details>\n<summary>Donnees brutes dataLayer (ecommerce events)</summary>\n\n`;
    md += "```json\n";
    const rawEvents = [];
    for (const s of r.steps) {
      if (s.ecommerceEvents) {
        for (const ev of s.ecommerceEvents) {
          rawEvents.push({ step: s.step, ...ev.raw });
        }
      }
    }
    md += JSON.stringify(rawEvents, null, 2);
    md += "\n```\n\n</details>\n\n";

    md += `---\n\n`;
  }

  // Recommendations
  md += `## Recommandations generales\n\n`;

  const hasUA = results.some((r) =>
    r.steps.some((s) => s.ecommerceEvents && s.ecommerceEvents.some((e) => e.isUA))
  );
  const hasNoDataLayer = results.some((r) => !r.dataLayerExists);
  const missingEvents = [];

  for (const r of results) {
    const allClassified = [];
    for (const s of r.steps) {
      if (s.ecommerceEvents) allClassified.push(...s.ecommerceEvents);
    }
    const foundEvents = allClassified.map((e) => e.eventName).filter(Boolean);
    for (const expected of GA4_EVENTS) {
      if (!foundEvents.includes(expected)) {
        missingEvents.push({ site: r.name, event: expected });
      }
    }
  }

  if (hasNoDataLayer) {
    md += `### ❌ dataLayer absent sur certains sites\n`;
    md += `Certains sites n'ont pas de dataLayer initialise. Le developpeur doit ajouter avant le snippet GTM :\n\n`;
    md += "```html\n<script>\n  window.dataLayer = window.dataLayer || [];\n</script>\n```\n\n";
  }

  if (hasUA) {
    md += `### ⚠️ Migration UA vers GA4\n`;
    md += `Des events au format Universal Analytics (Enhanced Ecommerce) ont ete detectes. Depuis juillet 2024, GA UA est arrete. Le format doit etre migre vers GA4.\n\n`;
    md += `**Ancien format UA :**\n`;
    md += "```javascript\ndataLayer.push({\n  event: 'productDetail',\n  ecommerce: {\n    detail: {\n      products: [{ name: '...', id: '...', price: '...' }]\n    }\n  }\n});\n```\n\n";
    md += `**Nouveau format GA4 :**\n`;
    md += "```javascript\ndataLayer.push({\n  event: 'view_item',\n  ecommerce: {\n    currency: 'USD',\n    value: 29.99,\n    items: [{\n      item_id: 'SKU_123',\n      item_name: 'Product Name',\n      price: 29.99,\n      quantity: 1\n    }]\n  }\n});\n```\n\n";
  }

  if (missingEvents.length > 0) {
    md += `### ❌ Events manquants\n\n`;
    md += `Les events GA4 suivants sont absents et doivent etre implementes :\n\n`;

    const bySite = {};
    for (const m of missingEvents) {
      if (!bySite[m.site]) bySite[m.site] = [];
      bySite[m.site].push(m.event);
    }

    for (const [site, events] of Object.entries(bySite)) {
      md += `**${site} :**\n`;
      for (const ev of events) {
        md += `- \`${ev}\`\n`;
      }
      md += `\n`;
    }
  }

  md += `### Corrections a apporter au developpeur\n\n`;
  md += `1. **Initialiser le dataLayer** avant le snippet GTM sur chaque page\n`;
  md += `2. **Utiliser le format GA4** pour tous les events ecommerce (tableau \`items\` avec \`item_id\`, \`item_name\`, \`price\`, \`currency\`)\n`;
  md += `3. **Implementer les events obligatoires** du funnel GA4 :\n`;
  md += `   - \`view_item_list\` sur les pages de collection/listing\n`;
  md += `   - \`view_item\` sur chaque fiche produit\n`;
  md += `   - \`add_to_cart\` au clic sur le bouton d'ajout\n`;
  md += `   - \`view_cart\` sur la page panier\n`;
  md += `   - \`begin_checkout\` au debut du checkout\n`;
  md += `   - \`purchase\` sur la page de confirmation de commande\n`;
  md += `4. **Toujours inclure la cle \`event\`** dans chaque push dataLayer (sinon GTM ne detecte pas l'event)\n`;
  md += `5. **Envoyer un \`ecommerce: null\`** avant chaque push ecommerce pour eviter la contamination entre events :\n\n`;
  md += "```javascript\ndataLayer.push({ ecommerce: null });\ndataLayer.push({\n  event: 'view_item',\n  ecommerce: { /* ... */ }\n});\n```\n\n";

  md += `---\n\n`;
  md += `*Rapport genere automatiquement par le script d'audit Puppeteer.*\n`;

  return md;
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
  console.log("=== Audit dataLayer Coastal Offroad ===\n");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const results = [];

  for (const site of SITES) {
    console.log(`\n▶ Audit: ${site.name} (${site.url})`);
    try {
      const result = await auditSite(browser, site);
      results.push(result);
      console.log(`  ✓ ${site.name} termine`);
    } catch (err) {
      console.error(`  ✗ ${site.name} erreur fatale: ${err.message}`);
      results.push({
        name: site.name,
        url: site.url,
        steps: [],
        gtmDetected: false,
        dataLayerExists: false,
        errors: [err.message],
      });
    }
  }

  await browser.close();

  console.log("\n▶ Generation du rapport...");
  const report = generateReport(results);

  const outputPath = path.join(__dirname, "..", "coastal-offroad-datalayer-audit.md");
  fs.writeFileSync(outputPath, report, "utf-8");
  console.log(`\n✓ Rapport sauvegarde: ${outputPath}`);

  // Also save raw JSON for reference
  const jsonPath = path.join(__dirname, "audit-raw-results.json");
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`✓ Donnees brutes: ${jsonPath}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
