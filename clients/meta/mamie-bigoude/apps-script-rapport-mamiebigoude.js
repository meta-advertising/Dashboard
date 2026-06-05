/**
 * ═══════════════════════════════════════════════════════════════
 * COMPTOIR MAMIE BIGOUDE — Rapport automatisé par email
 * ═══════════════════════════════════════════════════════════════
 *
 * Ce script lit les données de chaque onglet du Google Sheet,
 * calcule les KPIs de la semaine écoulée vs semaine précédente,
 * et envoie un email récapitulatif formaté.
 *
 * INSTALLATION :
 * 1. Ouvrir le Google Sheet Mamie Bigoude
 * 2. Menu Extensions > Apps Script
 * 3. Supprimer le contenu par défaut, coller ce script
 * 4. Sauvegarder (Ctrl+S)
 * 5. Lancer sendWeeklyReport() une première fois pour autoriser
 * 6. Configurer le déclencheur (voir setupTrigger)
 * ═══════════════════════════════════════════════════════════════
 */

// ═══ CONFIGURATION ═══
const CONFIG = {
  // Destinataires (séparer par des virgules pour plusieurs)
  EMAIL_TO: 'hamza@meta-advertising.io, sebastien@meta-advertising.io',

  // Nom de l'expéditeur
  SENDER_NAME: 'Dashboard Mamie Bigoude',

  // Lien vers le dashboard publié (GitHub Pages)
  DASHBOARD_URL: 'https://ton-lien-github-pages.github.io/dashboard-mamiebigoude.html',

  // Clé API Gemini (obtenir sur https://aistudio.google.com/apikey)
  GEMINI_API_KEY: 'AIzaSyDVTgivLCxYeYklP4GKx24B4JdDoUlJY4k',

  // Noms exacts des onglets du Google Sheet
  SHEETS: {
    franceFB:  'Mamie Bigoude France FB',
    google:    'Mamie Bigoude France GOOGLE',
    ga4:       'Mamie Bigoude France GA4',
    nimes:     'Mamie Bigoude Nîmes META',
    bourges:   'Mamie Bigoude Bourges META'
  },

  // Campagnes nationales (tout le reste = restaurant)
  NATIONAL_PATTERNS: ['Franchise_Conversion', 'Franchise_LeadAds', 'NATIO_Engagement', 'Franchise_ConversionAds'],

  // Hash codes → villes
  CITY_MAP: {
    '#A#': 'Angers', '#L#': 'Limoges', '#M#': 'Montluçon'
  },

  // Couleurs du rapport
  COLORS: {
    rose: '#c4567a',
    roseBg: '#fdf2f5',
    vert: '#2e7d32',
    vertBg: '#e8f5e9',
    rouge: '#c62828',
    rougeBg: '#fce4ec',
    bleuMeta: '#1877f2',
    bleuGoogle: '#4285f4',
    violet: '#7c3aed',
    or: '#c9a96e',
    gris: '#666',
    grisClair: '#f5f5f5'
  }
};

// ═══ FONCTIONS UTILITAIRES ═══

/** Parse un nombre au format français (virgule décimale) */
function pNum(val) {
  if (!val || val === '' || val === '-') return 0;
  let s = String(val).replace(/\s/g, '').replace(/[^0-9.,-]/g, '');
  if (s.includes(',') && s.includes('.')) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  return parseFloat(s) || 0;
}

/** Formate un nombre */
function fN(n) { return Math.round(n).toLocaleString('fr-FR'); }

/** Formate un montant en euros */
function fE(n) { return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function fE2(n) { return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

/** Formate un pourcentage */
function fPct(n) { return n.toFixed(1).replace('.', ',') + ' %'; }

/** Calcule la variation en % */
function variation(cur, prev) {
  if (!prev || prev === 0) return { pct: null, dir: 'neutral' };
  const p = ((cur - prev) / prev) * 100;
  return { pct: Math.abs(p).toFixed(1), dir: p >= 0 ? 'up' : 'down' };
}

/** HTML pour une variation */
function variationBadge(v) {
  if (!v || v.pct === null) return '<span style="color:#999">—</span>';
  const color = v.dir === 'up' ? CONFIG.COLORS.vert : CONFIG.COLORS.rouge;
  const arrow = v.dir === 'up' ? '↑' : '↓';
  return `<span style="color:${color};font-weight:600">${arrow} ${v.pct}%</span>`;
}

/** Obtient les dates de la semaine écoulée (lundi-dimanche) */
function getLastWeekRange() {
  const now = new Date();
  const day = now.getDay() || 7; // dimanche = 7
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - day);
  const lastMonday = new Date(lastSunday);
  lastMonday.setDate(lastSunday.getDate() - 6);
  return { start: lastMonday, end: lastSunday };
}

/** Semaine d'avant (pour comparaison) */
function getPrevWeekRange() {
  const last = getLastWeekRange();
  const end = new Date(last.start);
  end.setDate(end.getDate() - 1);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return { start, end };
}

/** Vérifie si une date est dans une plage */
function isInRange(dateStr, range) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const s = new Date(range.start.toISOString().split('T')[0]);
  const e = new Date(range.end.toISOString().split('T')[0]);
  return d >= s && d <= e;
}

function formatDateFR(d) {
  const j = d.getDate();
  const mois = ['janv.','fév.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
  return j + ' ' + mois[d.getMonth()] + ' ' + d.getFullYear();
}

// ═══ LECTURE DES DONNÉES ═══

/** Lit un onglet et retourne un tableau d'objets {colonne: valeur} */
function readSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    Logger.log('Onglet introuvable: ' + sheetName);
    return [];
  }
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0].map(h => String(h).trim());
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, j) => { row[h] = data[i][j]; });
    rows.push(row);
  }
  return rows;
}

/** Classifie une campagne Meta : national ou restaurant */
function classifyCampaign(name) {
  if (!name) return { type: 'national', city: null };
  const n = String(name);
  for (const p of CONFIG.NATIONAL_PATTERNS) {
    if (n.includes(p)) return { type: 'national', city: null };
  }
  for (const [code, city] of Object.entries(CONFIG.CITY_MAP)) {
    if (n.includes(code)) return { type: 'restaurant', city };
  }
  const cities = ['Amboise','Blois','Orléans','Tours','Poitiers','Montluçon','Bourges','BOURGES','Nîmes'];
  for (const c of cities) {
    if (n.includes(c)) return { type: 'restaurant', city: c === 'BOURGES' ? 'Bourges' : c };
  }
  return { type: 'national', city: null };
}

/** Extrait la date sous forme de string YYYY-MM-DD */
function getDateStr(val) {
  if (!val) return null;
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  const s = String(val);
  const m = s.match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

// ═══ AGRÉGATION DES DONNÉES ═══

function aggregateData() {
  const weekRange = getLastWeekRange();
  const prevRange = getPrevWeekRange();

  // Résultats
  const result = {
    week: { start: weekRange.start, end: weekRange.end },
    national: { meta: { cur: {imp:0,cl:0,eng:0,cost:0,leads:0}, prev: {imp:0,cl:0,eng:0,cost:0,leads:0} },
                google: { cur: {imp:0,cl:0,conv:0,cost:0}, prev: {imp:0,cl:0,conv:0,cost:0} },
                web: { cur: {sess:0,users:0}, prev: {sess:0,users:0} } },
    restaurants: {},
    googleResto: {},
    alerts: []
  };

  // 1. France FB
  const fbRows = readSheet(CONFIG.SHEETS.franceFB);
  fbRows.forEach(r => {
    const dt = getDateStr(r['Date']);
    if (!dt) return;
    const name = String(r['Nom de la campagne'] || '');
    const cls = classifyCampaign(name);
    const imp = pNum(r['Impressions']);
    const cl = pNum(r['Clics (tous)']);
    const cost = pNum(r['Coût (EUR)']);
    const eng = pNum(r["J'aime la page"]) + pNum(r['Commentaires sur les publications']) +
                pNum(r['Réactions aux publications']) + pNum(r['Partages de publications']) +
                pNum(r['Enregistrements de publications']);
    const leads = pNum(r['Prospects sur Facebook']);

    if (cls.type === 'national') {
      const t = isInRange(dt, weekRange) ? result.national.meta.cur : isInRange(dt, prevRange) ? result.national.meta.prev : null;
      if (t) { t.imp+=imp; t.cl+=cl; t.eng+=eng; t.cost+=cost; t.leads+=leads; }
    } else {
      if (!result.restaurants[cls.city]) result.restaurants[cls.city] = { cur:{imp:0,cl:0,eng:0,cost:0}, prev:{imp:0,cl:0,eng:0,cost:0} };
      const t = isInRange(dt, weekRange) ? result.restaurants[cls.city].cur : isInRange(dt, prevRange) ? result.restaurants[cls.city].prev : null;
      if (t) { t.imp+=imp; t.cl+=cl; t.eng+=eng; t.cost+=cost; }
    }
  });

  // 2. Google
  const gRows = readSheet(CONFIG.SHEETS.google);
  gRows.forEach(r => {
    const dt = getDateStr(r['Date']);
    if (!dt) return;
    const name = String(r['Nom de la campagne'] || '');
    const imp = pNum(r['Impressions']);
    const cl = pNum(r['Clics']);
    const cost = pNum(r['Coût (EUR)']);
    const conv = pNum(r['Conversions']);

    if (name.includes('Angers')) {
      if (!result.googleResto['Angers']) result.googleResto['Angers'] = { cur:{imp:0,cl:0,conv:0,cost:0}, prev:{imp:0,cl:0,conv:0,cost:0} };
      const t = isInRange(dt, weekRange) ? result.googleResto['Angers'].cur : isInRange(dt, prevRange) ? result.googleResto['Angers'].prev : null;
      if (t) { t.imp+=imp; t.cl+=cl; t.conv+=conv; t.cost+=cost; }
    } else {
      const t = isInRange(dt, weekRange) ? result.national.google.cur : isInRange(dt, prevRange) ? result.national.google.prev : null;
      if (t) { t.imp+=imp; t.cl+=cl; t.conv+=conv; t.cost+=cost; }
    }
  });

  // 3. GA4
  const gaRows = readSheet(CONFIG.SHEETS.ga4);
  gaRows.forEach(r => {
    const dt = getDateStr(r['Date']);
    if (!dt) return;
    const sess = pNum(r['Sessions']);
    const users = pNum(r['Total users']);
    const t = isInRange(dt, weekRange) ? result.national.web.cur : isInRange(dt, prevRange) ? result.national.web.prev : null;
    if (t) { t.sess+=sess; t.users+=users; }
  });

  // 4. Nîmes
  const nimRows = readSheet(CONFIG.SHEETS.nimes);
  if (!result.restaurants['Nîmes']) result.restaurants['Nîmes'] = { cur:{imp:0,cl:0,eng:0,cost:0}, prev:{imp:0,cl:0,eng:0,cost:0} };
  nimRows.forEach(r => {
    const dt = getDateStr(r['Date']);
    if (!dt) return;
    const imp = pNum(r['Impressions']); const cl = pNum(r['Clics (tous)']); const cost = pNum(r['Coût (EUR)']);
    const eng = pNum(r["J'aime la page"]) + pNum(r['Commentaires sur les publications']) +
                pNum(r['Réactions aux publications']) + pNum(r['Partages de publications']) +
                pNum(r['Enregistrements de publications']);
    const t = isInRange(dt, weekRange) ? result.restaurants['Nîmes'].cur : isInRange(dt, prevRange) ? result.restaurants['Nîmes'].prev : null;
    if (t) { t.imp+=imp; t.cl+=cl; t.eng+=eng; t.cost+=cost; }
  });

  // 5. Bourges
  const bourRows = readSheet(CONFIG.SHEETS.bourges);
  if (!result.restaurants['Bourges']) result.restaurants['Bourges'] = { cur:{imp:0,cl:0,eng:0,cost:0}, prev:{imp:0,cl:0,eng:0,cost:0} };
  bourRows.forEach(r => {
    const dt = getDateStr(r['Date']);
    if (!dt) return;
    const imp = pNum(r['Impressions']); const cl = pNum(r['Clics (tous)']); const cost = pNum(r['Coût (EUR)']);
    const eng = pNum(r["J'aime la page"]) + pNum(r['Commentaires sur les publications']) +
                pNum(r['Réactions aux publications']) + pNum(r['Partages de publications']) +
                pNum(r['Enregistrements de publications']);
    const t = isInRange(dt, weekRange) ? result.restaurants['Bourges'].cur : isInRange(dt, prevRange) ? result.restaurants['Bourges'].prev : null;
    if (t) { t.imp+=imp; t.cl+=cl; t.eng+=eng; t.cost+=cost; }
  });

  // Détection d'alertes
  Object.entries(result.restaurants).forEach(([city, d]) => {
    if (d.prev.imp > 0 && d.cur.imp > 0) {
      const ctr_cur = d.cur.cl / d.cur.imp * 100;
      const ctr_prev = d.prev.cl / d.prev.imp * 100;
      if (ctr_cur < ctr_prev * 0.75) {
        result.alerts.push({ city, type: 'ctr_drop', msg: `CTR en baisse de ${fPct(ctr_prev)} à ${fPct(ctr_cur)}` });
      }
    }
    if (d.prev.cost > 0 && d.cur.cost > d.prev.cost * 1.3) {
      result.alerts.push({ city, type: 'cost_spike', msg: `Dépenses en hausse (+${fPct((d.cur.cost/d.prev.cost-1)*100)})` });
    }
  });

  return result;
}

// ═══ ANALYSE IA (GEMINI) ═══

/** Prépare un résumé texte des KPIs pour le prompt Gemini */
function buildGeminiContext(data) {
  const nm = data.national.meta;
  const ng = data.national.google;
  const nw = data.national.web;
  const period = formatDateFR(data.week.start) + ' au ' + formatDateFR(data.week.end);

  let ctx = `Période analysée : semaine du ${period}\n\n`;
  ctx += `=== NATIONAL ===\n`;
  ctx += `Meta Ads : ${fN(nm.cur.imp)} impressions (sem. préc: ${fN(nm.prev.imp)}), ${fN(nm.cur.cl)} clics (préc: ${fN(nm.prev.cl)}), ${fN(nm.cur.eng)} engagement (préc: ${fN(nm.prev.eng)}), ${fE(nm.cur.cost)} dépensés (préc: ${fE(nm.prev.cost)}), ${fN(nm.cur.leads)} leads (préc: ${fN(nm.prev.leads)})\n`;
  ctx += `Google Ads : ${fN(ng.cur.imp)} impressions (préc: ${fN(ng.prev.imp)}), ${fN(ng.cur.cl)} clics (préc: ${fN(ng.prev.cl)}), ${fN(ng.cur.conv)} conversions (préc: ${fN(ng.prev.conv)}), ${fE(ng.cur.cost)} dépensés (préc: ${fE(ng.prev.cost)})\n`;
  ctx += `Site Web GA4 : ${fN(nw.cur.sess)} sessions (préc: ${fN(nw.prev.sess)}), ${fN(nw.cur.users)} utilisateurs (préc: ${fN(nw.prev.users)})\n\n`;

  ctx += `=== RESTAURANTS ===\n`;
  Object.entries(data.restaurants).sort().forEach(([city, d]) => {
    const ctr = d.cur.imp > 0 ? (d.cur.cl / d.cur.imp * 100).toFixed(2) : 0;
    ctx += `${city} (Meta) : ${fN(d.cur.imp)} imp (préc: ${fN(d.prev.imp)}), ${fN(d.cur.cl)} clics, CTR ${ctr}%, ${fN(d.cur.eng)} eng, ${fE(d.cur.cost)}\n`;
  });
  Object.entries(data.googleResto).sort().forEach(([city, d]) => {
    ctx += `${city} (Google) : ${fN(d.cur.imp)} imp (préc: ${fN(d.prev.imp)}), ${fN(d.cur.cl)} clics, ${fN(d.cur.conv)} conv, ${fE(d.cur.cost)}\n`;
  });

  if (data.alerts.length > 0) {
    ctx += `\n=== ALERTES DÉTECTÉES ===\n`;
    data.alerts.forEach(a => { ctx += `⚠ ${a.city} : ${a.msg}\n`; });
  }

  return ctx;
}

/** Appelle l'API Gemini pour obtenir une analyse */
function getGeminiAnalysis(data) {
  const apiKey = CONFIG.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'TA_CLE_API_GEMINI_ICI') {
    Logger.log('Clé API Gemini non configurée, analyse IA ignorée.');
    return null;
  }

  const context = buildGeminiContext(data);

  const prompt = `Tu es un expert en marketing digital et media buying pour une chaîne de crêperies appelée "Comptoir Mamie Bigoude". Tu analyses les performances publicitaires hebdomadaires (Meta Ads, Google Ads, et le site web).

Voici les données de la semaine avec comparaison à la semaine précédente :

${context}

Rédige une analyse concise en français (maximum 5-6 phrases) qui :
1. Identifie les tendances clés (hausses/baisses significatives)
2. Met en avant les points positifs
3. Signale les points d'attention ou problèmes
4. Donne 1 recommandation actionnable concrète

Style : professionnel mais accessible, direct, pas de blabla. Utilise des chiffres précis. Ne commence pas par "Cette semaine" ou "Voici".`;

  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 400
      }
    };

    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const json = JSON.parse(response.getContentText());

    if (json.candidates && json.candidates[0] && json.candidates[0].content) {
      const text = json.candidates[0].content.parts[0].text;
      Logger.log('Analyse Gemini reçue : ' + text.substring(0, 100) + '...');
      return text.trim();
    } else {
      Logger.log('Réponse Gemini inattendue : ' + JSON.stringify(json).substring(0, 300));
      return null;
    }
  } catch (e) {
    Logger.log('Erreur Gemini : ' + e.message);
    return null;
  }
}

// ═══ GÉNÉRATION DU RAPPORT HTML ═══

function buildEmailHTML(data, aiAnalysis) {
  const C = CONFIG.COLORS;
  const periodLabel = formatDateFR(data.week.start) + ' → ' + formatDateFR(data.week.end);

  // KPI row helper
  function kpiRow(label, value, variation_obj, color) {
    return `<tr>
      <td style="padding:8px 12px;font-size:13px;color:#333">${label}</td>
      <td style="padding:8px 12px;font-size:15px;font-weight:700;color:${color || '#222'};text-align:right">${value}</td>
      <td style="padding:8px 12px;text-align:right;font-size:12px">${variationBadge(variation_obj)}</td>
    </tr>`;
  }

  // Section helper
  function section(title, color, content) {
    return `<div style="margin-bottom:20px;border-radius:12px;border:1px solid #eee;overflow:hidden">
      <div style="background:${color};padding:10px 16px;display:flex;align-items:center;gap:8px">
        <span style="font-size:14px;font-weight:700;color:#fff">${title}</span>
      </div>
      <table style="width:100%;border-collapse:collapse">${content}</table>
    </div>`;
  }

  const nm = data.national.meta;
  const ng = data.national.google;
  const nw = data.national.web;

  let html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#3d1a2a,#4e2238);padding:24px;border-radius:12px 12px 0 0;text-align:center">
      <div style="font-size:11px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">Le Comptoir de</div>
      <div style="font-size:22px;font-weight:800;color:#fff;margin-bottom:6px">Mamie Bigoude</div>
      <div style="font-size:12px;color:rgba(255,255,255,.6)">Rapport hebdomadaire</div>
      <div style="margin-top:8px;display:inline-block;background:rgba(196,86,122,.3);color:#e8a0b8;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:600">${periodLabel}</div>
    </div>

    <div style="padding:20px">
      <!-- Dépenses totales -->
      <div style="background:${C.roseBg};border:1px solid ${C.rose}33;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center">
        <div style="font-size:11px;color:${C.rose};text-transform:uppercase;font-weight:700;letter-spacing:1px">Dépenses totales de la semaine</div>
        <div style="font-size:28px;font-weight:800;color:${C.rose};margin:6px 0">${fE(nm.cur.cost + ng.cur.cost + Object.values(data.restaurants).reduce((a,r)=>a+r.cur.cost,0) + Object.values(data.googleResto).reduce((a,r)=>a+r.cur.cost,0))}</div>
        <div style="font-size:11px;color:#999">National + Restaurants</div>
      </div>`;

  // National Meta
  html += section('Meta Ads — National', C.bleuMeta,
    kpiRow('Impressions', fN(nm.cur.imp), variation(nm.cur.imp, nm.prev.imp)) +
    kpiRow('Clics', fN(nm.cur.cl), variation(nm.cur.cl, nm.prev.cl)) +
    kpiRow('Engagement', fN(nm.cur.eng), variation(nm.cur.eng, nm.prev.eng)) +
    kpiRow('Dépenses', fE(nm.cur.cost), variation(nm.cur.cost, nm.prev.cost), C.rose) +
    kpiRow('Leads', fN(nm.cur.leads), variation(nm.cur.leads, nm.prev.leads), C.vert)
  );

  // National Google
  html += section('Google Ads — National', '#d32f2f',
    kpiRow('Impressions', fN(ng.cur.imp), variation(ng.cur.imp, ng.prev.imp)) +
    kpiRow('Clics', fN(ng.cur.cl), variation(ng.cur.cl, ng.prev.cl)) +
    kpiRow('Conversions', fN(ng.cur.conv), variation(ng.cur.conv, ng.prev.conv), C.vert) +
    kpiRow('Dépenses', fE(ng.cur.cost), variation(ng.cur.cost, ng.prev.cost), C.rose) +
    (ng.cur.conv > 0 ? kpiRow('CPL', fE2(ng.cur.cost / ng.cur.conv), null) : '')
  );

  // Site Web
  html += section('Site Web — GA4', C.violet,
    kpiRow('Sessions', fN(nw.cur.sess), variation(nw.cur.sess, nw.prev.sess)) +
    kpiRow('Utilisateurs', fN(nw.cur.users), variation(nw.cur.users, nw.prev.users))
  );

  // Restaurants
  const cities = Object.keys(data.restaurants).sort();
  if (cities.length > 0) {
    let restoRows = '';
    cities.forEach(city => {
      const d = data.restaurants[city];
      const gd = data.googleResto[city];
      const hasGoogle = gd && gd.cur.imp > 0;
      const googleTag = hasGoogle ? ' <span style="background:#e3f2fd;color:#1565c0;font-size:9px;padding:1px 6px;border-radius:8px;font-weight:700">GOOGLE</span>' : '';
      restoRows += `<tr style="border-bottom:1px solid #f0f0f0">
        <td style="padding:10px 12px;font-weight:600;font-size:13px">${city}${googleTag}</td>
        <td style="padding:10px 8px;text-align:center;font-size:12px">${fN(d.cur.imp)}<br><span style="font-size:10px;color:#999">${variationBadge(variation(d.cur.imp, d.prev.imp))}</span></td>
        <td style="padding:10px 8px;text-align:center;font-size:12px">${fN(d.cur.cl)}</td>
        <td style="padding:10px 8px;text-align:center;font-size:12px">${fN(d.cur.eng)}</td>
        <td style="padding:10px 8px;text-align:right;font-size:12px;font-weight:600;color:${C.rose}">${fE(d.cur.cost)}${hasGoogle ? '<br><span style="font-size:10px;color:#1565c0">+' + fE(gd.cur.cost) + ' Google</span>' : ''}</td>
      </tr>`;
    });
    html += `<div style="margin-bottom:20px;border-radius:12px;border:1px solid #eee;overflow:hidden">
      <div style="background:${C.or};padding:10px 16px"><span style="font-size:14px;font-weight:700;color:#fff">Restaurants — Meta Ads</span></div>
      <table style="width:100%;border-collapse:collapse">
        <tr style="background:#f9f9f9">
          <th style="padding:8px 12px;text-align:left;font-size:10px;color:#999;text-transform:uppercase">Ville</th>
          <th style="padding:8px;text-align:center;font-size:10px;color:#999;text-transform:uppercase">Impr.</th>
          <th style="padding:8px;text-align:center;font-size:10px;color:#999;text-transform:uppercase">Clics</th>
          <th style="padding:8px;text-align:center;font-size:10px;color:#999;text-transform:uppercase">Eng.</th>
          <th style="padding:8px;text-align:right;font-size:10px;color:#999;text-transform:uppercase">Dép.</th>
        </tr>
        ${restoRows}
      </table>
    </div>`;
  }

  // Alertes
  if (data.alerts.length > 0) {
    let alertRows = data.alerts.map(a =>
      `<div style="padding:8px 12px;background:${C.rougeBg};border-radius:6px;margin-bottom:4px;font-size:12px">
        <strong style="color:${C.rouge}">⚠ ${a.city}</strong> — ${a.msg}
      </div>`
    ).join('');
    html += `<div style="margin-bottom:20px">
      <div style="font-size:13px;font-weight:700;color:${C.rouge};margin-bottom:8px">Alertes</div>
      ${alertRows}
    </div>`;
  }

  // Analyse IA
  if (aiAnalysis) {
    html += `<div style="margin-bottom:20px;border-radius:12px;border:1px solid #e0d4f7;overflow:hidden">
      <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:10px 16px;display:flex;align-items:center;gap:8px">
        <span style="font-size:14px;font-weight:700;color:#fff">Analyse IA</span>
        <span style="font-size:10px;color:rgba(255,255,255,.6);margin-left:auto">Gemini</span>
      </div>
      <div style="padding:14px 16px;font-size:13px;line-height:1.7;color:#333;background:#faf8ff">
        ${aiAnalysis.replace(/\n/g, '<br>')}
      </div>
    </div>`;
  }

  // Footer
  html += `
      <div style="text-align:center;padding:16px 0;border-top:1px solid #eee;margin-top:10px">
        <a href="${CONFIG.DASHBOARD_URL}" style="display:inline-block;background:${C.rose};color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600">Voir le dashboard complet</a>
        <div style="margin-top:12px;font-size:10px;color:#bbb">Rapport généré automatiquement le ${formatDateFR(new Date())}${aiAnalysis ? ' • Analyse par Gemini' : ''}</div>
      </div>
    </div>
  </div>`;

  return html;
}

// ═══ ENVOI DU RAPPORT ═══

/** Fonction principale : à appeler manuellement ou via déclencheur */
function sendWeeklyReport() {
  Logger.log('Début du rapport hebdomadaire...');

  const data = aggregateData();
  const aiAnalysis = getGeminiAnalysis(data);
  const html = buildEmailHTML(data, aiAnalysis);
  const period = formatDateFR(data.week.start) + ' - ' + formatDateFR(data.week.end);

  MailApp.sendEmail({
    to: CONFIG.EMAIL_TO,
    subject: `📊 Mamie Bigoude — Rapport semaine du ${period}`,
    htmlBody: html,
    name: CONFIG.SENDER_NAME
  });

  Logger.log('Rapport envoyé à ' + CONFIG.EMAIL_TO);
}

/** Configurer le déclencheur hebdomadaire automatique (lundi 9h) */
function setupTrigger() {
  // Supprimer les anciens déclencheurs
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'sendWeeklyReport') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // Créer le nouveau déclencheur : chaque lundi à 9h
  ScriptApp.newTrigger('sendWeeklyReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .create();

  Logger.log('Déclencheur configuré : chaque lundi à 9h');
}

/** Test rapide : envoie le rapport immédiatement */
function testReport() {
  sendWeeklyReport();
}
