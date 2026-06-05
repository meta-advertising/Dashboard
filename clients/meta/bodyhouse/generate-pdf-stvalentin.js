const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Viewport A4 paysage en pixels (297mm x 210mm @ 96dpi)
  await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 });

  const filePath = path.resolve(__dirname, 'rapport-bodyhouse-skeepers-stvalentin.html');
  await page.goto('file://' + filePath, { waitUntil: 'networkidle0', timeout: 30000 });

  // Attendre que le contenu JS soit rendu
  await page.waitForSelector('.page', { timeout: 10000 });

  // Injecter du CSS print optimisé pour des pages propres
  await page.addStyleTag({ content: `
    @page {
      size: A4 landscape;
      margin: 10mm 14mm;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    body {
      background: #fef5f7 !important;
    }

    /* Cover = page 1 entière */
    .cover {
      height: 100vh !important;
      min-height: 100vh !important;
      page-break-after: always !important;
      break-after: page !important;
    }

    /* Chaque section = 1 page */
    .page {
      page-break-before: always !important;
      break-before: page !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      padding: 20px 30px !important;
      max-width: 100% !important;
    }

    /* Empêcher les tableaux de se couper */
    .tbl-wrap {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    table {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Empêcher les KPIs de se couper */
    .kpis {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Analysis block reste avec le tableau */
    .analysis {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Ranking et bars ne se coupent pas */
    .ranking {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .bout-bars {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Section header reste avec son contenu */
    .sh {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    /* No data block */
    .no-data {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Adapter les tailles pour le print */
    .kpis {
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 10px !important;
    }

    .kpi {
      padding: 16px 16px !important;
    }

    .kpi .kv {
      font-size: 1.3rem !important;
    }

    .kpi .kl {
      margin-bottom: 4px !important;
    }

    .kpis {
      margin-bottom: 18px !important;
    }

    .exec-title {
      font-size: 1.5rem !important;
    }

    .sh {
      margin-bottom: 18px !important;
      padding-bottom: 10px !important;
    }

    .sh h2 {
      font-size: 1.2rem !important;
    }

    /* Tableaux plus compacts pour tenir sur 1 page */
    th {
      padding: 6px 8px !important;
      font-size: 0.62rem !important;
    }

    td {
      padding: 5px 8px !important;
      font-size: 0.73rem !important;
    }

    .tbl-wrap {
      margin-bottom: 14px !important;
    }

    /* Rank items plus compacts */
    .rank-item {
      margin-bottom: 8px !important;
    }

    .rank-name {
      font-size: 0.78rem !important;
    }

    .rank-val {
      font-size: 0.72rem !important;
    }

    /* Boutique bars plus compacts */
    .bb-item {
      margin-bottom: 7px !important;
    }

    /* Analysis plus compact */
    .analysis {
      padding: 12px 16px !important;
      font-size: 0.75rem !important;
      line-height: 1.5 !important;
      margin-bottom: 0 !important;
    }

    /* Hearts en print statiques */
    .hearts span {
      animation: none !important;
      opacity: 0.1 !important;
    }
  `});

  // Petit délai pour que le CSS injecté soit appliqué
  await new Promise(r => setTimeout(r, 500));

  const outputPath = path.resolve(__dirname, 'rapport-skeepers-bodyhouse-stvalentin-2026.pdf');

  await page.pdf({
    path: outputPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '10mm',
      bottom: '10mm',
      left: '14mm',
      right: '14mm'
    },
    displayHeaderFooter: false
  });

  console.log('PDF généré :', outputPath);
  await browser.close();
})();
