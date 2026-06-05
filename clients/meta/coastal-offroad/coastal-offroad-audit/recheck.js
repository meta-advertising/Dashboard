const puppeteer = require("puppeteer");

const SITES = [
  { name: "US", url: "https://coastaloffroad.com" },
  { name: "NZ", url: "https://coastaloffroad.co.nz" },
  { name: "AU", url: "https://coastaloffroadbumpers.com.au" },
  { name: "CA", url: "https://coastaloffroad.ca" },
];

async function getDL(page) {
  return page.evaluate(() =>
    window.dataLayer ? JSON.parse(JSON.stringify(window.dataLayer)) : []
  );
}

async function findProduct(page) {
  return page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a[href]"));
    const l = links.find((a) =>
      /\/shop\/[a-zA-Z0-9].*-\d+$/.test((a.href || "").split("?")[0])
    );
    if (l) return l.href;
    const l2 = links.find((a) => /\/products\/[a-zA-Z0-9]/.test(a.href || ""));
    return l2 ? l2.href : null;
  });
}

async function clickATC(page) {
  return page.evaluate(() => {
    const btns = Array.from(
      document.querySelectorAll("button, a.btn, input[type=submit]")
    );
    const b = btns.find((el) => {
      const t = (el.textContent || el.value || "").toLowerCase();
      return t.includes("add to cart") || t.includes("ajouter");
    });
    if (b) {
      b.click();
      return true;
    }
    return false;
  });
}

function describeEcom(entries) {
  const ecom = entries.filter(
    (e) =>
      e.ecommerce ||
      (e.event &&
        (e.event.includes("view") ||
          e.event.includes("item") ||
          e.event.includes("list") ||
          e.event.includes("cart") ||
          e.event.includes("checkout") ||
          e.event.includes("purchase") ||
          e.event.includes("select") ||
          e.event.includes("add")))
  );
  return ecom;
}

function logEcom(ecom) {
  if (ecom.length === 0) {
    console.log("  (aucun event ecommerce)");
    return;
  }
  ecom.forEach((e) => {
    const hasItems = e.ecommerce && e.ecommerce.items;
    const hasImpressions = e.ecommerce && e.ecommerce.impressions;
    const hasDetail = e.ecommerce && e.ecommerce.detail;
    const hasAdd = e.ecommerce && e.ecommerce.add;
    let fmt = "unknown";
    if (hasItems) fmt = "GA4";
    else if (hasImpressions || hasDetail || hasAdd || (e.ecommerce && e.ecommerce.currencyCode)) fmt = "UA";

    let info = `  -> event="${e.event || "(none)"}" | format=${fmt}`;
    if (hasItems) info += ` | items=${e.ecommerce.items.length}`;
    if (hasImpressions) info += ` | impressions=${e.ecommerce.impressions.length}`;
    console.log(info);

    if (hasItems && e.ecommerce.items[0]) {
      const it = e.ecommerce.items[0];
      console.log(
        `     item_id=${it.item_id || "MISSING"} | item_name=${it.item_name || "MISSING"} | price=${it.price ?? "MISSING"} | currency=${e.ecommerce.currency || it.currency || "MISSING"}`
      );
    }
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  for (const site of SITES) {
    console.log("\n" + "=".repeat(70));
    console.log(`SITE: ${site.name} (${site.url})`);
    console.log("=".repeat(70));

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    );
    await page.setViewport({ width: 1440, height: 900 });

    try {
      // HOMEPAGE
      await page.goto(site.url, { waitUntil: "networkidle2", timeout: 15000 });
      await new Promise((r) => setTimeout(r, 3000));
      let dl = await getDL(page);
      let allEvents = dl.filter((e) => e.event).map((e) => e.event);
      let ecom = describeEcom(dl);
      console.log("\n--- HOMEPAGE ---");
      console.log(`dataLayer entries: ${dl.length}`);
      console.log(`Tous les events: ${allEvents.join(", ") || "(aucun)"}`);
      console.log(`Events ecommerce: ${ecom.length}`);
      logEcom(ecom);

      // PRODUCT PAGE
      let prodUrl = await findProduct(page);
      if (!prodUrl) {
        await page.goto(site.url + "/shop", {
          waitUntil: "networkidle2",
          timeout: 15000,
        });
        await new Promise((r) => setTimeout(r, 2000));
        prodUrl = await findProduct(page);
      }

      if (prodUrl) {
        console.log("\n--- FICHE PRODUIT ---");
        console.log(`URL: ${prodUrl}`);
        await page.goto(prodUrl, { waitUntil: "networkidle2", timeout: 15000 });
        await new Promise((r) => setTimeout(r, 3000));
        dl = await getDL(page);
        allEvents = dl.filter((e) => e.event).map((e) => e.event);
        ecom = describeEcom(dl);
        console.log(`dataLayer entries: ${dl.length}`);
        console.log(`Tous les events: ${allEvents.join(", ") || "(aucun)"}`);
        console.log(`Events ecommerce: ${ecom.length}`);
        logEcom(ecom);

        // ADD TO CART
        console.log("\n--- ADD TO CART ---");
        const beforeLen = dl.length;
        const clicked = await clickATC(page);
        console.log(`Bouton trouve et clique: ${clicked}`);
        await new Promise((r) => setTimeout(r, 3000));
        dl = await getDL(page);
        const newEntries = dl.slice(beforeLen);
        const atcEvents = newEntries.filter(
          (e) => e.ecommerce || (e.event && (e.event.includes("cart") || e.event.includes("add")))
        );
        console.log(`Nouvelles entries: ${newEntries.length}`);
        console.log(`Events add_to_cart: ${atcEvents.length}`);
        logEcom(atcEvents);
        // Log all new events anyway
        if (newEntries.length > 0 && atcEvents.length === 0) {
          console.log("  Tous les new events: " + newEntries.filter(e=>e.event).map(e=>e.event).join(", "));
        }
      } else {
        console.log("\n--- FICHE PRODUIT ---");
        console.log("ERREUR: Aucun lien produit trouve");
      }

      // CART
      console.log("\n--- PANIER ---");
      try {
        await page.goto(site.url + "/shop/cart", {
          waitUntil: "networkidle2",
          timeout: 15000,
        });
        await new Promise((r) => setTimeout(r, 3000));
        dl = await getDL(page);
        allEvents = dl.filter((e) => e.event).map((e) => e.event);
        ecom = describeEcom(dl);
        console.log(`URL: ${page.url()}`);
        console.log(`dataLayer entries: ${dl.length}`);
        console.log(`Tous les events: ${allEvents.join(", ") || "(aucun)"}`);
        console.log(`Events ecommerce: ${ecom.length}`);
        logEcom(ecom);
      } catch (err) {
        console.log("Erreur: " + err.message);
      }
    } catch (err) {
      console.log("ERREUR FATALE: " + err.message);
    }

    await page.close();
  }

  await browser.close();
  console.log("\n" + "=".repeat(70));
  console.log("AUDIT TERMINE");
})();
