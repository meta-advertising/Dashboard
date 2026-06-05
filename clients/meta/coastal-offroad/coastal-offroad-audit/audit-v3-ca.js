const puppeteer = require("puppeteer");
const fs = require("fs");

const SITES = [
  { name: "US", url: "https://coastaloffroad.com", currency: "USD" },
  { name: "NZ", url: "https://coastaloffroad.co.nz", currency: "NZD" },
  { name: "AU", url: "https://coastaloffroadbumpers.com.au", currency: "AUD" },
  { name: "CA", url: "https://coastaloffroad.ca", currency: "CAD" },
];

const EXPECTED_BRAND = "Coastal Offroad";
const TIMEOUT = 25000;
const WAIT = 5000;

const EVENTS_CHECKLIST = [
  "select_item", "view_item", "add_to_cart", "view_cart",
  "begin_checkout", "add_shipping_info", "add_payment_info", "purchase",
];

const PARASITIC_FIELDS = [
  "cartContent", "google_business_vertical", "orderData", "productName", "productSKU",
];

function log(msg) { console.log(msg); }
function logSection(title) {
  log("\n" + "═".repeat(70));
  log(`  ${title}`);
  log("═".repeat(70));
}

async function getDL(page) {
  return page.evaluate(() => window.dataLayer ? JSON.parse(JSON.stringify(window.dataLayer)) : []);
}

function findEvent(dl, eventName) {
  const matches = [];
  dl.forEach((entry, idx) => { if (entry.event === eventName) matches.push({ entry, index: idx }); });
  return matches;
}

function findAllEcommerce(dl) {
  const matches = [];
  dl.forEach((entry, idx) => {
    if (entry.ecommerce && entry.ecommerce !== null) matches.push({ entry, index: idx, event: entry.event || null });
  });
  return matches;
}

// Audit complet d'un item GA4
function auditItem(item, eventName) {
  const issues = [];
  const data = {};

  data.item_id = item.item_id ?? item.id ?? null;
  if (!data.item_id) issues.push("item_id ABSENT");
  else if (typeof data.item_id === "string" && data.item_id !== data.item_id.trim())
    issues.push(`item_id espaces parasites: "${data.item_id}"`);

  data.item_name = item.item_name ?? item.name ?? null;
  if (!data.item_name || data.item_name === "") issues.push("item_name VIDE ou ABSENT");

  data.item_brand = item.item_brand ?? item.brand ?? null;
  if (!data.item_brand) issues.push("item_brand ABSENT");
  else if (data.item_brand !== EXPECTED_BRAND)
    issues.push(`item_brand = "${data.item_brand}" (attendu: "${EXPECTED_BRAND}")`);

  data.item_category = item.item_category ?? item.category ?? null;
  if (!data.item_category) issues.push("item_category ABSENT");

  data.item_category2 = item.item_category2 ?? null;
  if (data.item_category2 && data.item_category2 === data.item_category)
    issues.push(`item_category2 DOUBLON de item_category ("${data.item_category2}")`);

  data.item_category3 = item.item_category3 ?? null;
  data.item_category4 = item.item_category4 ?? null;

  data.price = item.price ?? null;
  if (data.price === null || data.price === undefined) issues.push("price ABSENT");
  else if (typeof data.price === "string") issues.push(`price STRING "${data.price}" (attendu: number)`);

  data.currency_item = item.currency ?? null;

  data.index = item.index ?? null;
  if (data.index !== null && typeof data.index === "string")
    issues.push(`index STRING "${data.index}" (attendu: number)`);

  data.quantity = item.quantity ?? null;
  if (["add_to_cart", "view_cart", "begin_checkout", "purchase"].includes(eventName) && !data.quantity)
    issues.push(`quantity ABSENT pour ${eventName}`);

  if (eventName === "select_item") {
    data.item_list_id = item.item_list_id ?? null;
    data.item_list_name = item.item_list_name ?? null;
    if (!data.item_list_id) issues.push("item_list_id ABSENT");
    if (!data.item_list_name) issues.push("item_list_name ABSENT");
  }

  return { data, issues };
}

// Audit complet d'un push ecommerce
function auditPush(entry, eventName, dl, entryIndex, expectedCurrency) {
  const result = {
    status: "absent", format: null, hasEventKey: false, hasEcommerceReset: false,
    itemsCount: 0, itemAudits: [], eventLevelIssues: [], parasiticFields: [], rawPush: entry,
  };

  result.hasEventKey = !!entry.event;
  if (!result.hasEventKey) result.eventLevelIssues.push("PAS DE CLÉ event");

  if (entry.ecommerce) {
    if (Array.isArray(entry.ecommerce.items)) result.format = "GA4";
    else if (entry.ecommerce.impressions || entry.ecommerce.products || entry.ecommerce.detail ||
             entry.ecommerce.add || entry.ecommerce.checkout || entry.ecommerce.purchase || entry.ecommerce.currencyCode) {
      result.format = "UA";
      result.eventLevelIssues.push("Format UA Enhanced Ecommerce (obsolète)");
    } else result.format = "inconnu";

    const cur = entry.ecommerce.currency;
    if (!cur) result.eventLevelIssues.push("currency ABSENT (niveau ecommerce)");
    else if (cur !== expectedCurrency) result.eventLevelIssues.push(`currency = "${cur}" (attendu: "${expectedCurrency}")`);
  }

  // Reset ecommerce: null avant le push ?
  if (entryIndex > 0) {
    const prev = dl[entryIndex - 1];
    result.hasEcommerceReset = prev && prev.ecommerce === null;
    if (!result.hasEcommerceReset) result.eventLevelIssues.push("Pas de reset {ecommerce: null} avant ce push");
  }

  // Champs parasites
  PARASITIC_FIELDS.forEach(f => {
    if (entry[f] !== undefined) result.parasiticFields.push(`${f} = ${JSON.stringify(entry[f]).substring(0, 100)}`);
  });
  if (entry.ecommerce && entry.ecommerce.checkout === null)
    result.parasiticFields.push("ecommerce.checkout = null (résidu UA)");

  // Items
  if (entry.ecommerce && Array.isArray(entry.ecommerce.items)) {
    result.itemsCount = entry.ecommerce.items.length;
    entry.ecommerce.items.forEach((item, idx) => result.itemAudits.push({ index: idx, ...auditItem(item, eventName) }));
  }

  // Vérifications spécifiques par event
  if (eventName === "add_to_cart" && entry.ecommerce) {
    const value = entry.ecommerce.value ?? entry.value;
    if (result.itemsCount > 0) {
      const it = entry.ecommerce.items[0];
      const expected = (it.price || 0) * (it.quantity || 1);
      if (value === undefined) result.eventLevelIssues.push("value ABSENT");
      else if (Math.abs(value - expected) > 0.01)
        result.eventLevelIssues.push(`value (${value}) ≠ price × quantity (${expected})`);
    }
  }
  if (eventName === "begin_checkout" && entry.ecommerce && "checkout" in entry.ecommerce && entry.ecommerce.checkout === null)
    result.eventLevelIssues.push("ecommerce.checkout = null (résidu UA)");
  if (eventName === "add_shipping_info" && entry.ecommerce && !entry.ecommerce.shipping_tier)
    result.eventLevelIssues.push("shipping_tier ABSENT");
  if (eventName === "add_payment_info" && entry.ecommerce && !entry.ecommerce.payment_type)
    result.eventLevelIssues.push("payment_type ABSENT");
  if (eventName === "purchase" && entry.ecommerce) {
    if (!entry.ecommerce.transaction_id || entry.ecommerce.transaction_id === false)
      result.eventLevelIssues.push(`transaction_id invalide: ${entry.ecommerce.transaction_id}`);
    if (entry.ecommerce.items && !Array.isArray(entry.ecommerce.items))
      result.eventLevelIssues.push("items est un objet {} au lieu d'un tableau []");
    if (entry.ecommerce.tax === undefined) result.eventLevelIssues.push("tax ABSENT");
    if (entry.ecommerce.shipping === undefined) result.eventLevelIssues.push("shipping ABSENT");
  }

  // Status final
  if (result.format === "GA4" && result.hasEventKey) {
    result.status = (result.eventLevelIssues.length === 0 && result.itemAudits.every(a => a.issues.length === 0) && result.parasiticFields.length === 0)
      ? "ok" : "anomalies";
  } else if (result.format === "UA") result.status = "ua_format";
  else if (!result.hasEventKey) result.status = "no_event_key";

  return result;
}

function printItemAudit(ia, prefix) {
  const d = ia.data;
  log(`${prefix}item_id: ${d.item_id || "❌"} | item_name: ${(d.item_name || "❌").toString().substring(0, 40)}`);
  log(`${prefix}item_brand: ${d.item_brand || "❌"} | price: ${d.price ?? "❌"} | currency: ${d.currency_item || "—"}`);
  log(`${prefix}cat1: ${d.item_category || "—"} | cat2: ${d.item_category2 || "—"} | cat3: ${d.item_category3 || "—"} | cat4: ${d.item_category4 || "—"}`);
  log(`${prefix}index: ${d.index ?? "—"} | quantity: ${d.quantity ?? "—"}`);
  if (d.item_list_id !== undefined) log(`${prefix}item_list_id: ${d.item_list_id || "❌"} | item_list_name: ${d.item_list_name || "❌"}`);
  ia.issues.forEach(iss => log(`${prefix}⚠️  ${iss}`));
}

// ═══════════════════════════════════════════
// AUDIT D'UN SITE COMPLET
// ═══════════════════════════════════════════
async function auditSite(browser, site) {
  const report = {
    site: site.name, url: site.url, currency: site.currency, timestamp: new Date().toISOString(),
    events: {}, globalChecks: { ecommerceResets: [], duplicates: [], uaFormat: [], parasiticFields: [] },
    rawDumps: {}, gtm: null,
  };

  logSection(`${site.name.toUpperCase()} — ${site.url} (${site.currency})`);

  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
  await page.setViewport({ width: 1440, height: 900 });

  const networkReqs = [];
  page.on("request", req => {
    const u = req.url();
    if (u.includes("/g/collect") || u.includes("/j/collect") || (u.includes("gtm.") && !u.includes("www.googletagmanager")))
      networkReqs.push(u.substring(0, 200));
  });

  let prodUrl = null;

  try {
    // ── ÉTAPE 1 : /shop ──────────────────────────
    log(`\n┌─ ÉTAPE 1 : PAGE LISTE (/shop) ─────────────────────`);

    await page.goto(site.url + "/shop", { waitUntil: "networkidle2", timeout: TIMEOUT });
    await new Promise(r => setTimeout(r, WAIT));
    let dl = await getDL(page);
    report.rawDumps.shop = dl;

    report.gtm = await page.evaluate(() => {
      const html = document.documentElement.innerHTML;
      const scripts = Array.from(document.querySelectorAll("script[src*='gtm']"));
      return {
        gtmIds: [...new Set(html.match(/GTM-[A-Z0-9]+/g) || [])],
        sgtmDomain: scripts.filter(s => !s.src.includes("www.googletagmanager.com")).map(s => s.src.match(/https?:\/\/([^/]+)/)?.[1]).filter(Boolean)[0] || null,
      };
    });
    log(`│ GTM: ${report.gtm.gtmIds.join(", ")} | sGTM: ${report.gtm.sgtmDomain || "non détecté"}`);

    const shopEcom = findAllEcommerce(dl);
    log(`│ dataLayer: ${dl.length} entrées, ${shopEcom.length} push(es) ecommerce`);

    shopEcom.forEach((m, i) => {
      const isUA = m.entry.ecommerce.impressions || m.entry.ecommerce.currencyCode;
      log(`│ Push #${i + 1}: event="${m.event || "❌ ABSENT"}" | format=${isUA ? "❌ UA" : Array.isArray(m.entry.ecommerce.items) ? "✅ GA4" : "?"}`);
      if (isUA) {
        const impCount = m.entry.ecommerce.impressions?.length || 0;
        log(`│   ${impCount} impressions, currencyCode="${m.entry.ecommerce.currencyCode}"`);
        report.globalChecks.uaFormat.push({ page: "/shop", event: m.event, detail: `UA impressions (${impCount} produits)` });
      }
      PARASITIC_FIELDS.forEach(f => {
        if (m.entry[f] !== undefined) { log(`│   ⚠️ Parasite: ${f}`); report.globalChecks.parasiticFields.push({ page: "/shop", field: f }); }
      });
      if (m.event === "view_item_list") {
        const audit = auditPush(m.entry, "view_item_list", dl, m.index, site.currency);
        log(`│   items: ${audit.itemsCount} | reset: ${audit.hasEcommerceReset ? "✅" : "❌"}`);
        audit.eventLevelIssues.forEach(iss => log(`│   ⚠️ ${iss}`));
        if (audit.itemAudits.length > 0) { log(`│   Premier item :`); printItemAudit(audit.itemAudits[0], "│     "); }
      }
    });

    // ── select_item (clic produit) ──
    log(`├─ CLIC PRODUIT → select_item ─────────────────`);
    const dlBeforeClick = dl.length;
    prodUrl = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a[href]"));
      const l = links.find(a => /\/shop\/[a-zA-Z0-9].*-\d+$/.test((a.href || "").split("?")[0].split("#")[0]));
      if (l) { l.click(); return l.href; }
      return null;
    });

    if (prodUrl) {
      log(`│ Clic sur: ${prodUrl.split("/shop/")[1] || prodUrl}`);
      await new Promise(r => setTimeout(r, 3000));
      dl = await getDL(page);
      const newEntries = dl.slice(dlBeforeClick);
      const selectItemM = newEntries.filter(e => e.event === "select_item");
      const productClickM = newEntries.filter(e => e.event === "productClick");

      if (selectItemM.length > 0) {
        log(`│ ✅ select_item (${selectItemM.length}x)`);
        const audit = auditPush(selectItemM[0], "select_item", dl, dl.indexOf(selectItemM[0]), site.currency);
        report.events.select_item = audit;
        audit.eventLevelIssues.forEach(iss => log(`│   ⚠️ ${iss}`));
        if (audit.itemAudits.length > 0) printItemAudit(audit.itemAudits[0], "│   ");
        if (selectItemM.length > 1) { log(`│   ⚠️ DOUBLON ×${selectItemM.length}`); report.globalChecks.duplicates.push({ event: "select_item", count: selectItemM.length }); }
      } else if (productClickM.length > 0) {
        log(`│ ⚠️ productClick (UA) au lieu de select_item (GA4)`);
        report.events.select_item = { status: "ua_format", format: "UA", eventLevelIssues: ["Nommage UA 'productClick'"], rawPush: productClickM[0] };
      } else {
        log(`│ ❌ Aucun select_item`);
        log(`│   Events après clic: ${newEntries.filter(e => e.event).map(e => e.event).join(", ") || "aucun"}`);
        report.events.select_item = { status: "absent" };
      }
    } else {
      log(`│ ❌ Aucun lien produit trouvé`);
      report.events.select_item = { status: "absent" };
    }

    // ── ÉTAPE 2 : PAGE PRODUIT ──
    log(`\n┌─ ÉTAPE 2 : PAGE PRODUIT (view_item) ─────────`);

    if (prodUrl) {
      await page.goto(prodUrl, { waitUntil: "networkidle2", timeout: TIMEOUT });
      await new Promise(r => setTimeout(r, WAIT));
      dl = await getDL(page);
      report.rawDumps.product = dl;

      const displayedPrice = await page.evaluate(() => {
        const el = document.querySelector(".product_price .oe_price .oe_currency_value") ||
                   document.querySelector(".product_price .oe_currency_value") ||
                   document.querySelector("[itemprop='price']") ||
                   document.querySelector(".product_price");
        if (el) { const raw = el.textContent.replace(/[^0-9.,]/g, "").replace(",", ""); return parseFloat(raw) || null; }
        return null;
      });
      log(`│ URL: ${page.url().substring(0, 80)}`);
      log(`│ Prix affiché: ${displayedPrice ? "$" + displayedPrice : "non détecté"}`);

      const viewItemM = findEvent(dl, "view_item");
      if (viewItemM.length > 0) {
        log(`│ ✅ view_item (${viewItemM.length}x)`);
        const audit = auditPush(viewItemM[0].entry, "view_item", dl, viewItemM[0].index, site.currency);
        report.events.view_item = audit;
        audit.eventLevelIssues.forEach(iss => log(`│   ⚠️ ${iss}`));
        if (audit.itemAudits.length > 0) {
          printItemAudit(audit.itemAudits[0], "│   ");
          if (displayedPrice && audit.itemAudits[0].data.price) {
            const diff = Math.abs(audit.itemAudits[0].data.price - displayedPrice);
            log(`│   ${diff <= 1 ? "✅" : "⚠️"} Prix DL (${audit.itemAudits[0].data.price}) vs affiché (${displayedPrice})`);
          }
        }
        audit.parasiticFields.forEach(f => log(`│   ⚠️ Parasite: ${f}`));
        if (viewItemM.length > 1) { log(`│   ⚠️ DOUBLON ×${viewItemM.length}`); report.globalChecks.duplicates.push({ event: "view_item", count: viewItemM.length }); }
      } else {
        log(`│ ❌ Aucun view_item`);
        findAllEcommerce(dl).forEach(m => log(`│   Push ecom: event="${m.event || "ABSENT"}"`));
        report.events.view_item = { status: "absent" };
      }

      // Vérifier format UA résiduel sur page produit
      findAllEcommerce(dl).forEach(m => {
        if (m.entry.ecommerce.detail || m.entry.ecommerce.currencyCode)
          report.globalChecks.uaFormat.push({ page: "product", event: m.event, detail: "detail/currencyCode UA" });
      });

      // ── ÉTAPE 3 : ADD TO CART ──
      log(`\n┌─ ÉTAPE 3 : ADD TO CART ─────────────────────`);

      const dlBeforeATC = dl.length;
      const atcResult = await page.evaluate(() => {
        const btn = document.querySelector("#add_to_cart") || document.querySelector("a#add_to_cart") ||
                    document.querySelector("form[action*='/cart/update'] button[type=submit]");
        if (btn) { btn.click(); return { found: true, sel: btn.id ? "#" + btn.id : btn.tagName, text: (btn.textContent || "").trim().substring(0, 50) }; }
        return { found: false };
      });
      log(`│ Bouton: ${atcResult.found ? "✅ " + atcResult.sel + " (\"" + atcResult.text + "\")" : "❌ non trouvé"}`);

      if (atcResult.found) {
        await new Promise(r => setTimeout(r, WAIT));
        dl = await getDL(page);
        const atcM = dl.slice(dlBeforeATC).filter(e => e.event === "add_to_cart");

        if (atcM.length > 0) {
          log(`│ ✅ add_to_cart (${atcM.length}x)`);
          const audit = auditPush(atcM[0], "add_to_cart", dl, dl.indexOf(atcM[0]), site.currency);
          report.events.add_to_cart = audit;
          audit.eventLevelIssues.forEach(iss => log(`│   ⚠️ ${iss}`));
          if (audit.itemAudits.length > 0) printItemAudit(audit.itemAudits[0], "│   ");
          if (atcM[0].ecommerce) log(`│   value: ${atcM[0].ecommerce.value !== undefined ? atcM[0].ecommerce.value : "❌ ABSENT"}`);
          audit.parasiticFields.forEach(f => log(`│   ⚠️ Parasite: ${f}`));
          log(`│\n│   === RAW PUSH ===`);
          log(JSON.stringify(atcM[0], null, 2).split("\n").map(l => "│   " + l).join("\n"));
          if (atcM.length > 1) { log(`│   ⚠️ DOUBLON ×${atcM.length}`); report.globalChecks.duplicates.push({ event: "add_to_cart", count: atcM.length }); }
        } else {
          log(`│ ❌ Aucun add_to_cart`);
          report.events.add_to_cart = { status: "absent" };
        }
      } else {
        report.events.add_to_cart = { status: "absent", note: "Bouton non trouvé" };
      }

      // ── ÉTAPE 4 : PANIER ──
      log(`\n┌─ ÉTAPE 4 : PANIER (/shop/cart) ────────────`);

      await page.goto(site.url + "/shop/cart", { waitUntil: "networkidle2", timeout: TIMEOUT });
      await new Promise(r => setTimeout(r, WAIT));
      dl = await getDL(page);
      report.rawDumps.cart = dl;

      const cartItemCount = await page.evaluate(() => {
        const rows = document.querySelectorAll("table.table tbody tr, .cart_line, .o_cart_product, tr.o_cart_product");
        return Array.from(rows).filter(r => r.querySelector("a") || r.querySelector("td")).length;
      });
      log(`│ URL: ${page.url()}`);
      log(`│ Articles visuels dans le panier: ${cartItemCount}`);

      const viewCartM = findEvent(dl, "view_cart");
      if (viewCartM.length > 0) {
        log(`│ ✅ view_cart (${viewCartM.length}x)`);
        const audit = auditPush(viewCartM[0].entry, "view_cart", dl, viewCartM[0].index, site.currency);
        report.events.view_cart = audit;
        audit.eventLevelIssues.forEach(iss => log(`│   ⚠️ ${iss}`));
        log(`│   items DL: ${audit.itemsCount} vs visuels: ${cartItemCount}`);
        if (cartItemCount > 0 && audit.itemsCount !== cartItemCount)
          log(`│   ⚠️ Incohérence items DL vs panier visuel`);
        audit.itemAudits.forEach((ia, idx) => { log(`│   Item #${idx}:`); printItemAudit(ia, "│     "); });
      } else {
        log(`│ ❌ Aucun view_cart`);
        findAllEcommerce(dl).forEach(m => log(`│   Push ecom: event="${m.event || "ABSENT"}"`));
        report.events.view_cart = { status: "absent" };
      }

      // UA résiduel sur panier
      findAllEcommerce(dl).forEach(m => {
        if (m.entry.ecommerce.impressions || m.entry.ecommerce.currencyCode || m.entry.ecommerce.checkout)
          report.globalChecks.uaFormat.push({ page: "/shop/cart", event: m.event, detail: Object.keys(m.entry.ecommerce).join(", ") });
      });

      // ── ÉTAPE 5 : CHECKOUT ──
      log(`\n┌─ ÉTAPE 5 : CHECKOUT (begin_checkout) ──────`);

      const dlBeforeCO = dl.length;
      const coResult = await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll("a, button"));
        const co = all.find(e => ((e.textContent || "").toLowerCase().includes("checkout") || (e.textContent || "").toLowerCase().includes("process") || (e.href || "").includes("checkout")) && e.offsetParent !== null);
        if (co) { co.click(); return { found: true, text: (co.textContent || "").trim().substring(0, 50), href: co.href || "" }; }
        return { found: false };
      });
      log(`│ Bouton: ${coResult.found ? "✅ \"" + coResult.text + "\"" : "❌ non trouvé"}`);

      if (coResult.found) {
        await new Promise(r => setTimeout(r, WAIT));
        const curUrl = page.url();
        log(`│ URL: ${curUrl}`);

        if (curUrl.includes("checkout") || curUrl.includes("payment")) {
          dl = await getDL(page);
          report.rawDumps.checkout = dl;

          const beginM = findEvent(dl, "begin_checkout");
          const checkoutM = findEvent(dl, "checkout");

          if (beginM.length > 0) {
            log(`│ ✅ begin_checkout (${beginM.length}x)`);
            const audit = auditPush(beginM[0].entry, "begin_checkout", dl, beginM[0].index, site.currency);
            report.events.begin_checkout = audit;
            audit.eventLevelIssues.forEach(iss => log(`│   ⚠️ ${iss}`));
            audit.itemAudits.forEach((ia, idx) => { log(`│   Item #${idx}:`); printItemAudit(ia, "│     "); });
          } else if (checkoutM.length > 0) {
            log(`│ ⚠️ 'checkout' (UA naming) au lieu de 'begin_checkout'`);
            report.events.begin_checkout = { status: "ua_format", eventLevelIssues: ["Nommé 'checkout' au lieu de 'begin_checkout'"], rawPush: checkoutM[0].entry };
          } else {
            log(`│ ❌ Aucun begin_checkout`);
            report.events.begin_checkout = { status: "absent" };
          }

          const shipM = findEvent(dl, "add_shipping_info");
          const payM = findEvent(dl, "add_payment_info");
          log(`│ add_shipping_info: ${shipM.length > 0 ? "✅" : "⏭️ non testable (interaction formulaire)"}`);
          log(`│ add_payment_info: ${payM.length > 0 ? "✅" : "⏭️ non testable (interaction formulaire)"}`);
          report.events.add_shipping_info = shipM.length > 0
            ? auditPush(shipM[0].entry, "add_shipping_info", dl, shipM[0].index, site.currency)
            : { status: "untestable", note: "Nécessite interaction formulaire" };
          report.events.add_payment_info = payM.length > 0
            ? auditPush(payM[0].entry, "add_payment_info", dl, payM[0].index, site.currency)
            : { status: "untestable", note: "Nécessite interaction formulaire" };
        } else {
          log(`│ ⚠️ Redirection vers: ${curUrl} (login requis ?)`);
          report.events.begin_checkout = { status: "untestable", note: "Redirection " + curUrl };
          report.events.add_shipping_info = { status: "untestable" };
          report.events.add_payment_info = { status: "untestable" };
        }
      } else {
        report.events.begin_checkout = { status: "absent", note: "Bouton non trouvé" };
        report.events.add_shipping_info = { status: "untestable" };
        report.events.add_payment_info = { status: "untestable" };
      }

      log(`│ purchase: ⏭️ Non testable (transaction réelle requise)`);
      report.events.purchase = { status: "untestable", note: "Transaction réelle requise" };
    }

    // ── VÉRIFICATIONS GLOBALES ──
    log(`\n┌─ VÉRIFICATIONS GLOBALES ────────────────────`);

    ["shop", "product", "cart", "checkout"].forEach(pg => {
      const pgDl = report.rawDumps[pg];
      if (!pgDl) return;
      let pushes = 0, resets = 0;
      pgDl.forEach((entry, idx) => {
        if (entry.ecommerce && entry.ecommerce !== null) {
          pushes++;
          if (idx > 0 && pgDl[idx - 1].ecommerce === null) resets++;
        }
      });
      report.globalChecks.ecommerceResets.push({ page: pg, pushes, resets, ok: pushes === resets });
      log(`│ Reset ecommerce /${pg}: ${resets}/${pushes} ${pushes === resets ? "✅" : "❌"}`);
    });

    if (report.globalChecks.duplicates.length > 0) {
      log(`│ Doublons:`);
      report.globalChecks.duplicates.forEach(d => log(`│   ⚠️ ${d.event} ×${d.count}`));
    } else log(`│ Doublons: ✅ aucun`);

    if (report.globalChecks.uaFormat.length > 0) {
      log(`│ Format UA résiduel:`);
      report.globalChecks.uaFormat.forEach(u => log(`│   ❌ ${u.page} — ${u.detail}`));
    } else log(`│ Format UA: ✅ aucun`);

    log(`│ sGTM hits: ${networkReqs.length}`);

    // ── BILAN ──
    log(`\n┌─ BILAN ${site.name} ─────────────────────────`);
    let score = 0, total = 0;
    EVENTS_CHECKLIST.forEach(ev => {
      total++;
      const r = report.events[ev];
      let icon, text;
      if (!r || r.status === "absent") { icon = "❌"; text = "Absent"; }
      else if (r.status === "ok") { icon = "✅"; text = "Correct"; score++; }
      else if (r.status === "anomalies") { icon = "⚠️"; text = `Anomalies (${r.eventLevelIssues?.length || 0})`; score += 0.5; }
      else if (r.status === "ua_format") { icon = "⚠️"; text = "Format UA"; score += 0.25; }
      else if (r.status === "untestable") { icon = "⏭️"; text = r.note || "Non testable"; total--; }
      else if (r.status === "no_event_key") { icon = "❌"; text = "Pas de clé event"; }
      else { icon = "?"; text = r.status || "?"; }
      log(`│ ${icon} ${ev.padEnd(22)} ${text}`);
    });
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    log(`│\n│ SCORE: ${score}/${total} (${pct}%)`);
    report.score = { value: score, total, percentage: pct };

  } catch (err) {
    log(`│ ERREUR: ${err.message}`);
  }

  await page.close();
  return report;
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════
(async () => {
  logSection(`AUDIT V3 — Coastal Offroad — ${new Date().toLocaleString("fr-FR")}`);
  log(`  4 sites | ${EVENTS_CHECKLIST.length} events | Audit qualité GA4 complet`);

  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const allReports = [];

  for (const site of SITES) {
    const r = await auditSite(browser, site);
    allReports.push(r);
  }

  await browser.close();

  // ═══════════════════════════════════════════
  // TABLEAU COMPARATIF FINAL
  // ═══════════════════════════════════════════
  logSection("TABLEAU COMPARATIF — 4 SITES");

  const header = "Event".padEnd(24) + SITES.map(s => s.name.padStart(8)).join("");
  log(`\n  ${header}`);
  log(`  ${"─".repeat(header.length)}`);

  EVENTS_CHECKLIST.forEach(ev => {
    const cols = allReports.map(r => {
      const e = r.events[ev];
      if (!e || e.status === "absent") return "   ❌   ";
      if (e.status === "ok") return "   ✅   ";
      if (e.status === "anomalies") return "   ⚠️   ";
      if (e.status === "ua_format") return "  UA⚠️  ";
      if (e.status === "untestable") return "   ⏭️   ";
      return "   ?    ";
    }).join("");
    log(`  ${ev.padEnd(24)}${cols}`);
  });

  log(`\n  ${"─".repeat(header.length)}`);
  log(`  ${"SCORE".padEnd(24)}${allReports.map(r => `${r.score ? r.score.percentage + "%" : "?"}`).map(s => s.padStart(8)).join("")}`);

  log(`\n  UA résiduel:`.padEnd(24));
  allReports.forEach(r => log(`    ${r.site}: ${r.globalChecks.uaFormat.length > 0 ? "❌ " + r.globalChecks.uaFormat.length + " push(es)" : "✅ aucun"}`));

  log(`\n  Resets ecommerce:`);
  allReports.forEach(r => {
    const bad = r.globalChecks.ecommerceResets.filter(e => !e.ok);
    log(`    ${r.site}: ${bad.length === 0 ? "✅ tous OK" : "❌ " + bad.map(b => b.page + " " + b.resets + "/" + b.pushes).join(", ")}`);
  });

  logSection("AUDIT V3 TERMINÉ");

  // Pas de fichier, résultats en console uniquement
})();
