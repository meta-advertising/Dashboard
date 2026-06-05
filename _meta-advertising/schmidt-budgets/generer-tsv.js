// Génère le fichier TSV à coller en A1 de l'onglet "Suivi Budgets Schmidt "
// Usage : node generer-tsv.js

const fs = require('fs');
const path = require('path');

const ANNEE = '2026';
const ONGLET_DATA = 'Data Extract Schmidt';

const BUDGETS = {
  'Schmidt France'  : [1200, 1008, 1152, 1800, 1584, 1440,  864,  720, 1728, 1728, 1440, 1152],
  'Schmidt Belgique': [   0,  420,    0, 1000,  800,  600,  360,  300,  720,  720,  600,  480],
  'Schmidt Suisse'  : [   0,    0,    0,  684,  396,  360,  216,  180,  432,  432,  360,  288],
};
const SUFFIXE = {
  'Schmidt France'  : '*_FR',
  'Schmidt Belgique': '*_BE',
  'Schmidt Suisse'  : '*_SW',
};
const ORDRE = ['Schmidt France', 'Schmidt Belgique', 'Schmidt Suisse'];

const NB_COLS = 26;
const NB_LIGNES = 9;
const grille = Array.from({ length: NB_LIGNES }, () => Array(NB_COLS).fill(''));

// Ligne 1
grille[0][0] = 'Client';
grille[0][1] = 'Canaux';

// Ligne 2 : mois alternés avec Dépenses
for (let m = 1; m <= 12; m++) {
  const mm = String(m).padStart(2, '0');
  grille[1][2 + (m - 1) * 2]     = `${ANNEE}|${mm}`;
  grille[1][2 + (m - 1) * 2 + 1] = 'Dépenses';
}

// Lignes pays (3, 5, 7)
const lignesPays = [3, 5, 7];
ORDRE.forEach((pays, idx) => {
  const r = lignesPays[idx] - 1;
  grille[r][0] = pays;
  grille[r][1] = 'FB';
  for (let m = 0; m < 12; m++) {
    const mm = String(m + 1).padStart(2, '0');
    const cBudget = 2 + m * 2;
    const cDepenses = 2 + m * 2 + 1;
    grille[r][cBudget] = BUDGETS[pays][m];
    // Séparateur ; pour locale FR
    grille[r][cDepenses] =
      `=SUMIFS('${ONGLET_DATA}'!O:O; '${ONGLET_DATA}'!L:L; "${SUFFIXE[pays]}"; '${ONGLET_DATA}'!M:M; "${ANNEE}|${mm}")`;
  }
});

// Ligne 9 : Total
function colLetter(col) {
  let s = '';
  while (col > 0) {
    const r = (col - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    col = Math.floor((col - 1) / 26);
  }
  return s;
}
const rTotal = 8;
grille[rTotal][0] = 'Total';
for (let m = 0; m < 12; m++) {
  const cBudget = 2 + m * 2;
  const cDepenses = 2 + m * 2 + 1;
  const lB = colLetter(cBudget + 1);
  const lD = colLetter(cDepenses + 1);
  grille[rTotal][cBudget]   = `=${lB}3+${lB}5+${lB}7`;
  grille[rTotal][cDepenses] = `=${lD}3+${lD}5+${lD}7`;
}

// Sérialiser en TSV
const tsv = grille.map(row => row.join('\t')).join('\n');
const out = path.join(__dirname, 'a-coller-en-A1.tsv');
fs.writeFileSync(out, tsv, 'utf8');
console.log('✅ Fichier généré :', out);
console.log('\nAperçu :\n');
console.log(tsv.split('\n').map(l => l.length > 120 ? l.slice(0, 120) + '…' : l).join('\n'));
