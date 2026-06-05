/**
 * Insère le tableau de suivi (template Mobalpa) DANS l'onglet existant
 * "Suivi Budgets Schmidt", en haut (lignes 1 → 9), sans toucher à la
 * répartition budgets ligne 32+. Masque l'onglet à la fin.
 *
 * Reprend :
 *  - 3 campagnes pays : FRANCE, BELGIQUE, SUISSE (canal FB)
 *  - Budgets prévus mensuels issus de la ligne 33 → 35 du même onglet
 *  - Dépenses réelles via SUMIFS sur "Data Extract Schmidt"
 *  - Ligne Total
 *  - Onglet masqué à la fin
 *
 * Mode d'emploi :
 *  1. Ouvrir le Google Sheet
 *  2. Extensions → Apps Script
 *  3. Coller ce fichier (remplace le code existant)
 *  4. Sauvegarder, choisir la fonction `creerSuiviDepensesSchmidt`, cliquer Run
 *  5. Autoriser l'accès quand demandé
 */

const ONGLET_CIBLE = 'Suivi Budgets Schmidt '; // /!\ espace final dans le nom réel
const ONGLET_DATA  = 'Data Extract Schmidt';
const ANNEE        = '2026';

// Le template est inséré sur les lignes 1 → 9 (tout au-dessus de la ligne 32
// qui contient déjà la répartition budgets brute). On NE touche PAS aux
// lignes >= 10 — la zone existante (ligne 32 etc.) reste intacte.
const LIGNE_DEBUT      = 1;
const LIGNE_FIN_ZONE   = 9; // dernière ligne occupée par le template (ligne Total)

// Budgets prévus mensuels (depuis "Suivi Budgets Schmidt" lignes 33-35, colonnes C→N)
// Ordre : Janvier → Décembre
const BUDGETS = {
  'Schmidt France'  : [1200, 1008, 1152, 1800, 1584, 1440,  864,  720, 1728, 1728, 1440, 1152],
  'Schmidt Belgique': [   0,  420,    0, 1000,  800,  600,  360,  300,  720,  720,  600,  480],
  'Schmidt Suisse'  : [   0,    0,    0,  684,  396,  360,  216,  180,  432,  432,  360,  288],
};

// Suffixes de nom de campagne pour le SUMIFS (campagnes Schmidt finissent par _FR / _BE / _SW)
const SUFFIXE_PAYS = {
  'Schmidt France'  : '*_FR',
  'Schmidt Belgique': '*_BE',
  'Schmidt Suisse'  : '*_SW',
};

const ORDRE_PAYS = ['Schmidt France', 'Schmidt Belgique', 'Schmidt Suisse'];

/** Debug : liste les noms exacts de tous les onglets dans les logs. */
function listerOnglets() {
  const noms = SpreadsheetApp.getActiveSpreadsheet()
    .getSheets()
    .map(s => `"${s.getName()}" (masqué=${s.isSheetHidden()})`);
  Logger.log(noms.join('\n'));
}

function creerSuiviDepensesSchmidt() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Récupérer l'onglet existant (sans le supprimer)
  const sheet = ss.getSheetByName(ONGLET_CIBLE);
  if (!sheet) {
    const dispo = ss.getSheets().map(s => `"${s.getName()}"`).join(', ');
    throw new Error(
      `Onglet "${ONGLET_CIBLE}" introuvable.\n\nOnglets disponibles : ${dispo}`
    );
  }

  const NB_COLS = 26;
  const NB_LIGNES = 9; // template lignes 1 → 9

  // 2. Nettoyer UNIQUEMENT la zone du template (lignes 1 → 9)
  //    → la ligne 32+ (répartition budgets brute) reste intacte
  sheet.getRange(LIGNE_DEBUT, 1, NB_LIGNES, NB_COLS)
       .clear({ contentsOnly: false });

  // 3. Construire TOUT le tableau en mémoire (1 seul setValues à la fin)
  //    Les chaînes commençant par "=" sont interprétées comme formules.
  const grille = Array.from({ length: NB_LIGNES }, () =>
    Array(NB_COLS).fill('')
  );

  // Ligne 1 : Client | Canaux
  grille[0][0] = 'Client';
  grille[0][1] = 'Canaux';

  // Ligne 2 : 2026|01 | Dépenses | 2026|02 | Dépenses | ... × 12
  for (let m = 1; m <= 12; m++) {
    const mm = String(m).padStart(2, '0');
    grille[1][2 + (m - 1) * 2]     = `${ANNEE}|${mm}`;
    grille[1][2 + (m - 1) * 2 + 1] = 'Dépenses';
  }

  // Lignes pays : 3, 5, 7 (avec ligne vide entre chaque)
  const lignesPays = [3, 5, 7]; // n° de ligne (1-based)
  ORDRE_PAYS.forEach((pays, idx) => {
    const r = lignesPays[idx] - 1; // index 0-based dans grille
    grille[r][0] = pays;
    grille[r][1] = 'FB';

    for (let m = 0; m < 12; m++) {
      const mm = String(m + 1).padStart(2, '0');
      const cBudget   = 2 + m * 2;     // index 0-based
      const cDepenses = 2 + m * 2 + 1;

      // Budget prévu (valeur)
      grille[r][cBudget] = BUDGETS[pays][m];

      // Dépenses réelles (formule SUMIFS sur Data Extract Schmidt)
      grille[r][cDepenses] =
        `=SUMIFS('${ONGLET_DATA}'!O:O,` +
        ` '${ONGLET_DATA}'!L:L, "${SUFFIXE_PAYS[pays]}",` +
        ` '${ONGLET_DATA}'!M:M, "${ANNEE}|${mm}")`;
    }
  });

  // Ligne 9 : Total (somme des lignes 3, 5, 7)
  const rTotal = 8; // index 0-based pour ligne 9
  grille[rTotal][0] = 'Total';
  for (let m = 0; m < 12; m++) {
    const cBudget   = 2 + m * 2;
    const cDepenses = 2 + m * 2 + 1;
    const lettreB = colonneEnLettre(cBudget + 1);
    const lettreD = colonneEnLettre(cDepenses + 1);
    grille[rTotal][cBudget]   = `=${lettreB}3+${lettreB}5+${lettreB}7`;
    grille[rTotal][cDepenses] = `=${lettreD}3+${lettreD}5+${lettreD}7`;
  }

  // 4. UN SEUL appel pour poser tout le contenu
  sheet.getRange(LIGNE_DEBUT, 1, NB_LIGNES, NB_COLS).setValues(grille);

  // 5. Mise en forme (en plages, pas cellule par cellule)
  // Format devise sur toutes les colonnes mois × 7 lignes (3 → 9)
  sheet.getRange(3, 3, 7, 24).setNumberFormat('# ##0 €');

  // En-têtes en gras
  sheet.getRange(1, 1, 2, NB_COLS).setFontWeight('bold');
  sheet.getRange(9, 1, 1, NB_COLS).setFontWeight('bold');

  // Fond léger sur en-têtes + total
  sheet.getRange(1, 1, 2, NB_COLS).setBackground('#f3f3f3');
  sheet.getRange(9, 1, 1, NB_COLS).setBackground('#e8eaed');

  // Largeurs colonnes en batch
  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 70);
  sheet.setColumnWidths(3, 24, 90);

  // Geler en-têtes
  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(2);

  // 6. Masquer l'onglet
  sheet.hideSheet();

  SpreadsheetApp.getUi().alert(
    `✅ Tableau de suivi inséré dans "${ONGLET_CIBLE}" (lignes 1-9), ` +
    `onglet masqué.\n\n` +
    `Pour le rendre visible : clic droit dans la barre d'onglets → ` +
    `Onglets masqués → ${ONGLET_CIBLE}.`
  );
}

/** Convertit un index de colonne (1-based) en lettre Excel (1=A, 27=AA…) */
function colonneEnLettre(col) {
  let s = '';
  while (col > 0) {
    const r = (col - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    col = Math.floor((col - 1) / 26);
  }
  return s;
}
