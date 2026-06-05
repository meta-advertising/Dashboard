const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const rawData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "audit-raw-results.json"), "utf-8")
);

// ─── Data extraction ────────────────────────────────────────────
const sites = rawData.map((r) => {
  const currency = r.steps[0]?.ecommerceEvents?.[0]?.raw?.ecommerce?.currencyCode || "N/A";
  const impressionCount = r.steps[0]?.ecommerceEvents?.[0]?.raw?.ecommerce?.impressions?.length || 0;
  const productUrl = r.steps.find((s) => s.step === "Product Page")?.url || "N/A";
  const cartUrl = r.steps.find((s) => s.step === "Cart / Checkout")?.url || "N/A";
  const addToCartFound = r.steps.find((s) => s.step === "Add to Cart")?.buttonFound || false;
  const productDLEntries = r.steps.find((s) => s.step === "Product Page")?.dataLayerLength || 0;
  const cartDLEntries = r.steps.find((s) => s.step === "Cart / Checkout")?.dataLayerLength || 0;

  return {
    name: r.name,
    url: r.url,
    gtm: r.gtmDetected,
    gtmId: r.gtmId || "N/A",
    dataLayer: r.dataLayerExists,
    currency,
    impressionCount,
    productUrl,
    cartUrl,
    addToCartFound,
    productDLEntries,
    cartDLEntries,
    homepageDLEntries: r.steps[0]?.dataLayerLength || 0,
    format: r.steps[0]?.ecommerceEvents?.[0]?.isUA ? "UA" : r.steps[0]?.ecommerceEvents?.[0]?.isGA4 ? "GA4" : "N/A",
    hasEventKey: r.steps[0]?.ecommerceEvents?.[0]?.hasEventKey || false,
  };
});

// ─── HTML Template ──────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

  :root {
    --primary: #0f172a;
    --accent: #6366f1;
    --accent-light: #818cf8;
    --accent-bg: #eef2ff;
    --success: #10b981;
    --success-bg: #ecfdf5;
    --danger: #ef4444;
    --danger-bg: #fef2f2;
    --warning: #f59e0b;
    --warning-bg: #fffbeb;
    --info: #3b82f6;
    --info-bg: #eff6ff;
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-300: #cbd5e1;
    --gray-400: #94a3b8;
    --gray-500: #64748b;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1e293b;
    --gray-900: #0f172a;
    --radius: 12px;
    --shadow: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow-md: 0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -2px rgba(0,0,0,.05);
  }

  @page { margin: 0; }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 10px;
    line-height: 1.6;
    color: var(--gray-800);
    background: white;
  }

  /* ── COVER PAGE ─────────────────────────────── */
  .cover {
    width: 100%;
    height: 100vh;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    page-break-after: always;
  }
  .cover::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(99,102,241,.15) 0%, transparent 70%);
    border-radius: 50%;
  }
  .cover::after {
    content: '';
    position: absolute;
    bottom: -150px;
    left: -150px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(16,185,129,.1) 0%, transparent 70%);
    border-radius: 50%;
  }
  .cover-content {
    text-align: center;
    z-index: 1;
    padding: 0 60px;
  }
  .cover-badge {
    display: inline-block;
    background: rgba(99,102,241,.2);
    border: 1px solid rgba(99,102,241,.3);
    color: #a5b4fc;
    padding: 6px 20px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 32px;
  }
  .cover h1 {
    color: white;
    font-size: 42px;
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 16px;
    letter-spacing: -1px;
  }
  .cover h1 span { color: var(--accent-light); }
  .cover-sub {
    color: var(--gray-400);
    font-size: 16px;
    font-weight: 400;
    line-height: 1.6;
    margin-bottom: 48px;
  }
  .cover-meta {
    display: flex;
    gap: 40px;
    justify-content: center;
    margin-top: 24px;
  }
  .cover-meta-item {
    text-align: center;
  }
  .cover-meta-value {
    color: white;
    font-size: 28px;
    font-weight: 800;
  }
  .cover-meta-label {
    color: var(--gray-400);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-weight: 600;
    margin-top: 4px;
  }
  .cover-footer {
    position: absolute;
    bottom: 40px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 50px;
    z-index: 1;
  }
  .cover-footer span {
    color: var(--gray-500);
    font-size: 10px;
    font-weight: 500;
  }

  /* ── PAGE WRAPPER ───────────────────────────── */
  .page {
    padding: 40px 44px;
    page-break-before: always;
  }
  .page:first-of-type { page-break-before: auto; }

  /* ── SECTION HEADERS ────────────────────────── */
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 2px solid var(--gray-200);
  }
  .section-number {
    width: 32px;
    height: 32px;
    background: var(--accent);
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14px;
    flex-shrink: 0;
  }
  .section-title {
    font-size: 20px;
    font-weight: 800;
    color: var(--gray-900);
    letter-spacing: -0.5px;
  }
  .section-subtitle {
    font-size: 10px;
    color: var(--gray-500);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 2px;
  }

  /* ── KPI CARDS ──────────────────────────────── */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 28px;
  }
  .kpi-card {
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius);
    padding: 18px 16px;
    text-align: center;
    box-shadow: var(--shadow);
  }
  .kpi-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
    font-size: 18px;
  }
  .kpi-value {
    font-size: 26px;
    font-weight: 800;
    color: var(--gray-900);
    line-height: 1;
    margin-bottom: 4px;
  }
  .kpi-label {
    font-size: 9px;
    color: var(--gray-500);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  /* ── TABLES ─────────────────────────────────── */
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 16px 0;
    font-size: 9.5px;
    border-radius: var(--radius);
    overflow: hidden;
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow);
  }
  th {
    background: var(--gray-900);
    color: white;
    padding: 10px 14px;
    text-align: left;
    font-weight: 700;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
  td {
    padding: 10px 14px;
    border-bottom: 1px solid var(--gray-100);
    vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: var(--gray-50); }
  .td-mono {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 500;
  }

  /* ── STATUS BADGES ──────────────────────────── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 9px;
    font-weight: 700;
    white-space: nowrap;
  }
  .badge-success { background: var(--success-bg); color: #065f46; }
  .badge-danger  { background: var(--danger-bg);  color: #991b1b; }
  .badge-warning { background: var(--warning-bg); color: #92400e; }
  .badge-info    { background: var(--info-bg);    color: #1e40af; }
  .badge-ua      { background: #fef3c7; color: #92400e; }
  .badge-ga4     { background: #dbeafe; color: #1e40af; }

  /* ── SEVERITY TAGS ──────────────────────────── */
  .severity {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
  .severity-critique { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
  .severity-majeur   { background: #ffedd5; color: #ea580c; border: 1px solid #fed7aa; }
  .severity-info     { background: #dbeafe; color: #2563eb; border: 1px solid #bfdbfe; }

  /* ── SITE CARDS ─────────────────────────────── */
  .site-card {
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius);
    padding: 20px 22px;
    margin-bottom: 16px;
    box-shadow: var(--shadow);
    page-break-inside: avoid;
  }
  .site-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--gray-100);
  }
  .site-card-name {
    font-size: 15px;
    font-weight: 800;
    color: var(--gray-900);
  }
  .site-card-url {
    font-size: 9px;
    color: var(--gray-400);
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
  }
  .site-card-badges {
    display: flex;
    gap: 6px;
  }

  /* ── FUNNEL ─────────────────────────────────── */
  .funnel {
    display: flex;
    gap: 0;
    margin: 16px 0 20px;
    position: relative;
  }
  .funnel-step {
    flex: 1;
    text-align: center;
    padding: 12px 6px;
    position: relative;
  }
  .funnel-icon {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px;
    font-size: 16px;
    position: relative;
    z-index: 2;
  }
  .funnel-icon-fail { background: #fee2e2; border: 2px solid #fecaca; }
  .funnel-icon-pass { background: #dcfce7; border: 2px solid #bbf7d0; }
  .funnel-label {
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--gray-600);
    margin-bottom: 2px;
  }
  .funnel-event {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    color: var(--gray-400);
    font-weight: 500;
  }
  .funnel-connector {
    position: absolute;
    top: 30px;
    right: -1px;
    width: calc(100%);
    height: 2px;
    background: var(--gray-200);
    z-index: 1;
  }
  .funnel-step:last-child .funnel-connector { display: none; }

  /* ── CODE BLOCKS ────────────────────────────── */
  .code-block {
    background: #0f172a;
    border-radius: 10px;
    padding: 4px 0;
    margin: 12px 0;
    overflow: hidden;
    box-shadow: var(--shadow-md);
    page-break-inside: avoid;
  }
  .code-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-bottom: 1px solid #1e293b;
  }
  .code-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .code-dot-red { background: #ef4444; }
  .code-dot-yellow { background: #eab308; }
  .code-dot-green { background: #22c55e; }
  .code-label {
    color: var(--gray-500);
    font-size: 9px;
    font-weight: 600;
    margin-left: 6px;
    font-family: 'JetBrains Mono', monospace;
  }
  .code-body {
    padding: 14px 18px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    line-height: 1.65;
    color: #e2e8f0;
    white-space: pre;
    overflow-x: auto;
  }
  .code-body .kw  { color: #c084fc; }
  .code-body .str { color: #34d399; }
  .code-body .num { color: #fbbf24; }
  .code-body .cm  { color: #64748b; font-style: italic; }
  .code-body .key { color: #93c5fd; }
  .code-body .err { color: #fca5a5; }

  /* ── DIAGNOSTIC TABLE ───────────────────────── */
  .diag-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid var(--gray-100);
  }
  .diag-row:last-child { border-bottom: none; }
  .diag-num {
    width: 24px;
    height: 24px;
    background: var(--gray-100);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 11px;
    color: var(--gray-600);
    flex-shrink: 0;
  }
  .diag-content {
    flex: 1;
  }
  .diag-text {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--gray-800);
    margin-bottom: 2px;
  }
  .diag-desc {
    font-size: 9px;
    color: var(--gray-500);
  }

  /* ── CHECKLIST ──────────────────────────────── */
  .checklist {
    margin: 12px 0;
  }
  .check-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    border-radius: 8px;
    margin-bottom: 4px;
    font-size: 10px;
    font-weight: 500;
  }
  .check-item-ok  { background: var(--success-bg); color: #065f46; }
  .check-item-fail { background: var(--danger-bg); color: #991b1b; }
  .check-icon {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 800;
    flex-shrink: 0;
  }
  .check-icon-ok { background: var(--success); color: white; }
  .check-icon-fail { background: var(--danger); color: white; }

  /* ── RECOMMENDATION CARDS ───────────────────── */
  .reco-card {
    border-radius: var(--radius);
    padding: 18px 20px;
    margin-bottom: 14px;
    page-break-inside: avoid;
  }
  .reco-critique { background: #fef2f2; border-left: 4px solid #ef4444; }
  .reco-majeur   { background: #fff7ed; border-left: 4px solid #f97316; }
  .reco-info     { background: #eff6ff; border-left: 4px solid #3b82f6; }
  .reco-title {
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .reco-body {
    font-size: 10px;
    color: var(--gray-700);
    line-height: 1.65;
  }

  /* ── MISC ───────────────────────────────────── */
  .text-muted { color: var(--gray-500); }
  .text-sm { font-size: 9px; }
  .text-xs { font-size: 8px; }
  .mt-8 { margin-top: 8px; }
  .mt-16 { margin-top: 16px; }
  .mt-24 { margin-top: 24px; }
  .mb-8 { margin-bottom: 8px; }
  .mb-16 { margin-bottom: 16px; }
  .fw-700 { font-weight: 700; }
  .fw-800 { font-weight: 800; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .divider {
    height: 1px;
    background: var(--gray-200);
    margin: 24px 0;
  }

  .page-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px 44px;
    display: flex;
    justify-content: space-between;
    font-size: 8px;
    color: var(--gray-400);
  }

  .step-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 10px;
  }
  .step-mini {
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    padding: 10px 12px;
  }
  .step-mini-title {
    font-size: 9px;
    font-weight: 700;
    color: var(--gray-700);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .step-mini-url {
    font-size: 7.5px;
    color: var(--gray-400);
    font-family: 'JetBrains Mono', monospace;
    word-break: break-all;
    margin-bottom: 4px;
  }
  .step-mini-stat {
    font-size: 9px;
    color: var(--gray-600);
  }

  .odoo-steps {
    counter-reset: odoo-step;
    margin-top: 10px;
  }
  .odoo-step {
    display: flex;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--gray-100);
  }
  .odoo-step:last-child { border-bottom: none; }
  .odoo-step::before {
    counter-increment: odoo-step;
    content: counter(odoo-step);
    width: 22px;
    height: 22px;
    background: var(--accent);
    color: white;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 10px;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .odoo-step-text {
    font-size: 10px;
    color: var(--gray-700);
    line-height: 1.6;
  }
  .odoo-step-text strong { color: var(--gray-900); }
  .odoo-step-text code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    background: var(--gray-100);
    padding: 1px 6px;
    border-radius: 4px;
    color: var(--accent);
    font-weight: 600;
  }

  .ref-table {
    margin-top: 10px;
  }
  .ref-table td:first-child {
    font-weight: 700;
    color: var(--gray-900);
  }
</style>
</head>
<body>

<!-- ████ COVER PAGE ████ -->
<div class="cover">
  <div class="cover-content">
    <div class="cover-badge">Audit Technique</div>
    <h1>Audit dataLayer<br><span>eCommerce GA4</span></h1>
    <p class="cover-sub">Coastal Offroad &mdash; 4 sites internationaux<br>Conformite Google Analytics 4 &amp; Google Tag Manager</p>
    <div class="cover-meta">
      <div class="cover-meta-item">
        <div class="cover-meta-value">4</div>
        <div class="cover-meta-label">Sites audites</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-value" style="color:#ef4444">0%</div>
        <div class="cover-meta-label">Conformite GA4</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-value">20</div>
        <div class="cover-meta-label">Events manquants</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-value">3</div>
        <div class="cover-meta-label">Issues critiques</div>
      </div>
    </div>
  </div>
  <div class="cover-footer">
    <span>Confidentiel &mdash; Coastal Offroad</span>
    <span>18 fevrier 2026</span>
  </div>
</div>

<!-- ████ PAGE 2: EXECUTIVE SUMMARY ████ -->
<div class="page">
  <div class="section-header">
    <div class="section-number">1</div>
    <div>
      <div class="section-title">Resume executif</div>
      <div class="section-subtitle">Vue d'ensemble de l'audit</div>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-icon" style="background:#dcfce7;">&#x2705;</div>
      <div class="kpi-value">4/4</div>
      <div class="kpi-label">GTM installe</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon" style="background:#dcfce7;">&#x2705;</div>
      <div class="kpi-value">4/4</div>
      <div class="kpi-label">dataLayer present</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon" style="background:#fef2f2;">&#x274C;</div>
      <div class="kpi-value" style="color:var(--danger)">0/4</div>
      <div class="kpi-label">Format GA4</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon" style="background:#fef2f2;">&#x274C;</div>
      <div class="kpi-value" style="color:var(--danger)">0/20</div>
      <div class="kpi-label">Events GA4 OK</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Site</th>
        <th>GTM Container</th>
        <th>dataLayer</th>
        <th>Format</th>
        <th>Devise</th>
        <th>Score</th>
      </tr>
    </thead>
    <tbody>
      ${sites.map(s => `
      <tr>
        <td><strong>${s.name}</strong><br><span class="text-xs text-muted">${s.url}</span></td>
        <td class="td-mono">${s.gtm ? s.gtmId : '<span class="badge badge-danger">Absent</span>'}</td>
        <td>${s.dataLayer ? '<span class="badge badge-success">Present</span>' : '<span class="badge badge-danger">Absent</span>'}</td>
        <td><span class="badge badge-ua">UA Legacy</span></td>
        <td class="td-mono">${s.currency}</td>
        <td><span class="badge badge-danger">0 / 5</span></td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="divider"></div>

  <div style="font-size:13px; font-weight:800; color:var(--gray-900); margin-bottom:14px;">Funnel eCommerce GA4 &mdash; Etat global</div>

  <div class="funnel">
    <div class="funnel-step">
      <div class="funnel-icon funnel-icon-fail">&#x274C;</div>
      <div class="funnel-label">Listing</div>
      <div class="funnel-event">view_item_list</div>
      <div class="funnel-connector"></div>
    </div>
    <div class="funnel-step">
      <div class="funnel-icon funnel-icon-fail">&#x274C;</div>
      <div class="funnel-label">Selection</div>
      <div class="funnel-event">select_item</div>
      <div class="funnel-connector"></div>
    </div>
    <div class="funnel-step">
      <div class="funnel-icon funnel-icon-fail">&#x274C;</div>
      <div class="funnel-label">Fiche produit</div>
      <div class="funnel-event">view_item</div>
      <div class="funnel-connector"></div>
    </div>
    <div class="funnel-step">
      <div class="funnel-icon funnel-icon-fail">&#x274C;</div>
      <div class="funnel-label">Ajout panier</div>
      <div class="funnel-event">add_to_cart</div>
      <div class="funnel-connector"></div>
    </div>
    <div class="funnel-step">
      <div class="funnel-icon funnel-icon-fail">&#x274C;</div>
      <div class="funnel-label">Panier/Checkout</div>
      <div class="funnel-event">view_cart</div>
    </div>
  </div>

  <div style="text-align:center; font-size:10px; color:var(--gray-500); font-weight:600; margin-top:8px;">
    Aucun event du funnel GA4 n'est implemente sur aucun des 4 sites
  </div>
</div>

<!-- ████ PAGE 3: DIAGNOSTIC ████ -->
<div class="page">
  <div class="section-header">
    <div class="section-number">2</div>
    <div>
      <div class="section-title">Diagnostic detaille</div>
      <div class="section-subtitle">Problemes identifies par ordre de priorite</div>
    </div>
  </div>

  <div class="diag-row">
    <div class="diag-num">1</div>
    <div class="diag-content">
      <div class="diag-text">Format UA obsolete (Enhanced Ecommerce) utilise sur les 4 sites</div>
      <div class="diag-desc">Les donnees ecommerce sont pushees avec <code>impressions</code> et <code>currencyCode</code> au lieu du tableau <code>items</code> GA4</div>
    </div>
    <span class="severity severity-critique">Critique</span>
  </div>

  <div class="diag-row">
    <div class="diag-num">2</div>
    <div class="diag-content">
      <div class="diag-text">Aucune cle <code>event</code> sur les push ecommerce</div>
      <div class="diag-desc">GTM ne peut pas declencher de tags car il n'y a pas de trigger possible sans cle <code>event</code></div>
    </div>
    <span class="severity severity-critique">Critique</span>
  </div>

  <div class="diag-row">
    <div class="diag-num">3</div>
    <div class="diag-content">
      <div class="diag-text">Aucun event GA4 detecte sur l'ensemble du funnel</div>
      <div class="diag-desc"><code>view_item_list</code>, <code>view_item</code>, <code>add_to_cart</code>, <code>view_cart</code>, <code>begin_checkout</code> : tous absents</div>
    </div>
    <span class="severity severity-critique">Critique</span>
  </div>

  <div class="diag-row">
    <div class="diag-num">4</div>
    <div class="diag-content">
      <div class="diag-text">Aucun tracking sur les fiches produit</div>
      <div class="diag-desc">Le dataLayer sur les pages produit ne contient aucun event ecommerce (ni UA, ni GA4)</div>
    </div>
    <span class="severity severity-majeur">Majeur</span>
  </div>

  <div class="diag-row">
    <div class="diag-num">5</div>
    <div class="diag-content">
      <div class="diag-text">Aucun tracking add_to_cart / view_cart / begin_checkout</div>
      <div class="diag-desc">Les interactions panier et checkout ne generent aucun event dans le dataLayer</div>
    </div>
    <span class="severity severity-majeur">Majeur</span>
  </div>

  <div class="diag-row">
    <div class="diag-num">6</div>
    <div class="diag-content">
      <div class="diag-text">Donnees produit presentes dans les impressions UA (homepage)</div>
      <div class="diag-desc">Les champs <code>name</code>, <code>id</code>, <code>price</code>, <code>category</code> existent &rarr; utilisables comme base pour la migration</div>
    </div>
    <span class="severity severity-info">Info</span>
  </div>

  <div class="diag-row">
    <div class="diag-num">7</div>
    <div class="diag-content">
      <div class="diag-text">Plateforme Odoo eCommerce detectee</div>
      <div class="diag-desc">Les sites ne sont pas sur Shopify. L'implementation doit passer par les templates Odoo (<code>website_sale</code>)</div>
    </div>
    <span class="severity severity-info">Info</span>
  </div>

  <div class="divider"></div>

  <!-- Per-site detail cards -->
  <div style="font-size:13px; font-weight:800; color:var(--gray-900); margin-bottom:14px;">Detail par site</div>

  ${sites.map(s => `
  <div class="site-card">
    <div class="site-card-header">
      <div>
        <div class="site-card-name">${s.name}</div>
        <div class="site-card-url">${s.url}</div>
      </div>
      <div class="site-card-badges">
        <span class="badge badge-success">GTM ${s.gtmId}</span>
        <span class="badge badge-ua">UA Format</span>
        <span class="badge badge-info">${s.currency}</span>
      </div>
    </div>
    <div class="step-grid">
      <div class="step-mini">
        <div class="step-mini-title">&#x1F3E0; Homepage</div>
        <div class="step-mini-stat">${s.homepageDLEntries} entries dataLayer &mdash; ${s.impressionCount} impressions UA</div>
        <div class="step-mini-stat" style="color:var(--danger)">Pas de cle event &mdash; Format UA obsolete</div>
      </div>
      <div class="step-mini">
        <div class="step-mini-title">&#x1F4E6; Fiche produit</div>
        <div class="step-mini-url">${s.productUrl !== 'N/A' ? s.productUrl.replace('https://www.','') : 'N/A'}</div>
        <div class="step-mini-stat" style="color:var(--danger)">${s.productDLEntries} entries &mdash; 0 event ecommerce</div>
      </div>
      <div class="step-mini">
        <div class="step-mini-title">&#x1F6D2; Add to Cart</div>
        <div class="step-mini-stat" style="color:var(--danger)">Bouton : ${s.addToCartFound ? 'Trouve' : 'Non trouve'} &mdash; 0 event</div>
      </div>
      <div class="step-mini">
        <div class="step-mini-title">&#x1F4B3; Panier</div>
        <div class="step-mini-url">${s.cartUrl !== 'N/A' ? s.cartUrl.replace('https://www.','') : 'N/A'}</div>
        <div class="step-mini-stat" style="color:var(--danger)">${s.cartDLEntries} entries &mdash; 0 event ecommerce</div>
      </div>
    </div>
  </div>`).join('')}
</div>

<!-- ████ PAGE 4: RECOMMANDATIONS ████ -->
<div class="page">
  <div class="section-header">
    <div class="section-number">3</div>
    <div>
      <div class="section-title">Corrections a apporter</div>
      <div class="section-subtitle">Actions pour le developpeur, par ordre de priorite</div>
    </div>
  </div>

  <div class="reco-card reco-critique">
    <div class="reco-title">
      <span class="severity severity-critique">Critique</span>
      Migrer du format UA Enhanced Ecommerce vers GA4
    </div>
    <div class="reco-body">
      Les 4 sites pushent des donnees au format Universal Analytics (<code>impressions</code>, <code>currencyCode</code>). Ce format est obsolete depuis l'arret de GA UA en juillet 2024. Tout doit etre migre vers le format GA4 avec le tableau <code>items</code>.
    </div>
  </div>

  <div class="code-block">
    <div class="code-header">
      <div class="code-dot code-dot-red"></div>
      <div class="code-dot code-dot-yellow"></div>
      <div class="code-dot code-dot-green"></div>
      <span class="code-label">AVANT &mdash; Format UA (a supprimer)</span>
    </div>
    <div class="code-body"><span class="cm">// &#x274C; Format UA actuel - ne fonctionne plus avec GA4</span>
dataLayer.<span class="kw">push</span>({
  <span class="key">ecommerce</span>: {
    <span class="key">currencyCode</span>: <span class="str">"USD"</span>,
    <span class="key">impressions</span>: [
      { <span class="key">name</span>: <span class="str">"Lexus GX470..."</span>, <span class="key">id</span>: <span class="str">"CO0418"</span>, <span class="key">price</span>: <span class="num">822.96</span> }
    ]
  }
});</div>
  </div>

  <div class="code-block">
    <div class="code-header">
      <div class="code-dot code-dot-red"></div>
      <div class="code-dot code-dot-yellow"></div>
      <div class="code-dot code-dot-green"></div>
      <span class="code-label">APRES &mdash; Format GA4 (a implementer)</span>
    </div>
    <div class="code-body"><span class="cm">// &#x2705; Format GA4 correct</span>
dataLayer.<span class="kw">push</span>({ <span class="key">ecommerce</span>: <span class="kw">null</span> }); <span class="cm">// Reset obligatoire</span>
dataLayer.<span class="kw">push</span>({
  <span class="key">event</span>: <span class="str">"view_item_list"</span>,
  <span class="key">ecommerce</span>: {
    <span class="key">item_list_id</span>: <span class="str">"search_results"</span>,
    <span class="key">item_list_name</span>: <span class="str">"Search Results"</span>,
    <span class="key">items</span>: [{
      <span class="key">item_id</span>: <span class="str">"CO0418"</span>,
      <span class="key">item_name</span>: <span class="str">"Lexus GX470 High Clearance Front Bumper Kit"</span>,
      <span class="key">item_brand</span>: <span class="str">"GX470"</span>,
      <span class="key">item_category</span>: <span class="str">"2003-2009"</span>,
      <span class="key">price</span>: <span class="num">822.96</span>,
      <span class="key">currency</span>: <span class="str">"USD"</span>,
      <span class="key">index</span>: <span class="num">0</span>
    }]
  }
});</div>
  </div>

  <div class="reco-card reco-critique mt-16">
    <div class="reco-title">
      <span class="severity severity-critique">Critique</span>
      Ajouter la cle <code>event</code> a chaque push
    </div>
    <div class="reco-body">
      Actuellement les push ecommerce n'ont pas de cle <code>event</code>. Sans cette cle, GTM ne peut declencher aucun tag. Chaque <code>dataLayer.push()</code> ecommerce doit contenir <code>event: "nom_event"</code>.
    </div>
  </div>
</div>

<!-- ████ PAGE 5: EVENTS DU FUNNEL ████ -->
<div class="page">
  <div class="section-header">
    <div class="section-number">4</div>
    <div>
      <div class="section-title">Events GA4 a implementer</div>
      <div class="section-subtitle">Code exact pour chaque etape du funnel</div>
    </div>
  </div>

  <div class="reco-card reco-majeur mb-16">
    <div class="reco-title">
      <span class="severity severity-majeur">Majeur</span>
      Implementer les 7 events du funnel ecommerce GA4
    </div>
    <div class="reco-body">Chaque etape du parcours utilisateur doit emettre son event. Ci-dessous le code exact pour chaque event.</div>
  </div>

  <!-- view_item -->
  <div style="font-size:12px; font-weight:800; color:var(--gray-900); margin-bottom:6px;">
    <span style="color:var(--accent)">c)</span> view_item &mdash; Fiche produit
  </div>
  <div class="code-block">
    <div class="code-header">
      <div class="code-dot code-dot-red"></div>
      <div class="code-dot code-dot-yellow"></div>
      <div class="code-dot code-dot-green"></div>
      <span class="code-label">view_item &mdash; Page /shop/&lt;slug&gt;</span>
    </div>
    <div class="code-body">dataLayer.<span class="kw">push</span>({ <span class="key">ecommerce</span>: <span class="kw">null</span> });
dataLayer.<span class="kw">push</span>({
  <span class="key">event</span>: <span class="str">"view_item"</span>,
  <span class="key">ecommerce</span>: {
    <span class="key">currency</span>: <span class="str">"USD"</span>,
    <span class="key">value</span>: <span class="num">822.96</span>,
    <span class="key">items</span>: [{
      <span class="key">item_id</span>: <span class="str">"CO0418"</span>,
      <span class="key">item_name</span>: <span class="str">"Lexus GX470 High Clearance Front Bumper Kit"</span>,
      <span class="key">item_brand</span>: <span class="str">"GX470"</span>,
      <span class="key">item_category</span>: <span class="str">"2003-2009"</span>,
      <span class="key">price</span>: <span class="num">822.96</span>,
      <span class="key">quantity</span>: <span class="num">1</span>
    }]
  }
});</div>
  </div>

  <!-- add_to_cart -->
  <div style="font-size:12px; font-weight:800; color:var(--gray-900); margin: 16px 0 6px;">
    <span style="color:var(--accent)">d)</span> add_to_cart &mdash; Clic "Add to Cart"
  </div>
  <div class="code-block">
    <div class="code-header">
      <div class="code-dot code-dot-red"></div>
      <div class="code-dot code-dot-yellow"></div>
      <div class="code-dot code-dot-green"></div>
      <span class="code-label">add_to_cart &mdash; Event listener sur formulaire</span>
    </div>
    <div class="code-body">dataLayer.<span class="kw">push</span>({ <span class="key">ecommerce</span>: <span class="kw">null</span> });
dataLayer.<span class="kw">push</span>({
  <span class="key">event</span>: <span class="str">"add_to_cart"</span>,
  <span class="key">ecommerce</span>: {
    <span class="key">currency</span>: <span class="str">"USD"</span>,
    <span class="key">value</span>: <span class="num">822.96</span>,
    <span class="key">items</span>: [{
      <span class="key">item_id</span>: <span class="str">"CO0418"</span>,
      <span class="key">item_name</span>: <span class="str">"Lexus GX470 High Clearance Front Bumper Kit"</span>,
      <span class="key">price</span>: <span class="num">822.96</span>,
      <span class="key">quantity</span>: <span class="num">1</span>
    }]
  }
});</div>
  </div>

  <!-- view_cart & begin_checkout & purchase -->
  <div style="font-size:12px; font-weight:800; color:var(--gray-900); margin: 16px 0 6px;">
    <span style="color:var(--accent)">e-g)</span> view_cart / begin_checkout / purchase
  </div>
  <div class="code-block">
    <div class="code-header">
      <div class="code-dot code-dot-red"></div>
      <div class="code-dot code-dot-yellow"></div>
      <div class="code-dot code-dot-green"></div>
      <span class="code-label">purchase &mdash; Page /shop/confirmation</span>
    </div>
    <div class="code-body">dataLayer.<span class="kw">push</span>({ <span class="key">ecommerce</span>: <span class="kw">null</span> });
dataLayer.<span class="kw">push</span>({
  <span class="key">event</span>: <span class="str">"purchase"</span>,
  <span class="key">ecommerce</span>: {
    <span class="key">transaction_id</span>: <span class="str">"ORD-12345"</span>,
    <span class="key">value</span>: <span class="num">1645.92</span>,
    <span class="key">tax</span>: <span class="num">123.45</span>,
    <span class="key">shipping</span>: <span class="num">50.00</span>,
    <span class="key">currency</span>: <span class="str">"USD"</span>,
    <span class="key">items</span>: [
      { <span class="key">item_id</span>: <span class="str">"CO0418"</span>, <span class="key">item_name</span>: <span class="str">"..."</span>, <span class="key">price</span>: <span class="num">822.96</span>, <span class="key">quantity</span>: <span class="num">2</span> }
    ]
  }
});</div>
  </div>
</div>

<!-- ████ PAGE 6: IMPLEMENTATION ODOO + REFERENCES ████ -->
<div class="page">
  <div class="section-header">
    <div class="section-number">5</div>
    <div>
      <div class="section-title">Implementation dans Odoo</div>
      <div class="section-subtitle">Plan d'action technique pour le developpeur</div>
    </div>
  </div>

  <div class="reco-card reco-info mb-16">
    <div class="reco-title">
      <span class="severity severity-info">Info</span>
      Plateforme : Odoo eCommerce
    </div>
    <div class="reco-body">Les 4 sites tournent sur Odoo (pas Shopify). L'implementation doit passer par la modification des templates QWeb du module <code>website_sale</code> ou la creation d'un module custom.</div>
  </div>

  <div class="odoo-steps">
    <div class="odoo-step">
      <div class="odoo-step-text"><strong>Creer un module Odoo custom</strong> ou heriter du template <code>website_sale</code> pour injecter les scripts dataLayer dans les pages cibles.</div>
    </div>
    <div class="odoo-step">
      <div class="odoo-step-text"><strong>Template shop</strong> (<code>/shop</code>) : injecter un bloc <code>&lt;script&gt;</code> qui push <code>view_item_list</code> avec la liste des produits affiches.</div>
    </div>
    <div class="odoo-step">
      <div class="odoo-step-text"><strong>Template produit</strong> (<code>/shop/&lt;slug&gt;</code>) : injecter <code>view_item</code> avec les donnees du produit courant (nom, ID, prix, categorie).</div>
    </div>
    <div class="odoo-step">
      <div class="odoo-step-text"><strong>Intercepter le bouton Add to Cart</strong> via un event listener JavaScript sur le formulaire <code>/shop/cart/update</code> pour pusher <code>add_to_cart</code>.</div>
    </div>
    <div class="odoo-step">
      <div class="odoo-step-text"><strong>Template cart</strong> (<code>/shop/cart</code>) : injecter <code>view_cart</code> avec la liste des produits dans le panier.</div>
    </div>
    <div class="odoo-step">
      <div class="odoo-step-text"><strong>Template checkout</strong> : injecter <code>begin_checkout</code> au chargement de la page de paiement.</div>
    </div>
    <div class="odoo-step">
      <div class="odoo-step-text"><strong>Page de confirmation</strong> (<code>/shop/confirmation</code>) : injecter <code>purchase</code> avec <code>transaction_id</code>, <code>value</code>, <code>tax</code>, <code>shipping</code>.</div>
    </div>
  </div>

  <div class="divider"></div>

  <div class="grid-2">
    <div>
      <div style="font-size:12px; font-weight:800; color:var(--gray-900); margin-bottom:8px;">Devise par site</div>
      <table class="ref-table">
        <thead><tr><th>Site</th><th>Devise</th></tr></thead>
        <tbody>
          <tr><td>coastaloffroad.com</td><td class="td-mono">USD</td></tr>
          <tr><td>coastaloffroad.co.nz</td><td class="td-mono">NZD</td></tr>
          <tr><td>coastaloffroadbumpers.com.au</td><td class="td-mono">AUD</td></tr>
          <tr><td>coastaloffroad.ca</td><td class="td-mono">CAD</td></tr>
        </tbody>
      </table>
    </div>
    <div>
      <div style="font-size:12px; font-weight:800; color:var(--gray-900); margin-bottom:8px;">Conteneurs GTM</div>
      <table class="ref-table">
        <thead><tr><th>Site</th><th>Container ID</th></tr></thead>
        <tbody>
          <tr><td>coastaloffroad.com</td><td class="td-mono">GTM-M7DTZTJ</td></tr>
          <tr><td>coastaloffroad.co.nz</td><td class="td-mono">GTM-KST5KJ2</td></tr>
          <tr><td>coastaloffroadbumpers.com.au</td><td class="td-mono">GTM-N9MZG42</td></tr>
          <tr><td>coastaloffroad.ca</td><td class="td-mono">GTM-T436HZG</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="divider"></div>

  <div class="reco-card reco-info">
    <div class="reco-title">
      <span class="severity severity-info">Rappel</span>
      Toujours envoyer <code>ecommerce: null</code> avant chaque push
    </div>
    <div class="reco-body">Pour eviter la contamination de donnees entre events successifs, chaque <code>dataLayer.push()</code> ecommerce doit etre precede de <code>dataLayer.push({ ecommerce: null })</code>.</div>
  </div>

  <div style="text-align:center; margin-top:40px; color:var(--gray-400); font-size:9px;">
    <div style="font-weight:700; margin-bottom:4px;">Rapport genere automatiquement</div>
    Puppeteer Audit Script &mdash; 18 fevrier 2026 &mdash; Confidentiel
  </div>
</div>

</body>
</html>`;

async function generate() {
  const pdfPath = path.join(__dirname, "..", "coastal-offroad-datalayer-audit.pdf");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 2000));

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: false,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  await browser.close();
  console.log(`PDF premium genere: ${pdfPath}`);
}

generate().catch(console.error);
