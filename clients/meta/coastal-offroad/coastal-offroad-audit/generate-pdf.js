const puppeteer = require("puppeteer");
const { marked } = require("marked");
const fs = require("fs");
const path = require("path");

async function generatePDF() {
  const mdPath = path.join(__dirname, "..", "coastal-offroad-datalayer-audit.md");
  const pdfPath = path.join(__dirname, "..", "coastal-offroad-datalayer-audit.pdf");

  const mdContent = fs.readFileSync(mdPath, "utf-8");
  const htmlBody = marked(mdContent);

  const fullHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  @page {
    margin: 20mm 18mm 20mm 18mm;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 11px;
    line-height: 1.55;
    color: #1a1a1a;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }
  h1 {
    font-size: 22px;
    color: #111;
    border-bottom: 3px solid #2563eb;
    padding-bottom: 10px;
    margin-bottom: 6px;
    margin-top: 0;
  }
  h2 {
    font-size: 17px;
    color: #1e40af;
    border-bottom: 2px solid #dbeafe;
    padding-bottom: 6px;
    margin-top: 28px;
    margin-bottom: 10px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 14px;
    color: #1e3a5f;
    margin-top: 18px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }
  h4 {
    font-size: 12px;
    color: #374151;
    margin-top: 14px;
    margin-bottom: 4px;
    page-break-after: avoid;
  }
  p {
    margin: 4px 0 8px 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 10px;
    page-break-inside: avoid;
  }
  th {
    background-color: #1e40af;
    color: white;
    padding: 7px 8px;
    text-align: left;
    font-weight: 600;
    font-size: 10px;
  }
  td {
    padding: 6px 8px;
    border-bottom: 1px solid #e5e7eb;
    vertical-align: top;
  }
  tr:nth-child(even) {
    background-color: #f8fafc;
  }
  tr:hover {
    background-color: #eff6ff;
  }
  code {
    background-color: #f1f5f9;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 10px;
    font-family: "SF Mono", "Fira Code", "Consolas", monospace;
    color: #be185d;
  }
  pre {
    background-color: #1e293b;
    color: #e2e8f0;
    padding: 12px 14px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 9.5px;
    line-height: 1.5;
    margin: 8px 0;
    page-break-inside: avoid;
  }
  pre code {
    background: none;
    color: #e2e8f0;
    padding: 0;
    font-size: 9.5px;
  }
  ul, ol {
    margin: 4px 0 8px 0;
    padding-left: 22px;
  }
  li {
    margin-bottom: 3px;
  }
  li ul {
    margin-top: 2px;
    margin-bottom: 2px;
  }
  hr {
    border: none;
    border-top: 1px solid #cbd5e1;
    margin: 20px 0;
  }
  strong {
    color: #111827;
  }
  details {
    margin: 8px 0;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px 12px;
    page-break-inside: avoid;
  }
  summary {
    cursor: pointer;
    font-weight: 600;
    color: #475569;
    font-size: 11px;
  }
  blockquote {
    border-left: 3px solid #2563eb;
    margin: 8px 0;
    padding: 6px 12px;
    background: #eff6ff;
    color: #1e3a5f;
  }
  /* Keyword highlighting in code blocks */
  .comment { color: #6b7280; }
</style>
</head>
<body>
${htmlBody}
</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(fullHTML, { waitUntil: "networkidle0" });

  // Open all <details> elements so content appears in PDF
  await page.evaluate(() => {
    document.querySelectorAll("details").forEach((d) => d.setAttribute("open", ""));
  });

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size:8px; color:#94a3b8; width:100%; text-align:center; padding:0 20mm;">
        Audit dataLayer eCommerce - Coastal Offroad
      </div>`,
    footerTemplate: `
      <div style="font-size:8px; color:#94a3b8; width:100%; display:flex; justify-content:space-between; padding:0 20mm;">
        <span>Confidentiel</span>
        <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`,
    margin: {
      top: "30mm",
      bottom: "25mm",
      left: "18mm",
      right: "18mm",
    },
  });

  await browser.close();
  console.log(`PDF genere: ${pdfPath}`);
}

generatePDF().catch(console.error);
