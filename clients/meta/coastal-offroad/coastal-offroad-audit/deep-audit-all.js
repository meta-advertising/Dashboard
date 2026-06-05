const puppeteer = require("puppeteer");

const SITES = [
  { name: "US", url: "https://coastaloffroad.com" },
  { name: "NZ", url: "https://coastaloffroad.co.nz" },
  { name: "AU", url: "https://coastaloffroadbumpers.com.au" },
  { name: "CA", url: "https://coastaloffroad.ca" },
];

const DEV_EVENTS = [
  "productClick", "add_to_cart", "begin_checkout", "checkout",
  "add_shipping_info", "add_payment_info", "view_promotion",
  "select_promotion", "remove_from_cart",
];

const GA4_STANDARD = [
  "view_item_list", "select_item", "view_item", "add_to_cart",
  "view_cart", "begin_checkout", "add_shipping_info", "add_payment_info", "purchase",
];

const TIMEOUT = 20000;
const WAIT = 4000;

function classify(e) {
  const hasItems = e.ecommerce && Array.isArray(e.ecommerce.items);
  const hasUA = e.ecommerce && (e.ecommerce.impressions || e.ecommerce.detail || e.ecommerce.add || (e.ecommerce.currencyCode && !hasItems));
  let itemData = null;
  if (hasItems && e.ecommerce.items.length > 0) {
    const it = e.ecommerce.items[0];
    itemData = {
      item_id: it.item_id ?? it.id ?? "MISSING",
      item_name: (it.item_name ?? it.name ?? "MISSING").toString().substring(0, 45),
      price: it.price ?? "MISSING",
      currency: e.ecommerce.currency ?? it.currency ?? "MISSING",
      count: e.ecommerce.items.length,
    };
  }
  return { event: e.event || null, ga4: hasItems, ua: hasUA, ecom: !!e.ecommerce, itemData, raw: e };
}

function ok(v) { return v !== "MISSING" && v !== undefined && v !== null && v !== "" ? "✅" : "❌"; }

async function getDL(page) {
  return page.evaluate(() => window.dataLayer ? JSON.parse(JSON.stringify(window.dataLayer)) : []);
}

async function auditSite(browser, site) {
  const results = { found: new Set(), details: {} };

  console.log("\n\n" + "█".repeat(70));
  console.log(`█  ${site.name.toUpperCase()} — ${site.url}`);
  console.log("█".repeat(70));

  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
  await page.setViewport({ width: 1440, height: 900 });

  // Track sGTM
  const sgtmHits = [];
  page.on("request", (req) => {
    const u = req.url();
    if (u.includes("/g/collect") || (u.includes("gtm.") && u.includes(".js?id=GTM")))
      sgtmHits.push(u.substring(0, 120));
  });

  try {
    // ── HOMEPAGE ──
    console.log("\n┌─ HOMEPAGE ─────────────────────────────────");
    await page.goto(site.url, { waitUntil: "networkidle2", timeout: TIMEOUT });
    await new Promise(r => setTimeout(r, WAIT));
    let dl = await getDL(page);
    const homeNonGtm = dl.filter(e => e.event && !e.event.startsWith("gtm."));
    const homeEcom = dl.filter(e => e.ecommerce).map(classify);

    console.log(`│ dataLayer: ${dl.length} entries`);
    console.log(`│ Events custom: ${homeNonGtm.map(e => e.event).join(", ") || "(aucun)"}`);
    homeEcom.forEach(c => {
      console.log(`│  → event="${c.event || "(NONE)"}" | ${c.ga4 ? "GA4" : c.ua ? "UA" : "?"} | ${c.itemData ? c.itemData.count + " items" : c.ua ? (c.raw.ecommerce.impressions?.length || 0) + " impressions" : "no data"}`);
      if (c.itemData) console.log(`│    ${ok(c.itemData.item_id)} id=${c.itemData.item_id} | ${ok(c.itemData.item_name)} name=${c.itemData.item_name} | ${ok(c.itemData.price)} price=${c.itemData.price} | ${ok(c.itemData.currency)} currency=${c.itemData.currency}`);
      if (!c.event && c.ecom) console.log("│    ⚠️  PAS DE CLE event");
      if (c.ua) console.log("│    ⚠️  Format UA obsolete");
      if (c.event) results.found.add(c.event);
    });
    homeNonGtm.forEach(e => results.found.add(e.event));

    // sGTM check
    const gtmCheck = await page.evaluate(() => {
      const html = document.documentElement.innerHTML;
      return {
        gtmIds: [...new Set(html.match(/GTM-[A-Z0-9]+/g) || [])],
        sgtmDomain: (Array.from(document.querySelectorAll("script[src*='gtm']")).find(s => !s.src.includes("www.googletagmanager.com"))?.src?.match(/https?:\/\/([^/]+)/)?.[1]) || null,
      };
    });
    console.log(`│ GTM: ${gtmCheck.gtmIds.join(", ")} | sGTM: ${gtmCheck.sgtmDomain || "non detecte"}`);

    // ── CLIC PRODUIT ──
    console.log("├─ CLIC PRODUIT (productClick/select_item) ──");
    const dlBefore = dl.length;
    const prodHref = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a[href]"));
      const l = links.find(a => /\/shop\/[a-zA-Z0-9].*-\d+$/.test((a.href || "").split("?")[0]));
      if (l) { l.click(); return l.href; }
      return null;
    });

    if (prodHref) {
      await new Promise(r => setTimeout(r, 2000));
      dl = await getDL(page);
      const clickNew = dl.slice(dlBefore).filter(e => e.event && !e.event.startsWith("gtm."));
      console.log(`│ Clic sur: ${prodHref.split("/shop/")[1] || prodHref}`);
      console.log(`│ Events apres clic: ${clickNew.map(e => e.event).join(", ") || "❌ aucun"}`);
      clickNew.forEach(e => {
        results.found.add(e.event);
        const c = classify(e);
        if (c.ecom) console.log(`│  → ${c.event} | ${c.ga4 ? "GA4" : "UA"} | ${c.itemData ? c.itemData.count + " items" : "no data"}`);
      });

      // ── FICHE PRODUIT ──
      console.log("├─ FICHE PRODUIT (view_item) ─────────────────");
      await page.goto(prodHref, { waitUntil: "networkidle2", timeout: TIMEOUT });
      await new Promise(r => setTimeout(r, WAIT));
      dl = await getDL(page);
      const prodCustom = dl.filter(e => e.event && !e.event.startsWith("gtm."));
      const prodEcom = dl.filter(e => e.ecommerce).map(classify);
      console.log(`│ URL: ${page.url().substring(0, 80)}`);
      console.log(`│ Events custom: ${prodCustom.map(e => e.event).join(", ") || "❌ aucun"}`);
      prodEcom.forEach(c => {
        console.log(`│  → event="${c.event || "(NONE)"}" | ${c.ga4 ? "GA4" : c.ua ? "UA" : "?"}`);
        if (c.itemData) console.log(`│    ${ok(c.itemData.item_id)} id=${c.itemData.item_id} | ${ok(c.itemData.item_name)} name=${c.itemData.item_name} | ${ok(c.itemData.price)} price=${c.itemData.price}`);
        if (c.event) results.found.add(c.event);
      });
      prodCustom.forEach(e => results.found.add(e.event));
      if (!prodCustom.find(e => e.event === "view_item" || e.event === "productDetail"))
        console.log("│ ❌ Aucun view_item detecte");

      // ── ADD TO CART ──
      console.log("├─ ADD TO CART ───────────────────────────────");
      const dlBeforeATC = dl.length;
      const atc = await page.evaluate(() => {
        const btn = document.querySelector("#add_to_cart, a#add_to_cart");
        if (btn) { btn.click(); return { found: true, method: "#add_to_cart" }; }
        const allBtns = Array.from(document.querySelectorAll("button, a.btn, input[type=submit]"));
        const t = allBtns.find(b => (b.textContent || b.value || "").toLowerCase().includes("add to cart"));
        if (t) { t.click(); return { found: true, method: "text" }; }
        return { found: false };
      });
      console.log(`│ Bouton: ${atc.found ? "✅ " + atc.method : "❌ non trouve"}`);
      await new Promise(r => setTimeout(r, WAIT));
      dl = await getDL(page);
      const atcNew = dl.slice(dlBeforeATC);
      const atcEcom = atcNew.filter(e => e.ecommerce || (e.event && e.event.includes("cart"))).map(classify);
      console.log(`│ Nouvelles entries: ${atcNew.length}`);
      atcEcom.forEach(c => {
        console.log(`│  → event="${c.event || "(NONE)"}" | ${c.ga4 ? "GA4" : "?"} | ${c.itemData ? c.itemData.count + " items" : "no data"}`);
        if (c.itemData) console.log(`│    ${ok(c.itemData.item_id)} id=${c.itemData.item_id} | ${ok(c.itemData.item_name)} name=${c.itemData.item_name} | ${ok(c.itemData.price)} price=${c.itemData.price} | ${ok(c.itemData.currency)} cur=${c.itemData.currency}`);
        if (c.event) results.found.add(c.event);
      });
      if (atcEcom.length === 0) console.log("│ ❌ Aucun add_to_cart");
    } else {
      console.log("│ ❌ Aucun lien produit trouve");
    }

    // ── PANIER ──
    console.log("├─ PANIER (view_cart / checkout) ─────────────");
    await page.goto(site.url + "/shop/cart", { waitUntil: "networkidle2", timeout: TIMEOUT });
    await new Promise(r => setTimeout(r, WAIT));
    dl = await getDL(page);
    const cartCustom = dl.filter(e => e.event && !e.event.startsWith("gtm."));
    const cartEcom = dl.filter(e => e.ecommerce).map(classify);
    console.log(`│ URL: ${page.url()}`);
    console.log(`│ Events custom: ${cartCustom.map(e => e.event).join(", ") || "❌ aucun"}`);
    cartEcom.forEach(c => {
      console.log(`│  → event="${c.event || "(NONE)"}" | ${c.ga4 ? "GA4" : c.ua ? "UA" : "?"}`);
      if (c.event) results.found.add(c.event);
    });
    cartCustom.forEach(e => results.found.add(e.event));
    if (!cartCustom.find(e => ["view_cart","checkout","begin_checkout"].includes(e.event)))
      console.log("│ ❌ Aucun view_cart / checkout");

    // ── BILAN SITE ──
    console.log("└─ BILAN ────────────────────────────────────");
    console.log("│");
    console.log("│ Events du dev:");
    DEV_EVENTS.forEach(ev => {
      const found = results.found.has(ev);
      console.log(`│   ${found ? "✅" : "❌"} ${ev}`);
    });
    console.log("│");
    console.log("│ Events GA4 standard:");
    GA4_STANDARD.forEach(ev => {
      const found = results.found.has(ev);
      console.log(`│   ${found ? "✅" : "❌"} ${ev}`);
    });
    console.log("│");
    console.log(`│ sGTM requetes: ${sgtmHits.length}`);
    console.log(`│ Tous events trouves: ${[...results.found].join(", ") || "(aucun)"}`);

  } catch (err) {
    console.log(`│ ERREUR: ${err.message}`);
  }

  await page.close();
  return results;
}

(async () => {
  console.log("╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║  AUDIT COMPLET dataLayer — 4 sites Coastal Offroad                  ║");
  console.log("║  " + new Date().toLocaleString("fr-FR") + "                                                ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝");

  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const allResults = [];

  for (const site of SITES) {
    const r = await auditSite(browser, site);
    allResults.push({ site: site.name, found: [...r.found] });
  }

  await browser.close();

  // ── TABLEAU COMPARATIF FINAL ──
  console.log("\n\n" + "═".repeat(70));
  console.log("  TABLEAU COMPARATIF FINAL — 4 SITES");
  console.log("═".repeat(70));

  const allEvents = [...new Set([...DEV_EVENTS, ...GA4_STANDARD])];
  const header = "Event".padEnd(22) + SITES.map(s => s.name.padStart(6)).join("");
  console.log("\n  " + header);
  console.log("  " + "─".repeat(header.length));

  allEvents.forEach(ev => {
    const cols = SITES.map((s, i) => {
      const found = allResults[i].found.includes(ev);
      return (found ? "  ✅  " : "  ❌  ");
    }).join("");
    console.log("  " + ev.padEnd(22) + cols);
  });

  console.log("\n" + "═".repeat(70));
  console.log("  AUDIT TERMINE");
  console.log("═".repeat(70));
})();
