const PptxGenJS = require('pptxgenjs');
const path = require('path');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.defineLayout({ name:'WIDE', width:13.33, height:7.5 });
pptx.layout = 'WIDE';

const BG = '1E1E1E';
const SURFACE = '2A2A2A';
const BORDER = '3A3A3A';
const TEXT = 'F0F0F0';
const TEXT2 = 'B0B0B0';
const TEXT3 = '707070';
const LAVENDER = 'B8A9E8';
const ACCENT = '36A9E1';
const GOLD = 'D4A04A';
const BLUE_CARD = 'D0E8F7';
const ORANGE_CARD = 'F5C77D';
const PINK_CARD = 'F0B8D8';
const GREEN_CARD = 'A7F3D0';
const KOVEN_ORANGE = 'F7933B';
const DARK_TEXT = '1A1A1A';

function addGradientBar(slide) {
  slide.addShape(pptx.shapes.RECTANGLE, { x:0, y:0, w:'100%', h:0.06, fill:{color:ACCENT} });
}

// ===== SLIDE 1 : COVER =====
let s1 = pptx.addSlide();
s1.background = { fill: BG };
addGradientBar(s1);
s1.addImage({ path:'https://tiobigotes.fr/cdn/shop/files/logo-blanc.png?v=1692804243&width=600', x:0.8, y:0.4, w:5, h:1.5, sizing:{type:'contain',w:5,h:1.5} });
s1.addText('PROPOSITION\nCOMMERCIALE', { x:0.8, y:1.9, w:8, h:2.2, fontSize:52, fontFace:'Oswald', color:LAVENDER, bold:false, lineSpacingMultiple:0.9 });
s1.addText([{text:'Acquisition digitale : B2C clients & préparation franchise', options:{fontSize:16, color:TEXT2}}], { x:0.8, y:4.1, w:8, h:0.5 });
s1.addText('Confidentiel — Avril 2026', { x:0.8, y:4.6, w:5, h:0.4, fontSize:13, color:TEXT3 });
s1.addImage({ path: path.resolve(__dirname, 'koven-logo.png'), x:0.8, y:5.6, w:4.5, h:1.5, sizing:{type:'contain',w:4.5,h:1.5} });

// ===== SLIDE 2 : DIAGNOSTIC =====
let s2 = pptx.addSlide();
s2.background = { fill: BG };
addGradientBar(s2);
s2.addText([{text:'DIAGNOSTIC — ', options:{color:LAVENDER}}, {text:'CE QUE NOUS AVONS COMPRIS', options:{color:TEXT}}], { x:0.8, y:0.4, w:11, h:0.7, fontSize:30, fontFace:'Oswald' });

// Box constats
s2.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:0.8, y:1.3, w:5.5, h:3.0, fill:{color:SURFACE}, rectRadius:0.15, line:{color:BORDER, width:1} });
s2.addText('CONSTATS ACTUELS :', { x:1.1, y:1.4, w:5, h:0.4, fontSize:13, fontFace:'Oswald', color:LAVENDER, bold:true });
s2.addText('• Aucun budget publicitaire Meta ou Google actif\n• Site B2B (franchise) existant → retirer la promotion Franchise Expo obsolète\n• Site B2C espagnol à exploiter → ajouter un module langue française\n• Aucun tracking conversions actif → algorithmes « aveugles »\n• Communauté Instagram France encore à construire', { x:1.1, y:1.9, w:5, h:2.2, fontSize:12, color:TEXT2, lineSpacingMultiple:1.4 });

// Box forces
s2.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:6.8, y:1.3, w:5.7, h:3.0, fill:{color:SURFACE}, rectRadius:0.15, line:{color:BORDER, width:1} });
s2.addText('FORCES DE LA MARQUE :', { x:7.1, y:1.4, w:5, h:0.4, fontSize:13, fontFace:'Oswald', color:LAVENDER, bold:true });
s2.addText('• Concept unique et authentique → empanada argentine artisanale\n• Réseau international → Espagne, Pays-Bas, France\n• Compte Instagram espagnol puissant : 39 000 followers\n• Qualité produit et visuels exceptionnels\n• Boutique Paris 11e → emplacement stratégique', { x:7.1, y:1.9, w:5.2, h:2.2, fontSize:12, color:TEXT2, lineSpacingMultiple:1.4 });

// Response bar
s2.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:0.8, y:4.7, w:11.7, h:2.2, fill:{color:BLUE_CARD}, rectRadius:0.15 });
s2.addText('NOTRE RÉPONSE : 2 CIBLES, 1 STRATÉGIE INTÉGRÉE', { x:1.1, y:4.85, w:10, h:0.4, fontSize:16, fontFace:'Oswald', color:DARK_TEXT, bold:true });

s2.addText([{text:'CIBLE 1 : B2C CLIENTS\n', options:{fontSize:12, fontFace:'Oswald', color:LAVENDER, bold:true}}, {text:'Créer la désirabilité de la marque, développer la communauté et générer du trafic en boutique', options:{fontSize:11, color:'444444'}}], { x:1.1, y:5.4, w:5, h:1.2 });

s2.addText([{text:'CIBLE 2 : B2B FRANCHISE (À 6 MOIS)\n', options:{fontSize:12, fontFace:'Oswald', color:LAVENDER, bold:true}}, {text:'Recruter des candidats franchisés qualifiés une fois la marque installée en France', options:{fontSize:11, color:'444444'}}], { x:6.8, y:5.4, w:5, h:1.2 });

// ===== SLIDE 3 : PHASE 0 =====
let s3 = pptx.addSlide();
s3.background = { fill: BG };
addGradientBar(s3);
s3.addText([{text:'PHASE 0 : ', options:{color:LAVENDER}}, {text:'SETUP TECHNIQUE & FONDATIONS', options:{color:TEXT}}], { x:0.8, y:0.4, w:11, h:0.7, fontSize:28, fontFace:'Oswald' });

const phase0 = [
  { title:'SETUP COMPTES', items:'• Configuration Business Manager\n• Configuration Ads Manager Meta\n• Création compte Google Ads\n• Liaison comptes IG FR + FB\n• Stratégie compte national + local' },
  { title:'SETUP TRACKING', items:'• Pixel Meta sur tiobigotes.fr\n• Tag Manager + événements conversion\n• GA4 configuré avec objectifs\n• Suivi parcours prospect\n  (source Meta / Google)' },
  { title:'ACQUISITION FOLLOWERS', items:'• Campagne followers ciblée food /\n  empanadas / cuisine latine\n• Objectif : +500-1000/mois\n• Coût estimé : 0,50-0,70€/follower\n• Crédibilisation avant lancement ads' },
  { title:'BASE AUDIENCES', items:'• Lookalike depuis 39K followers ES\n• Audiences ultra-personnalisées\n  (persona client)\n• Segmentation cold / warm / hot\n• Audiences géo Paris + IDF' }
];

phase0.forEach((p, i) => {
  const x = 0.8 + i * 3.05;
  const borderColor = i === 1 ? ORANGE_CARD : LAVENDER;
  s3.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y:1.3, w:2.85, h:4.5, fill:{color:LAVENDER}, rectRadius:0.15, line:{color:borderColor, width:i===1?2:0} });
  s3.addText(p.title, { x, y:1.5, w:2.85, h:0.5, fontSize:13, fontFace:'Oswald', color:DARK_TEXT, bold:true, align:'center' });
  s3.addText(p.items, { x:x+0.15, y:2.1, w:2.55, h:3.5, fontSize:11, color:DARK_TEXT, lineSpacingMultiple:1.4 });
});

s3.addText('PHASE 0 — FORFAIT SETUP UNIQUE : 1 500€ HT', { x:0.8, y:6.1, w:11, h:0.5, fontSize:16, fontFace:'Oswald', color:LAVENDER });

// ===== SLIDE 4 : B2C TABLEAU =====
let s4 = pptx.addSlide();
s4.background = { fill: BG };
addGradientBar(s4);
s4.addText([{text:'CIBLE 1 : ', options:{color:LAVENDER}}, {text:'B2C CLIENTS', options:{color:TEXT}}], { x:0.8, y:0.4, w:11, h:0.7, fontSize:30, fontFace:'Oswald' });

const tableRows = [
  [{text:'Campagnes', options:{fill:{color:PINK_CARD}, color:DARK_TEXT, fontSize:12, fontFace:'Oswald', bold:true}}, {text:'Canal', options:{fill:{color:PINK_CARD}, color:DARK_TEXT, fontSize:12, fontFace:'Oswald', bold:true}}, {text:'Format', options:{fill:{color:PINK_CARD}, color:DARK_TEXT, fontSize:12, fontFace:'Oswald', bold:true}}, {text:'Ciblage', options:{fill:{color:PINK_CARD}, color:DARK_TEXT, fontSize:12, fontFace:'Oswald', bold:true}}, {text:'KPI cible', options:{fill:{color:PINK_CARD}, color:DARK_TEXT, fontSize:12, fontFace:'Oswald', bold:true}}],
  [{text:'Trafic & Followers', options:{bold:true, color:TEXT}}, {text:'Meta (IG + FB)', options:{color:TEXT2}}, {text:'Reels, carrousels, visuels fixes', options:{color:TEXT2}}, {text:'Audiences ultra-perso + lookalike ES, food, 18-45 ans, Paris + IDF', options:{color:TEXT2}}, {text:'Coût/follower < 0,60€\n+500-1000/mois', options:{color:TEXT2}}],
  [{text:'Engagement', options:{bold:true, color:TEXT}}, {text:'Meta (IG + FB)', options:{color:TEXT2}}, {text:'Reels, carrousels, visuels fixes', options:{color:TEXT2}}, {text:'Followers + look-alike clients', options:{color:TEXT2}}, {text:'Engagement > 4%\nPartages > 2%', options:{color:TEXT2}}],
  [{text:'Notoriété', options:{bold:true, color:TEXT}}, {text:'Meta (IG + FB)', options:{color:TEXT2}}, {text:'Reels vidéo 15-30s, visuels fixes', options:{color:TEXT2}}, {text:'18-45 ans, foodie, cuisine latine, sorties Paris', options:{color:TEXT2}}, {text:'Coût/1000 vues < 6€\nPortée > 200K/mois', options:{color:TEXT2}}],
  [{text:'Search Ads', options:{bold:true, color:TEXT}}, {text:'Google Search', options:{color:TEXT2}}, {text:'Annonces texte + extensions lieu', options:{color:TEXT2}}, {text:'empanadas Paris, restaurant argentin, à emporter', options:{color:TEXT2}}, {text:'Taux de clic > 5%\nCoût/clic < 0,80€', options:{color:TEXT2}}],
  [{text:'Remarketing', options:{bold:true, color:TEXT}}, {text:'Google + Meta', options:{color:TEXT2}}, {text:'Retargeting multi-canal', options:{color:TEXT2}}, {text:'Visiteurs site + viewers 50%+ vidéos, non-convertis 30j', options:{color:TEXT2}}, {text:'Coût/clic < 0,50€\nTaux de clic > 1%', options:{color:TEXT2}}]
];

s4.addTable(tableRows, { x:0.5, y:1.3, w:12.3, fontSize:11, border:{type:'solid', color:BORDER, pt:0.5}, colW:[2.2, 1.8, 2.5, 3.3, 2.5], rowH:[0.5, 0.65, 0.65, 0.65, 0.65, 0.65] });

s4.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:0.5, y:5.6, w:12.3, h:0.6, fill:{color:'2D2640'}, rectRadius:0.1 });
s4.addText([{text:'⚠️ Les campagnes Meta fonctionnent en simultané.    ', options:{color:LAVENDER, bold:true}}, {text:'Répartition : 70% Meta / 30% Google', options:{color:ACCENT, bold:true}}], { x:0.8, y:5.6, w:11.7, h:0.6, fontSize:12, align:'center' });

// ===== SLIDE 5 : CONTENU =====
let s5 = pptx.addSlide();
s5.background = { fill: BG };
addGradientBar(s5);
s5.addText([{text:'STRATÉGIE DE ', options:{color:LAVENDER}}, {text:'CONTENU', options:{color:TEXT}}], { x:0.8, y:0.4, w:11, h:0.7, fontSize:30, fontFace:'Oswald' });

const contenu = [
  { title:'VIDÉO REELS', items:'• Format n°1 sur Meta\n• Vidéos 20-40s : ambiance, coulisses, fabrication\n• Mix pro + authentique (filmé iPhone)\n• Le contenu « amateur » génère plus d\'engagement', color: LAVENDER },
  { title:'CONTENU ESPAGNOL', items:'• Recyclage vidéos du compte ES (39K)\n• Sous-titres français ajoutés\n• Collaborations vidéos avec franchisés internationaux\n• L\'authenticité internationale est une force', color: ORANGE_CARD },
  { title:'NANO-INFLUENCEURS', items:'• Partenariats food creators Paris\n• Audiences engagées et spécialisées\n• Dotations produit en échange de contenu\n• UGC (contenu généré par les clients)', color: LAVENDER },
  { title:'PERSONAL BRANDING', items:'• Incarner la marque par les fondateurs\n• Les consommateurs veulent connaître l\'histoire\n• Vidéos longues (3-4 min) découpées en reels\n• Min. 2 publications/semaine', color: LAVENDER }
];

contenu.forEach((c, i) => {
  const x = 0.8 + i * 3.05;
  s5.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y:1.3, w:2.85, h:4.0, fill:{color:c.color}, rectRadius:0.15, line:{color: i===1 ? ORANGE_CARD : LAVENDER, width: i===1 ? 2 : 0} });
  s5.addText(c.title, { x, y:1.5, w:2.85, h:0.5, fontSize:13, fontFace:'Oswald', color:DARK_TEXT, bold:true, align:'center' });
  s5.addText(c.items, { x:x+0.15, y:2.1, w:2.55, h:3.0, fontSize:11, color:DARK_TEXT, lineSpacingMultiple:1.4 });
});

s5.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:0.8, y:5.6, w:11.7, h:0.7, fill:{color:SURFACE}, rectRadius:0.1, line:{color:BORDER, width:1} });
s5.addText('📌 Production : ~10 vidéos pro/an + ~50 vidéos authentiques + recyclage contenu ES. Préparer 3 mois en une session = 12 vidéos.', { x:1.1, y:5.65, w:11, h:0.6, fontSize:11, color:TEXT2, align:'center' });

// ===== SLIDE 6 : B2C BUDGET =====
let s6 = pptx.addSlide();
s6.background = { fill: BG };
addGradientBar(s6);
s6.addText([{text:'B2C CLIENTS / ', options:{color:LAVENDER}}, {text:'BUDGET À TIROIR', options:{color:TEXT}}], { x:0.8, y:0.4, w:11, h:0.7, fontSize:30, fontFace:'Oswald' });

const b2cTiers = [
  { title:'ESSENTIEL', price:'1 500€/mois', split:'média : 1 000€ / honoraires : 500€', items:'Trafic Meta + acquisition followers\nNotoriété Meta (IG + FB)\nAudiences lookalike Espagne\n1-2 audiences personnalisées\nDashboard personnalisé 24h/24\nReporting mensuel', result:'~Reach 100-150K/mois', bg:BLUE_CARD, resultBg:'4A90B8', resultColor:'FFFFFF' },
  { title:'PERFORMANCE', price:'2 000€/mois', split:'média : 1 300€ / honoraires : 700€', items:'Trafic + Engagement + Notoriété Meta\nGoogle Search + Remarketing\n3-4 audiences testées\nTracking complet du site\nContenu recyclé ES → FR\nDashboard unifié 24h/24', result:'~Reach 250-400K/mois', bg:ORANGE_CARD, resultBg:'D4A04A', resultColor:'FFFFFF' },
  { title:'ACCÉLÉRATION', price:'3 000€/mois', split:'média : 2 000€ / honoraires : 1 000€', items:'Full activation Meta multi-objectifs\nGoogle Search + Remarketing avancé\n5-6 audiences testées\nStratégie nano-influenceurs\nAcquisition followers continue\nCanal WhatsApp équipe Koven 7j/7', result:'~Reach 500K+/mois', bg:PINK_CARD, resultBg:'C84B8A', resultColor:'FFFFFF' }
];

b2cTiers.forEach((t, i) => {
  const x = 0.8 + i * 4.0;
  s6.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y:1.2, w:3.8, h:5.5, fill:{color:t.bg}, rectRadius:0.15 });
  s6.addText(t.title, { x, y:1.4, w:3.8, h:0.5, fontSize:16, fontFace:'Oswald', color:DARK_TEXT, bold:true, align:'center' });
  s6.addText(t.price, { x, y:1.9, w:3.8, h:0.5, fontSize:28, fontFace:'Oswald', color:DARK_TEXT, align:'center' });
  s6.addText(t.split, { x, y:2.4, w:3.8, h:0.35, fontSize:10, color:DARK_TEXT, align:'center' });
  s6.addText(t.items, { x:x+0.2, y:2.9, w:3.4, h:2.8, fontSize:11, color:DARK_TEXT, lineSpacingMultiple:1.5 });
  s6.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:x+0.2, y:5.8, w:3.4, h:0.55, fill:{color:t.resultBg}, rectRadius:0.1 });
  s6.addText(t.result, { x:x+0.2, y:5.8, w:3.4, h:0.55, fontSize:14, fontFace:'Oswald', color:t.resultColor, align:'center', bold:true });
});

// ===== SLIDE 7 : B2B FRANCHISE STRATEGY =====
let s7 = pptx.addSlide();
s7.background = { fill: BG };
addGradientBar(s7);
s7.addText([{text:'CIBLE 2 : ', options:{color:LAVENDER}}, {text:'B2B FRANCHISE (À PARTIR DU 6ÈME MOIS)', options:{color:TEXT}}], { x:0.8, y:0.4, w:11, h:0.7, fontSize:28, fontFace:'Oswald' });
s7.addText('La notoriété B2C construit la désirabilité. Les futurs franchisés vérifieront votre présence digitale — une communauté forte est votre meilleur argument.', { x:0.8, y:1.1, w:10, h:0.6, fontSize:13, color:TEXT2 });

const funnelB2B = [
  { title:'TOFU — Notoriété / 40% du budget', items:'• Vidéos fondateurs (personal branding)\n• Contenu B2C exploitable pour le recrutement franchise\n• Coulisses réseau, ambiance boutique\n• Objectif : éduquer l\'audience, créer le lien', channel:'Meta (IG + FB)', chBg:PINK_CARD, border:'3D2E38' },
  { title:'MOFU — Considération / 35% du budget', items:'• Témoignages franchisés internationaux (Espagne, Pays-Bas)\n• Carrousels chiffres clés & étapes pour devenir franchisé\n• Contenu « Pourquoi Tío Bigotes » — retargeting viewers 50%+', channel:'Meta + Google Search', chBg:ORANGE_CARD, border:'3D3528' },
  { title:'BOFU — Conversion / 25% du budget', items:'• Lead Ads formulaire qualifié (Meta)\n• Google Search : « franchise empanadas », « ouvrir restaurant argentin »\n• Retargeting visiteurs page franchise', channel:'Meta + Google Search', chBg:BLUE_CARD, border:'283540' }
];

funnelB2B.forEach((f, i) => {
  const y = 1.9 + i * 1.7;
  s7.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:0.8, y, w:9.5, h:1.45, fill:{color:SURFACE}, rectRadius:0.12, line:{color:f.border, width:1.5} });
  s7.addText(f.title, { x:1.1, y:y+0.05, w:8, h:0.4, fontSize:13, fontFace:'Oswald', color:LAVENDER, bold:true });
  s7.addText(f.items, { x:1.1, y:y+0.4, w:7.5, h:1.0, fontSize:11, color:TEXT2, lineSpacingMultiple:1.3 });
  s7.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:10.6, y:y+0.3, w:2.2, h:0.7, fill:{color:f.chBg}, rectRadius:0.08 });
  s7.addText('CANAUX :\n' + f.channel, { x:10.6, y:y+0.3, w:2.2, h:0.7, fontSize:10, fontFace:'Oswald', color:DARK_TEXT, align:'center', bold:true });
});

// ===== SLIDE 8 : B2B BUDGET =====
let s8 = pptx.addSlide();
s8.background = { fill: BG };
addGradientBar(s8);
s8.addText([{text:'B2B FRANCHISE / ', options:{color:LAVENDER}}, {text:'BUDGET À TIROIR', options:{color:TEXT}}], { x:0.8, y:0.4, w:11, h:0.7, fontSize:30, fontFace:'Oswald' });

const b2bTiers = [
  { title:'ESSENTIEL', price:'1 750€/mois HT', split:'média : 1 000€ / honoraires : 750€', items:'Meta Lead Ads (BOFU uniquement)\nGoogle Search marque + générique\nRemarketing site franchise\n1 audience lookalike\nReporting mensuel\nPipeline de suivi des leads', result:'~30-50 leads/mois', bg:BLUE_CARD, resultBg:'4A90B8', resultColor:'FFFFFF' },
  { title:'PERFORMANCE', price:'2 350€/mois', split:'média : 1 500€ / honoraires : 850€', items:'TOFU vidéo fondateurs + BOFU Lead Ads\nGoogle Search + Remarketing\n3-5 audiences testées\nCréatifs renouvelés mensuellement\nDashboard personnalisé 24h/24', result:'~60-100 leads/mois', bg:ORANGE_CARD, resultBg:'D4A04A', resultColor:'FFFFFF' },
  { title:'ACCÉLÉRATION', price:'3 500€/mois', split:'média : 2 500€ / honoraires : 1 000€', items:'Full funnel TOFU + MOFU + BOFU\nGoogle Search + Remarketing avancé\nMeta multi-objectifs\nAcquisition followers continue\nCréatifs renouvelés mensuellement\nCanal WhatsApp équipe Koven 7j/7', result:'~120-180 leads/mois', bg:PINK_CARD, resultBg:'C84B8A', resultColor:'FFFFFF' }
];

b2bTiers.forEach((t, i) => {
  const x = 0.8 + i * 4.0;
  s8.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y:1.2, w:3.8, h:5.5, fill:{color:t.bg}, rectRadius:0.15 });
  s8.addText(t.title, { x, y:1.4, w:3.8, h:0.5, fontSize:16, fontFace:'Oswald', color:DARK_TEXT, bold:true, align:'center' });
  s8.addText(t.price, { x, y:1.9, w:3.8, h:0.5, fontSize:28, fontFace:'Oswald', color:DARK_TEXT, align:'center' });
  s8.addText(t.split, { x, y:2.4, w:3.8, h:0.35, fontSize:10, color:DARK_TEXT, align:'center' });
  s8.addText(t.items, { x:x+0.2, y:2.9, w:3.4, h:2.8, fontSize:11, color:DARK_TEXT, lineSpacingMultiple:1.5 });
  s8.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:x+0.2, y:5.8, w:3.4, h:0.55, fill:{color:t.resultBg}, rectRadius:0.1 });
  s8.addText(t.result, { x:x+0.2, y:5.8, w:3.4, h:0.55, fontSize:14, fontFace:'Oswald', color:t.resultColor, align:'center', bold:true });
});

// ===== SLIDE 9 : RÉCAPITULATIF =====
let s9 = pptx.addSlide();
s9.background = { fill: BG };
addGradientBar(s9);
s9.addText([{text:'RÉCAPITULATIF / ', options:{color:LAVENDER}}, {text:'INVESTISSEMENT GLOBAL MENSUEL', options:{color:TEXT}}], { x:0.8, y:0.3, w:11, h:0.6, fontSize:26, fontFace:'Oswald' });

const recapRows = [
  [{text:'', options:{fill:{color:BG}}}, {text:'ESSENTIEL', options:{fill:{color:BLUE_CARD}, color:DARK_TEXT, fontSize:13, fontFace:'Oswald', bold:true, align:'center'}}, {text:'PERFORMANCE', options:{fill:{color:ORANGE_CARD}, color:DARK_TEXT, fontSize:13, fontFace:'Oswald', bold:true, align:'center'}}, {text:'ACCÉLÉRATION', options:{fill:{color:PINK_CARD}, color:DARK_TEXT, fontSize:13, fontFace:'Oswald', bold:true, align:'center'}}],
  [{text:'B2C Clients — Média', options:{color:TEXT, bold:true}}, {text:'1 000€', options:{color:TEXT2, align:'center'}}, {text:'1 300€', options:{color:TEXT2, align:'center'}}, {text:'2 000€', options:{color:TEXT2, align:'center'}}],
  [{text:'B2C Clients — Honoraires', options:{color:TEXT, bold:true}}, {text:'500€', options:{color:TEXT2, align:'center'}}, {text:'700€', options:{color:TEXT2, align:'center'}}, {text:'1 000€', options:{color:TEXT2, align:'center'}}],
  [{text:'B2B Franchise — Média (au 6ème mois)', options:{color:TEXT}}, {text:'1 000€', options:{color:TEXT2, align:'center'}}, {text:'1 500€', options:{color:TEXT2, align:'center'}}, {text:'2 500€', options:{color:TEXT2, align:'center'}}],
  [{text:'B2B Franchise — Honoraires (au 6ème mois)', options:{color:TEXT}}, {text:'750€', options:{color:TEXT2, align:'center'}}, {text:'850€', options:{color:TEXT2, align:'center'}}, {text:'1 000€', options:{color:TEXT2, align:'center'}}],
  [{text:'Total mensuel (B2C seul)', options:{color:LAVENDER, bold:true, fontSize:14, fontFace:'Oswald'}}, {text:'1 500€/mois', options:{color:ACCENT, bold:true, fontSize:16, fontFace:'Oswald', align:'center'}}, {text:'2 000€/mois', options:{color:GOLD, bold:true, fontSize:16, fontFace:'Oswald', align:'center'}}, {text:'3 000€/mois', options:{color:KOVEN_ORANGE, bold:true, fontSize:16, fontFace:'Oswald', align:'center'}}],
  [{text:'Total mensuel (B2C + B2B)', options:{color:LAVENDER, bold:true, fontSize:14, fontFace:'Oswald'}}, {text:'3 250€/mois', options:{color:ACCENT, bold:true, fontSize:16, fontFace:'Oswald', align:'center'}}, {text:'4 350€/mois', options:{color:GOLD, bold:true, fontSize:16, fontFace:'Oswald', align:'center'}}, {text:'6 500€/mois', options:{color:KOVEN_ORANGE, bold:true, fontSize:16, fontFace:'Oswald', align:'center'}}]
];

s9.addTable(recapRows, { x:0.5, y:1.1, w:12.3, fontSize:12, border:{type:'solid', color:BORDER, pt:0.5}, colW:[4.0, 2.77, 2.77, 2.77], rowH:[0.5, 0.45, 0.45, 0.45, 0.45, 0.55, 0.55], autoPage:false });

s9.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:0.5, y:5.0, w:12.3, h:2.0, fill:{color:BLUE_CARD}, rectRadius:0.12 });
s9.addText('• PHASE 0 (setup unique) : 1 500€ HT — inclus dans le 1er mois\n• Les cibles sont activables indépendamment / vous pouvez mixer les paliers\n• Honoraires = gestion, optimisation, reporting, dashboard. Budget média = versé directement à Meta/Google\n• Engagement minimum recommandé : 3 mois / les algorithmes ont besoin de données pour optimiser\n• Les comptes publicitaires, pages et données restent 100% propriété de Tío Bigotes — aucune rétention', { x:0.8, y:5.1, w:11.7, h:1.8, fontSize:11, color:DARK_TEXT, lineSpacingMultiple:1.4 });

// ===== SLIDE 10 : SCÉNARIOS =====
let s10 = pptx.addSlide();
s10.background = { fill: BG };
addGradientBar(s10);
s10.addText('SCÉNARIOS', { x:0.8, y:0.4, w:11, h:0.7, fontSize:30, fontFace:'Oswald', color:LAVENDER });

const scenarios = [
  { title:'SCÉNARIO A / LANCEMENT', price:'1 500€/mois', sub:'puis +1 750€/mois au 6ème mois (franchise)', items:'B2C Essentiel (1 000€ média)\nTrafic + Engagement + Notoriété\nAcquisition followers lookalike ES\n+ Honoraires (500€)\n\nÀ partir du 6ème mois :\n+ B2B Franchise Essentiel\n(1 000€ média + 750€ honoraires)', result:'Construire la base, puis activer la franchise', bg:BLUE_CARD, resultBg:'4A90B8', resultColor:'FFFFFF' },
  { title:'SCÉNARIO B / ÉQUILIBRÉ', price:'2 000€/mois', sub:'puis +2 350€/mois au 6ème mois (franchise)', items:'B2C Performance (1 300€ média)\nMeta + Google Search + Remarketing\nTracking complet + dashboard 24/7\n+ Honoraires (700€)\n\nÀ partir du 6ème mois :\n+ B2B Franchise Performance\n(1 500€ média + 850€ honoraires)', result:'RECOMMANDÉ : meilleur ratio impact/budget', bg:ORANGE_CARD, resultBg:'D4A04A', resultColor:'FFFFFF' },
  { title:'SCÉNARIO C / ACCÉLÉRATION', price:'3 000€/mois', sub:'puis +3 500€/mois au 6ème mois (franchise)', items:'B2C Accélération (2 000€ média)\nFull activation Meta + Google\nNano-influenceurs + WhatsApp 7j/7\n+ Honoraires (1 000€)\n\nÀ partir du 6ème mois :\n+ B2B Franchise Accélération\n(2 500€ média + 1 000€ honoraires)', result:'Croissance maximale sur tous les fronts', bg:PINK_CARD, resultBg:'C84B8A', resultColor:'FFFFFF' }
];

scenarios.forEach((s, i) => {
  const x = 0.8 + i * 4.0;
  s10.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y:1.2, w:3.8, h:5.8, fill:{color:s.bg}, rectRadius:0.15 });
  s10.addText(s.title, { x, y:1.35, w:3.8, h:0.5, fontSize:14, fontFace:'Oswald', color:DARK_TEXT, bold:true, align:'center' });
  s10.addText(s.price, { x, y:1.85, w:3.8, h:0.5, fontSize:28, fontFace:'Oswald', color:DARK_TEXT, align:'center' });
  s10.addText(s.sub, { x, y:2.35, w:3.8, h:0.35, fontSize:10, color:DARK_TEXT, align:'center' });
  s10.addText(s.items, { x:x+0.2, y:2.8, w:3.4, h:3.2, fontSize:11, color:DARK_TEXT, lineSpacingMultiple:1.35 });
  s10.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:x+0.2, y:6.1, w:3.4, h:0.6, fill:{color:s.resultBg}, rectRadius:0.1 });
  s10.addText(s.result, { x:x+0.2, y:6.1, w:3.4, h:0.6, fontSize:11, fontFace:'Oswald', color:s.resultColor, align:'center', bold:true });
});

// ===== SLIDE 11 : ENGAGEMENTS =====
let s11 = pptx.addSlide();
s11.background = { fill: BG };
addGradientBar(s11);
s11.addText([{text:'NOS ', options:{color:LAVENDER}}, {text:'ENGAGEMENTS', options:{color:TEXT}}], { x:0.8, y:0.4, w:11, h:0.7, fontSize:30, fontFace:'Oswald' });

const engagements = [
  { title:'PROPRIÉTÉ TOTALE', text:'Tous les comptes, pages, pixels et données créés restent 100% propriété de Tío Bigotes. Aucune rétention en cas de fin de collaboration.', border:LAVENDER },
  { title:'TRANSPARENCE', text:'Dashboard personnalisé accessible 24h/24. Budget média versé directement aux plateformes. Reporting détaillé avec preuves de dépenses.', border:PINK_CARD },
  { title:'RÉACTIVITÉ', text:'Réponse < 3h en semaine. Optimisations en continu. Call de suivi régulier. Ajustement des campagnes sans délai.', border:ACCENT },
  { title:'FLEXIBILITÉ', text:'Engagement 3 mois renouvelable. Possibilité de monter ou descendre de palier chaque trimestre. Offre modulable par cible.', border:GREEN_CARD },
  { title:'EXPERTISE RESTAURATION', text:'Ôcargo, The Crying Tiger, Mamie Bigoude, Olla Poké, Biba Brunch, Toa Sushi, Marvely — notre secteur de prédilection.', border:ORANGE_CARD },
  { title:'STRATÉGIE SUR-MESURE', text:'Exploitation du compte espagnol (39K) en lookalike. Recyclage contenu international. Approche B2C d\'abord, B2B franchise à 6 mois.', border:BLUE_CARD }
];

engagements.forEach((e, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 0.8 + col * 4.0;
  const y = 1.3 + row * 2.8;
  s11.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y, w:3.8, h:2.4, fill:{color:SURFACE}, rectRadius:0.12, line:{color:e.border, width:1.5} });
  s11.addText(e.title, { x:x+0.2, y:y+0.15, w:3.4, h:0.4, fontSize:13, fontFace:'Oswald', color:TEXT, bold:true });
  s11.addText(e.text, { x:x+0.2, y:y+0.6, w:3.4, h:1.6, fontSize:11, color:TEXT2, lineSpacingMultiple:1.4 });
});

// ===== SLIDE 12 : CTA =====
let s12 = pptx.addSlide();
s12.background = { fill: BG };
addGradientBar(s12);
s12.addImage({ path: path.resolve(__dirname, 'koven-logo.png'), x:1.5, y:1.8, w:4.5, h:1.5, sizing:{type:'contain',w:4.5,h:1.5} });
s12.addText('×', { x:6.0, y:2.0, w:0.8, h:1.0, fontSize:30, color:TEXT3, align:'center' });
s12.addImage({ path:'https://tiobigotes.fr/cdn/shop/files/logo-blanc.png?v=1692804243&width=600', x:7.0, y:1.5, w:5.5, h:1.8, sizing:{type:'contain',w:5.5,h:1.8} });
s12.addText([{text:'PASSONS À ', options:{color:TEXT}}, {text:"L'ACTION.", options:{color:ACCENT, italic:true}}], { x:1, y:4.2, w:11, h:1.2, fontSize:48, fontFace:'Oswald', align:'center' });

// ===== SAVE =====
const outPath = path.resolve(__dirname, 'Presentation-Koven-TioBigotes.pptx');
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log('PPTX generated: ' + outPath);
}).catch(err => {
  console.error('Error:', err);
});
