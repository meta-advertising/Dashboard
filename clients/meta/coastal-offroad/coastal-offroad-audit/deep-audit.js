const puppeteer = require("puppeteer");

// Events annonces par le dev
const DEV_EVENTS = [
  "productClick",
  "add_to_cart",
  "begin_checkout",
  "checkout",
  "add_shipping_info",
  "add_payment_info",
  "view_promotion",
  "select_promotion",
  "remove_from_cart",
];

// Events GA4 standard attendus pour un funnel complet
const GA4_STANDARD = [
  "view_item_list",
  "select_item",
  "view_item",
  "add_to_cart",
  "view_cart",
  "begin_checkout",
  "add_shipping_info",
  "add_payment_info",
  "purchase",
];

const TIMEOUT = 20000;
const WAIT = 4000;

// Collect GA/GTM network requests
const networkHits = [];

function classifyEntry(e) {
  const hasEvent = !!e.event;
  const eventName = e.event || null;
  const isGTMNative = eventName && eventName.startsWith("gtm.");
  const hasEcommerce = !!e.ecommerce;
  const hasItems = hasEcommerce && Array.isArray(e.ecommerce.items);
  const hasImpressions = hasEcommerce && !!e.ecommerce.impressions;
  const hasProducts =
    hasEcommerce &&
    (e.ecommerce.detail?.products ||
      e.ecommerce.add?.products ||
      e.ecommerce.checkout?.products);
  const isGA4 = hasItems;
  const isUA = hasImpressions || hasProducts || (hasEcommerce && !!e.ecommerce.currencyCode && !hasItems);

  let itemData = null;
  if (hasItems && e.ecommerce.items.length > 0) {
    const it = e.ecommerce.items[0];
    itemData = {
      item_id: it.item_id ?? it.id ?? "MISSING",
      item_name: it.item_name ?? it.name ?? "MISSING",
      price: it.price ?? "MISSING",
      currency: e.ecommerce.currency ?? it.currency ?? "MISSING",
      quantity: it.quantity ?? "MISSING",
      item_count: e.ecommerce.items.length,
      items_empty: e.ecommerce.items.length === 0,
    };
  }

  return {
    eventName,
    hasEvent,
    isGTMNative,
    hasEcommerce,
    isGA4,
    isUA,
    itemData,
    raw: e,
  };
}

function printDivider(title) {
  console.log("\n" + "━".repeat(70));
  console.log("  " + title);
  console.log("━".repeat(70));
}

function printEntry(c, indent = "") {
  const fmt = c.isGA4 ? "GA4" : c.isUA ? "UA" : c.hasEcommerce ? "ecom?" : "no-ecom";
  let line = `${indent}event="${c.eventName || "(NONE)"}" | format=${fmt}`;
  if (c.itemData) {
    line += ` | ${c.itemData.item_count} item(s)`;
  }
  if (c.isUA && c.raw.ecommerce?.impressions) {
    line += ` | ${c.raw.ecommerce.impressions.length} impressions`;
  }
  console.log(line);

  if (c.itemData) {
    const d = c.itemData;
    const check = (v) => (v !== "MISSING" && v !== undefined && v !== null && v !== "" ? "✅" : "❌");
    console.log(
      `${indent}  ${check(d.item_id)} item_id=${d.item_id} | ${check(d.item_name)} item_name=${typeof d.item_name === "string" ? d.item_name.substring(0, 40) : d.item_name} | ${check(d.price)} price=${d.price} | ${check(d.currency)} currency=${d.currency}`
    );
  }

  if (!c.hasEvent && c.hasEcommerce) {
    console.log(`${indent}  ⚠️  PAS DE CLE "event" → GTM ne declenchera aucun tag`);
  }
  if (c.isUA) {
    console.log(`${indent}  ⚠️  Format UA obsolete → doit etre migre en GA4`);
  }
  if (c.isGA4 && c.itemData && c.itemData.items_empty) {
    console.log(`${indent}  ⚠️  Tableau items vide → aucune donnee produit`);
  }
}

(async () => {
  console.log("╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║     AUDIT APPROFONDI dataLayer — coastaloffroad.com                 ║");
  console.log("║     Date: " + new Date().toLocaleString("fr-FR") + "                              ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );
  await page.setViewport({ width: 1440, height: 900 });

  // Intercept network requests to GA/GTM/sGTM
  page.on("request", (req) => {
    const url = req.url();
    if (
      url.includes("google-analytics.com/") ||
      url.includes("analytics.google.com/") ||
      url.includes("/g/collect") ||
      url.includes("googletagmanager.com/a?") ||
      url.includes("gtm.") ||
      url.includes("sgtm.") ||
      url.includes("tagging-server") ||
      url.includes("server-side") ||
      (url.includes("collect") && url.includes("v=2"))
    ) {
      networkHits.push({
        url: url.substring(0, 200),
        method: req.method(),
        step: "network",
      });
    }
  });

  const allFoundEvents = new Set();
  const stepResults = {};

  // ════════════════════════════════════════════
  // STEP 1: HOMEPAGE
  // ════════════════════════════════════════════
  printDivider("STEP 1 : HOMEPAGE — coastaloffroad.com");

  await page.goto("https://coastaloffroad.com", {
    waitUntil: "networkidle2",
    timeout: TIMEOUT,
  });
  await new Promise((r) => setTimeout(r, WAIT));

  let dl = await page.evaluate(() =>
    window.dataLayer ? JSON.parse(JSON.stringify(window.dataLayer)) : []
  );

  console.log(`\n  dataLayer: ${dl.length} entries`);

  // Show ALL events
  const homeEvents = dl.filter((e) => e.event);
  console.log(`  Events avec cle "event": ${homeEvents.length}`);
  homeEvents.forEach((e) => console.log(`    • ${e.event}`));

  // Ecommerce entries
  const homeEcom = dl.filter((e) => e.ecommerce).map(classifyEntry);
  console.log(`\n  Entries avec ecommerce: ${homeEcom.length}`);
  homeEcom.forEach((c) => {
    printEntry(c, "    ");
    if (c.eventName) allFoundEvents.add(c.eventName);
  });

  // Check for non-ecommerce events from dev list
  homeEvents.forEach((e) => {
    if (DEV_EVENTS.includes(e.event) || GA4_STANDARD.includes(e.event)) {
      allFoundEvents.add(e.event);
      if (!homeEcom.find((c) => c.eventName === e.event)) {
        const c = classifyEntry(e);
        console.log(`\n  Event "${e.event}" (sans objet ecommerce):`);
        printEntry(c, "    ");
      }
    }
  });

  stepResults.homepage = dl;

  // Check GTM & sGTM
  console.log("\n  --- Detection GTM ---");
  const gtmInfo = await page.evaluate(() => {
    const html = document.documentElement.innerHTML;
    const gtmIds = html.match(/GTM-[A-Z0-9]+/g) || [];
    const gaIds = html.match(/G-[A-Z0-9]+/g) || [];
    const scripts = Array.from(document.querySelectorAll("script[src]")).map((s) => s.src);
    const gtmScripts = scripts.filter((s) => s.includes("googletagmanager.com"));
    const sgtmHint = scripts.find(
      (s) =>
        !s.includes("www.googletagmanager.com") &&
        s.includes("gtm") &&
        !s.includes("google")
    );
    return { gtmIds: [...new Set(gtmIds)], gaIds: [...new Set(gaIds)], gtmScripts, sgtmHint };
  });
  console.log(`  GTM containers: ${gtmInfo.gtmIds.join(", ") || "aucun"}`);
  console.log(`  GA4 measurement IDs: ${gtmInfo.gaIds.join(", ") || "aucun"}`);
  console.log(`  GTM scripts: ${gtmInfo.gtmScripts.length}`);
  gtmInfo.gtmScripts.forEach((s) => console.log(`    ${s.substring(0, 120)}`));
  if (gtmInfo.sgtmHint) console.log(`  Possible sGTM endpoint: ${gtmInfo.sgtmHint}`);

  // ════════════════════════════════════════════
  // STEP 2: CLICK ON A PRODUCT (intercept productClick / select_item)
  // ════════════════════════════════════════════
  printDivider("STEP 2 : CLIC SUR UN PRODUIT (productClick / select_item)");

  const dlBeforeClick = dl.length;

  // Find a product link and click it (not navigate)
  const productInfo = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a[href]"));
    const prodLink = links.find((a) =>
      /\/shop\/[a-zA-Z0-9].*-\d+$/.test((a.href || "").split("?")[0])
    );
    if (prodLink) {
      const href = prodLink.href;
      const text = (prodLink.textContent || "").trim().substring(0, 60);
      // Click it
      prodLink.click();
      return { href, text, clicked: true };
    }
    return { clicked: false };
  });

  if (productInfo.clicked) {
    console.log(`\n  Produit clique: ${productInfo.text}`);
    console.log(`  URL cible: ${productInfo.href}`);
    await new Promise((r) => setTimeout(r, 2000));

    // Check dataLayer BEFORE page navigation (for click events)
    let dlAfterClick = await page.evaluate(() =>
      window.dataLayer ? JSON.parse(JSON.stringify(window.dataLayer)) : []
    );
    const newClickEntries = dlAfterClick.slice(dlBeforeClick);
    console.log(`\n  Nouvelles entries apres clic: ${newClickEntries.length}`);
    newClickEntries.forEach((e) => {
      const c = classifyEntry(e);
      printEntry(c, "    ");
      if (c.eventName) allFoundEvents.add(c.eventName);
    });

    if (newClickEntries.length === 0) {
      console.log("    ❌ Aucun event productClick / select_item au clic");
    }

    // Now navigate to product page
    await page.goto(productInfo.href, { waitUntil: "networkidle2", timeout: TIMEOUT });
    await new Promise((r) => setTimeout(r, WAIT));
  } else {
    // Navigate to /shop and find a product
    console.log("  Aucun produit sur la homepage, navigation vers /shop...");
    await page.goto("https://coastaloffroad.com/shop", {
      waitUntil: "networkidle2",
      timeout: TIMEOUT,
    });
    await new Promise((r) => setTimeout(r, 3000));
    const prodUrl = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a[href]"));
      const l = links.find((a) =>
        /\/shop\/[a-zA-Z0-9].*-\d+$/.test((a.href || "").split("?")[0])
      );
      return l ? l.href : null;
    });
    if (prodUrl) {
      await page.goto(prodUrl, { waitUntil: "networkidle2", timeout: TIMEOUT });
      await new Promise((r) => setTimeout(r, WAIT));
    }
  }

  // ════════════════════════════════════════════
  // STEP 3: PRODUCT PAGE (view_item)
  // ════════════════════════════════════════════
  printDivider("STEP 3 : FICHE PRODUIT (view_item)");
  console.log(`\n  URL: ${page.url()}`);

  dl = await page.evaluate(() =>
    window.dataLayer ? JSON.parse(JSON.stringify(window.dataLayer)) : []
  );
  console.log(`  dataLayer: ${dl.length} entries`);

  const productEvents = dl.filter((e) => e.event);
  console.log(`  Events avec cle "event": ${productEvents.map((e) => e.event).join(", ") || "(aucun)"}`);

  const productEcom = dl.filter((e) => e.ecommerce).map(classifyEntry);
  console.log(`  Entries avec ecommerce: ${productEcom.length}`);
  productEcom.forEach((c) => {
    printEntry(c, "    ");
    if (c.eventName) allFoundEvents.add(c.eventName);
  });

  // Check specifically for view_item or productDetail
  const viewItemFound = dl.find(
    (e) => e.event === "view_item" || e.event === "productDetail" || e.event === "detail"
  );
  if (!viewItemFound) {
    console.log("\n    ❌ Aucun event view_item / productDetail sur la fiche produit");
  }

  // Also dump any non-standard event that might be from the dev
  productEvents.forEach((e) => {
    if (!e.event.startsWith("gtm.") && !allFoundEvents.has(e.event)) {
      allFoundEvents.add(e.event);
      console.log(`\n  Event non-standard detecte: "${e.event}"`);
      const c = classifyEntry(e);
      printEntry(c, "    ");
    }
  });

  stepResults.product = dl;

  // ════════════════════════════════════════════
  // STEP 4: ADD TO CART
  // ════════════════════════════════════════════
  printDivider("STEP 4 : AJOUT AU PANIER (add_to_cart)");

  const dlBeforeATC = dl.length;

  // Try multiple ATC strategies
  const atcResult = await page.evaluate(() => {
    // Strategy 1: form submit
    const form = document.querySelector('form[action*="/shop/cart/update"]');
    if (form) {
      const submitBtn = form.querySelector('button, a.btn, input[type="submit"]');
      if (submitBtn) { submitBtn.click(); return { method: "form-submit", found: true }; }
    }
    // Strategy 2: #add_to_cart
    const atcBtn = document.querySelector("#add_to_cart, a#add_to_cart");
    if (atcBtn) { atcBtn.click(); return { method: "#add_to_cart", found: true }; }
    // Strategy 3: text match
    const allBtns = Array.from(document.querySelectorAll("button, a.btn, a.btn-primary, input[type=submit]"));
    const textBtn = allBtns.find((b) => {
      const t = (b.textContent || b.value || "").toLowerCase().trim();
      return t.includes("add to cart") || t.includes("add to bag") || t === "add" || t.includes("ajouter");
    });
    if (textBtn) { textBtn.click(); return { method: "text-match:" + (textBtn.textContent||"").trim().substring(0,30), found: true }; }
    // Strategy 4: any prominent CTA on product page
    const cta = document.querySelector(".js_check_product a, .product_price a.btn, .js_add_cart");
    if (cta) { cta.click(); return { method: "cta-fallback", found: true }; }

    // Dump all buttons for debugging
    const allButtons = Array.from(document.querySelectorAll("button, a.btn")).map(b => ({
      tag: b.tagName,
      text: (b.textContent||"").trim().substring(0,40),
      id: b.id,
      classes: b.className.substring(0,60),
    }));
    return { found: false, buttons: allButtons.slice(0, 10) };
  });

  console.log(`\n  Bouton ATC: ${atcResult.found ? "✅ trouve (" + atcResult.method + ")" : "❌ non trouve"}`);
  if (!atcResult.found && atcResult.buttons) {
    console.log("  Boutons visibles sur la page:");
    atcResult.buttons.forEach((b) =>
      console.log(`    <${b.tag}> id="${b.id}" class="${b.classes}" → "${b.text}"`)
    );
  }

  await new Promise((r) => setTimeout(r, WAIT));

  dl = await page.evaluate(() =>
    window.dataLayer ? JSON.parse(JSON.stringify(window.dataLayer)) : []
  );
  const newATCEntries = dl.slice(dlBeforeATC);
  console.log(`\n  Nouvelles entries apres ATC: ${newATCEntries.length}`);
  if (newATCEntries.length > 0) {
    newATCEntries.forEach((e) => {
      const c = classifyEntry(e);
      printEntry(c, "    ");
      if (c.eventName) allFoundEvents.add(c.eventName);
    });
  } else {
    console.log("    ❌ Aucun event add_to_cart detecte");
  }

  // ════════════════════════════════════════════
  // STEP 5: CART PAGE
  // ════════════════════════════════════════════
  printDivider("STEP 5 : PAGE PANIER (view_cart / checkout)");

  await page.goto("https://coastaloffroad.com/shop/cart", {
    waitUntil: "networkidle2",
    timeout: TIMEOUT,
  });
  await new Promise((r) => setTimeout(r, WAIT));
  console.log(`\n  URL: ${page.url()}`);

  dl = await page.evaluate(() =>
    window.dataLayer ? JSON.parse(JSON.stringify(window.dataLayer)) : []
  );
  console.log(`  dataLayer: ${dl.length} entries`);

  const cartEvents = dl.filter((e) => e.event);
  console.log(`  Events avec cle "event": ${cartEvents.map((e) => e.event).join(", ") || "(aucun)"}`);

  const cartEcom = dl.filter((e) => e.ecommerce).map(classifyEntry);
  console.log(`  Entries avec ecommerce: ${cartEcom.length}`);
  cartEcom.forEach((c) => {
    printEntry(c, "    ");
    if (c.eventName) allFoundEvents.add(c.eventName);
  });

  cartEvents.forEach((e) => {
    if (!e.event.startsWith("gtm.") && !allFoundEvents.has(e.event)) {
      allFoundEvents.add(e.event);
    }
  });

  if (!dl.find((e) => e.event === "view_cart" || e.event === "checkout")) {
    console.log("\n    ❌ Aucun event view_cart / checkout sur la page panier");
  }

  // ════════════════════════════════════════════
  // STEP 6: FULL DATALAYER DUMP (homepage for raw debug)
  // ════════════════════════════════════════════
  printDivider("STEP 6 : DUMP COMPLET dataLayer (page panier)");
  dl.forEach((entry, i) => {
    const keys = Object.keys(entry);
    const summary = keys
      .map((k) => {
        const v = entry[k];
        if (typeof v === "string") return `${k}="${v.substring(0, 50)}"`;
        if (typeof v === "object" && v !== null) return `${k}={...}`;
        return `${k}=${v}`;
      })
      .join(" | ");
    console.log(`  [${i}] ${summary}`);
  });

  // ════════════════════════════════════════════
  // STEP 7: NETWORK REQUESTS CHECK (sGTM)
  // ════════════════════════════════════════════
  printDivider("STEP 7 : REQUETES RESEAU GA/GTM/sGTM");
  if (networkHits.length > 0) {
    console.log(`\n  ${networkHits.length} requetes interceptees:`);
    networkHits.forEach((h) => console.log(`    ${h.method} ${h.url}`));
  } else {
    console.log("\n  Aucune requete GA/sGTM interceptee");
  }

  // ════════════════════════════════════════════
  // BILAN FINAL
  // ════════════════════════════════════════════
  printDivider("BILAN FINAL : EVENTS ANNONCES PAR LE DEV vs REALITE");

  console.log("\n  Events annonces par le dev:\n");
  DEV_EVENTS.forEach((ev) => {
    const found = allFoundEvents.has(ev);
    // Also check if it appeared without ecommerce data
    let detail = "";
    if (found) {
      // Find in any step
      for (const stepDL of [stepResults.homepage, stepResults.product, dl]) {
        if (!stepDL) continue;
        const match = stepDL.find((e) => e.event === ev);
        if (match) {
          const c = classifyEntry(match);
          if (c.isGA4 && c.itemData && c.itemData.item_count > 0) {
            detail = "✅ Present + GA4 + donnees OK";
          } else if (c.isGA4 && (!c.itemData || c.itemData.items_empty)) {
            detail = "⚠️  Present + GA4 mais items VIDE";
          } else if (c.isUA) {
            detail = "⚠️  Present mais format UA (pas GA4)";
          } else if (c.hasEcommerce) {
            detail = "⚠️  Present + ecommerce mais format non-standard";
          } else {
            detail = "⚠️  Present mais SANS objet ecommerce";
          }
          break;
        }
      }
      if (!detail) detail = "⚠️  Detecte mais impossible d'analyser le contenu";
    } else {
      detail = "❌ ABSENT du dataLayer";
    }
    console.log(`    ${found ? "⚠️ " : "❌"} ${ev.padEnd(22)} → ${detail}`);
  });

  console.log("\n  Events GA4 standard (best practice):\n");
  GA4_STANDARD.forEach((ev) => {
    const found = allFoundEvents.has(ev);
    let detail = found ? "✅ Detecte" : "❌ ABSENT";
    if (found) {
      for (const stepDL of [stepResults.homepage, stepResults.product, dl]) {
        if (!stepDL) continue;
        const match = stepDL.find((e) => e.event === ev);
        if (match) {
          const c = classifyEntry(match);
          if (c.isGA4 && c.itemData && c.itemData.item_count > 0) detail = "✅ GA4 correct avec donnees";
          else if (c.isGA4) detail = "⚠️  GA4 mais items vide";
          else detail = "⚠️  Present mais pas au format GA4";
          break;
        }
      }
    }
    console.log(`    ${found ? (detail.includes("✅") ? "✅" : "⚠️ ") : "❌"} ${ev.padEnd(22)} → ${detail}`);
  });

  console.log("\n  Tous les events uniques rencontres:");
  console.log(`    ${[...allFoundEvents].join(", ") || "(aucun en dehors de gtm.*)"}`);

  await browser.close();
  console.log("\n" + "═".repeat(70));
  console.log("  AUDIT TERMINE");
  console.log("═".repeat(70));
})();
