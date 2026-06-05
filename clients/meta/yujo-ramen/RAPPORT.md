# Audit technique — Formulaire franchise yujoramen.com

**Cible :** https://www.yujoramen.com/fr/franchise/
**Date audit :** 2026-05-25
**Objectif :** préparer un Form Submit Tracker dans GTM Web (container `GTM-TVZSHDNW`).

---

## 1. HTML statique (curl)

Commande utilisée :

```bash
curl -sL -A "Mozilla/5.0" https://www.yujoramen.com/fr/franchise/ > page.html
```

**Résultat :** page complète téléchargée (34 385 octets, 614 lignes, encodage **latin-1** — accents échappés en entités HTML).

Comptage des balises form/inputs dans la source statique :

| Élément | Nombre |
|---|---|
| `<form>` | **1** |
| `<input>` | **10** |
| `<textarea>` | **1** |
| `<select>` | 0 |
| `<button>` | 1 (le bouton fermer × de la modale) |

> **Conclusion étape 1 :** le formulaire **EST pré-rendu côté serveur** dans le DOM caché — il n'est PAS injecté dynamiquement au clic. Le clic sur le CTA ne fait qu'afficher visuellement (toggle CSS) un bloc déjà présent dans le HTML.

---

## 2. Audit Playwright

**Skip motivé.** Étape 2 prévue uniquement « si aucun `<form>` n'est trouvé OU si le form semble vide ». Or :

- 1 `<form id="ContactForm">` complet avec **10 inputs + 1 textarea** est déjà présent dans le HTML statique
- Le markup de la modale (`#LpFormOverlay`, `#LpFormPopup`, `#LpFormClose`, `.lpFormHeader`, `.lpFormContent`, `.popupform`, `.lpFormProofs`) est lui aussi pré-rendu
- Le JS qui pilote la modale (`HandleFranchiseForm()` dans `frontend.js`) confirme qu'il fait uniquement un **toggle de classe CSS `.active`** sur l'overlay — aucune injection HTML

→ Playwright n'apporterait aucune information supplémentaire pour cet audit. Tout est exploitable depuis la source statique.

---

## 3. Détail du formulaire

### 3.1 Wrapper modale (contexte parent du form)

```html
<!-- POPUP FORM OVERLAY -->
<div id="LpFormOverlay" class="lpFormOverlay ">
  <div id="LpFormPopup" class="lpFormPopup">
    <button type="button" id="LpFormClose" class="lpFormClose">…×…</button>
    <div class="lpFormHeader">…titre + logo…</div>
    <div class="lpFormContent">
      <div class="popupform">
        <!-- LE FORM CI-DESSOUS -->
      </div>
      <p class="centered bluecolor"><i class="fa-solid fa-check"></i> Devis 100% gratuit et sans engagement</p>
    </div>
    <div class="lpFormProofs">…</div>
  </div>
</div>
```

État fermé : `class="lpFormOverlay "` (espace fin = vide). État ouvert (après clic CTA) : `class="lpFormOverlay active"` (toggle JS).
État `opened` (mot-clé serveur) : `class="lpFormOverlay opened"` → la modale est rouverte automatiquement au chargement (probablement après un POST en erreur).

### 3.2 Form complet — outerHTML

```html
<form id="ContactForm" action="https://www.yujoramen.com/fr/franchise/#FormW" method="post" enctype="multipart/form-data"  class="" >
  <div id="ContactFormWrapper">
    <fieldset id="ContactFormMainFieldset">
      <p id="field-security" class="textField ">
        <label for="security">security </label>
        <input type="text" id="security" name="security" value="" placeholder="security">
      </p>
      <p id="field-nom" class="textField ">
        <label for="nom">Nom *</label>
        <input type="text" id="nom" name="nom" value="" placeholder="Nom*">
      </p>
      <p id="field-prenom" class="textField ">
        <label for="prenom">Prénom *</label>
        <input type="text" id="prenom" name="prenom" value="" placeholder="Prénom*">
      </p>
      <p id="field-email" class="textField ">
        <label for="email">Adresse E-mail *</label>
        <input type="text" id="email" name="email" value="" placeholder="Adresse E-mail*">
      </p>
      <p id="field-tel" class="textField ">
        <label for="tel">N° de téléphone *</label>
        <input type="text" id="tel" name="tel" value="" placeholder="N° de téléphone*">
      </p>
      <p id="field-infos" class="textareaField ">
        <label for="infos">Informations complémentaires (zone d'implantation souhaitée, budget disponible...) *</label>
        <textarea id="infos" name="infos" cols="30" rows="10"></textarea>
      </p>
      <input type="hidden" id="url"           name="url"           value="https://www.yujoramen.com/fr/franchise/" placeholder="">
      <input type="hidden" id="fbclid_input"  name="fbclid_input"  value="" placeholder="">
      <input type="hidden" id="gclid_input"   name="gclid_input"   value="" placeholder="">
      <div class="formButtons" id="ContactFormButtons">
        <input type="submit" id="ContactFormSubmit" name="ContactFormSubmit" class=" submitButton" value="Rejoins la franchise !" />
      </div>
    </fieldset>
    <input type="hidden" name="ContactForm" value="1" />
  </div>
</form>
```

### 3.3 Tag d'ouverture

```html
<form id="ContactForm"
      action="https://www.yujoramen.com/fr/franchise/#FormW"
      method="post"
      enctype="multipart/form-data"
      class="">
```

### 3.4 Tableau des champs

| # | name | type | id | required* | placeholder | value | Rôle |
|---|---|---|---|---|---|---|---|
| 1 | `security` | text | `security` | non | `security` | (vide) | **HONEYPOT** ⚠️ |
| 2 | `nom` | text | `nom` | oui (côté serveur) | `Nom*` | (vide) | Nom |
| 3 | `prenom` | text | `prenom` | oui | `Prénom*` | (vide) | Prénom |
| 4 | `email` | text | `email` | oui | `Adresse E-mail*` | (vide) | Email |
| 5 | `tel` | text | `tel` | oui | `N° de téléphone*` | (vide) | Téléphone |
| 6 | `infos` | textarea | `infos` | oui | — | (vide) | Message libre (zone d'implantation, budget…) |
| 7 | `url` | hidden | `url` | — | (vide) | `https://www.yujoramen.com/fr/franchise/` | URL d'origine du lead |
| 8 | `fbclid_input` | hidden | `fbclid_input` | — | (vide) | (vide) | Capture du fbclid (Meta) |
| 9 | `gclid_input` | hidden | `gclid_input` | — | (vide) | (vide) | Capture du gclid (Google Ads) |
| 10 | `ContactForm` | hidden | — | — | (vide) | `1` | Marqueur d'identification du form côté backend |
| 11 | `ContactFormSubmit` | submit | `ContactFormSubmit` | — | — | `Rejoins la franchise !` | Bouton submit |

\* Aucun attribut HTML `required` n'est posé — la validation des champs obligatoires est gérée **côté serveur uniquement** (le `*` dans les labels est purement visuel).

### 3.5 Champ honeypot

- **Champ :** `name="security"`, `id="security"`, `type="text"`
- **Indicateurs honeypot :**
  1. Nom incongru pour un form de contact franchise
  2. Premier champ du form (les bots remplissent souvent dans l'ordre)
  3. Label et placeholder identiques (`security`) → pas un libellé naturel
  4. Visible dans le DOM mais probablement caché en CSS (la classe `.textField` peut être surchargée, ou l'élément `#field-security` masqué via `display:none` dans `frontend.css`)
- **Règle de qualification d'un vrai lead :** `security` doit rester **vide** au moment du submit.

### 3.6 Bouton submit

- Type : `input type="submit"` (pas `<button>`)
- `id="ContactFormSubmit"`, `name="ContactFormSubmit"`
- `class=" submitButton"` (espace en préfixe)
- Texte visible (attribut `value`) : **`Rejoins la franchise !`**
- Aucun `onclick` inline, aucun handler JS attaché (voir section 4)

---

## 4. Mécanisme de soumission

### 4.1 Aucun handler JS sur `#ContactForm`

Greps effectués sur `page.html`, `frontend.js` (49 732 octets), `libs.js` (303 341 octets) :

| Mot-clé | page.html | frontend.js | libs.js |
|---|---|---|---|
| `ContactForm` | 5 (HTML uniquement) | 0 | 0 |
| `FormW` | 1 (action) | 0 | 0 |
| `$.ajax` / `$.post` / `fetch(` / `XMLHttpRequest` / `FormData(` | 0 | 0 | 0 (sauf dépendances jQuery internes) |
| `preventDefault` près de `ContactForm` | — | 0 | 0 |

→ **Aucune interception JavaScript du submit n'est attachée à `#ContactForm`.**

Le seul `$form.submit(…)` du codebase (`frontend.js:956`) cible `#NewsletterForm` (footer). Le plugin générique `$.fn.FancyForm` (`libs.js:218`) intercepte le submit + fait du `$.get` AJAX **mais il n'est appliqué qu'aux forms à l'intérieur d'une fancybox** (`$('.fancybox-inner form').FancyForm()` à `libs.js:210`). Le `#ContactForm` est dans une popup custom (`#LpFormOverlay`/`#LpFormPopup`), **pas dans une fancybox** → le plugin ne le touche pas.

### 4.2 Conclusion : POST classique avec rechargement

- **Méthode :** POST natif HTML5
- **Action :** `https://www.yujoramen.com/fr/franchise/#FormW` (même URL, ancre `#FormW`)
- **Enctype :** `multipart/form-data`
- **Pas d'AJAX, pas de redirection vers page dédiée**
- **Pas de page `/merci/` ou `/success/` distincte** — testé : `/fr/merci/`, `/fr/franchise/merci/`, `/fr/success/`, `/fr/thank-you/` retournent toutes 200 (page d'accueil/franchise par défaut), pas de slug de remerciement réservé

Le retour serveur (succès ou erreur) est très probablement géré **dans la même page `/fr/franchise/`** via :
- la classe `opened` ajoutée à `#LpFormOverlay` (vue dans `frontend.js:406` : `if ($('#LpFormOverlay').hasClass('opened')) { $overlay.addClass('active'); … }`) — rouvre la modale automatiquement après reload
- un message de succès/erreur injecté côté serveur dans `.lpFormContent` (à confirmer par un test live)

### 4.3 Implication pour GTM

- Le trigger **« Form Submission » natif** de GTM peut s'attacher au submit event AVANT le rechargement → fonctionne.
- Alternative robuste : un trigger **« Click » sur `#ContactFormSubmit`** + `event = formSubmitClick`. Comme il n'y a aucune validation front, le clic ≈ submit dans 99% des cas (l'utilisateur peut quand même soumettre vide → 400 serveur, mais le clic a eu lieu).
- **Validation honeypot indispensable** dans la règle de tag : on n'incrémente la conversion **que si `security` est vide**, sinon on tag des bots.

---

## 5. CTA d'ouverture de la modale

### 5.1 Sélecteurs exacts

Le texte exact à l'écran est **« Rejoignez la Franchise »** (et non « Rejoins la Franchise » comme dans le brief — « Rejoins la franchise ! » est le libellé du bouton submit *dans* la modale).

**4 occurrences** du CTA dans la page :

| Ligne | Markup |
|---|---|
| 149 | `<a class="button buttontype2 orange scrollLink lpOpenForm" href="#">Rejoignez la Franchise</a>` |
| 180 | `<a class="button buttontype2 orange scrollLink lpOpenForm" href="#">Rejoignez la Franchise</a>` |
| 315 | `<a class="button buttontype2 white scrollLink lpOpenForm" href="#">Rejoignez la Franchise</a>` |
| 468 | `<a class="button buttontype2 white scrollLink lpOpenForm" href="#">Rejoignez la Franchise</a>` |

Sélecteur CSS commun : **`a.lpOpenForm`** (ou plus large `.lpOpenForm`).

Le header contient aussi un CTA distinct **non lié à la modale** (lien sortant vers la page elle-même) :
```html
<a id="FranchiseButton" class="resaButton external" href="https://www.yujoramen.com/fr/franchise/"><strong>Devenir franchisé</strong></a>
```
À ne pas confondre avec le CTA d'ouverture de modale.

### 5.2 Event listener associé

Source : `frontend.js:366-413` (fonction `HandleFranchiseForm()`).

```js
$(document).ready(function() {
    var $overlay = $('#LpFormOverlay');
    var $popup   = $('#LpFormPopup');
    var $body    = $('body');

    // Ouvrir la popup
    $(document).on('click', '[href="#LpFormSection"], [href="#LpPopupForm"], .lpOpenForm', function(e) {
        e.preventDefault();
        $overlay.addClass('active');
        $body.addClass('noscroll');
    });

    // Fermer croix
    $('#LpFormClose').on('click', function() { $overlay.removeClass('active'); $body.removeClass('noscroll'); });

    // Fermer click overlay
    $overlay.on('click', function(e) {
        if ($(e.target).is($overlay)) { $overlay.removeClass('active'); $body.removeClass('noscroll'); }
    });

    // Fermer Escape
    $(document).on('keydown', function(e) {
        if (e.keyCode === 27 && $overlay.hasClass('active')) { $overlay.removeClass('active'); $body.removeClass('noscroll'); }
    });

    // Réouverture auto après submit erreur
    if ($('#LpFormOverlay').hasClass('opened')) { $overlay.addClass('active'); $body.addClass('noscroll'); }
});
```

**Sélecteurs déclencheurs (event delegation) :**
- `.lpOpenForm`
- `[href="#LpFormSection"]`
- `[href="#LpPopupForm"]`

→ Si on souhaite tracker l'ouverture de la modale dans GTM, utiliser l'OR de ces 3 sélecteurs sur un trigger Click.

---

## 6. Inventaire des tags tracking déjà présents

Sources analysées : `page.html` + scripts inline + `frontend.js` + `libs.js`.

| Tag / pixel | Présent ? | ID / valeur | Source |
|---|---|---|---|
| **Google Tag Manager** | ✅ **OUI** | **`GTM-TVZSHDNW`** | Inline script L13-17 + noscript iframe L68 |
| Google Analytics 4 (`G-XXX`) | ❌ Non en direct | — | (peut être injecté via GTM) |
| Universal Analytics (`UA-`) | ❌ Non | — | — |
| Google Ads (`AW-`) | ❌ Non en direct | — | (peut être injecté via GTM) |
| `gtag()` calls | ❌ Non en direct | — | — |
| Meta Pixel (`fbq init`) | ❌ Non en direct | — | (peut être injecté via GTM ; la page capte déjà `fbclid` dans un champ caché) |
| TikTok Pixel (`ttq`) | ❌ Non | — | — |
| LinkedIn Insight | ❌ Non | — | — |
| Pinterest (`pintrk`) | ❌ Non | — | — |
| Snap Pixel | ❌ Non | — | — |
| Reddit Pixel | ❌ Non | — | — |
| Twitter/X Pixel | ❌ Non | — | — |
| Bing/Microsoft UET | ❌ Non | — | — |
| Hotjar | ❌ Non | — | — |
| Microsoft Clarity | ❌ Non | — | — |
| Outbrain / Taboola / Criteo / Yandex | ❌ Non | — | — |

### Autres scripts tiers présents (non-tracking au sens marketing)

| Script | Rôle |
|---|---|
| `cache.consentframework.com/js/pa/36616/c/paDCv/stub` | **Sirdata CMP (consent management)** — ID partenaire `36616`, config `paDCv` |
| `choices.consentframework.com/js/pa/36616/c/paDCv/cmp` | Sirdata CMP UI |
| `maps.googleapis.com/maps/api/js?key=AIzaSyBOzdaNk58EvFRL4-6UolIwRVtbk7jBJLM` | Google Maps (clé API exposée — usage public légitime) |
| `kit.fontawesome.com/1c69d49a17.js` | Font Awesome |
| `yujoramen.com/js/libs-compressed.js` | jQuery + plugins (jQuery UI, fancybox, etc.) |
| `yujoramen.com/js/addons/tweenmax.min.js` | GSAP TweenMax (animations) |
| `yujoramen.com/js/addons/jquery.carousel.js` | Carrousels |
| `yujoramen.com/js/frontend.js` | Logique applicative (modale franchise, etc.) |

### Synthèse

- **Un seul GTM container actif : `GTM-TVZSHDNW`** — c'est le point d'entrée unique pour ajouter le Form Submit Tracker (et y déclencher les pixels Meta/Google Ads si besoin).
- **CMP Sirdata** présent : prévoir la prise en compte du consentement (Consent Mode v2) pour les futurs tags marketing déclenchés sur le submit.
- **Les champs cachés `fbclid_input` et `gclid_input`** sont déjà présents dans le form mais leur `value` est vide à l'arrivée → c'est probablement un JS hors de cette page (ou côté GTM) qui doit les peupler depuis `URLSearchParams(window.location.search)`. À vérifier si c'est fait : `frontend.js:68` contient bien un `new URLSearchParams(window.location.search)` mais sans contexte d'utilisation sur ces champs précis.

---

## Recommandations sélecteurs GTM

### Sélecteur du form (le plus robuste)

```css
form#ContactForm
```

L'ID `ContactForm` est unique, stable (server-rendered), et n'a aucun conflit avec d'autres forms (le `#NewsletterForm` du footer porte un ID différent).

**Alternative équivalente :** `#ContactForm`

À éviter : `form.popupform form` (cibler par classe parent) — la classe `popupform` est sur le `<div>` parent, pas sur le form, et reste sensible à un éventuel refactor CSS.

### Sélecteurs par champ (privilégier `name=`)

Les noms de champs sont des **identifiants logiques côté serveur** — ils ne changent pas tant qu'on ne refait pas le backend. Les classes (`textField`, `submitButton`) sont des classes thème Bootstrap-like et peuvent bouger.

```css
/* Champs métier */
#ContactForm input[name="nom"]
#ContactForm input[name="prenom"]
#ContactForm input[name="email"]
#ContactForm input[name="tel"]
#ContactForm textarea[name="infos"]

/* Champs cachés (tracking attribution) */
#ContactForm input[name="url"]
#ContactForm input[name="fbclid_input"]
#ContactForm input[name="gclid_input"]
#ContactForm input[name="ContactForm"]    /* marqueur backend, value="1" */

/* Bouton submit */
#ContactForm input[type="submit"][name="ContactFormSubmit"]
/* équivalents : #ContactFormSubmit  ou  #ContactForm input.submitButton */
```

### Sélecteur du HONEYPOT (critique)

```css
#ContactForm input[name="security"]
```

**Règle de qualification d'un lead valide dans le tag GTM :**

```js
// Variable JavaScript GTM : honeypotValue
function() {
  var f = document.querySelector('#ContactForm');
  if (!f) return '';
  var s = f.querySelector('input[name="security"]');
  return s ? s.value : '';
}
```

Puis dans le **trigger Form Submission**, ajouter une condition :
- `honeypotValue` *equals* `` (chaîne vide) → tag déclenché
- sinon → tag bloqué (= soumission bot)

### Sélecteur du CTA d'ouverture de modale (si trigger « modale ouverte » désiré)

```css
a.lpOpenForm, [href="#LpFormSection"], [href="#LpPopupForm"]
```

(Reproduit exactement la délégation jQuery utilisée par `HandleFranchiseForm()`.)

### Recommandation de trigger Form Submission

1. **Trigger type :** Form Submission
2. **Wait for tags :** ✅ (max 2 000 ms — la page recharge derrière)
3. **Check validation :** ❌ décocher (pas de validation HTML5 côté front, on ne veut pas rater les submits)
4. **Condition de déclenchement :**
   - `Form ID` *equals* `ContactForm`
   - ET `honeypotValue` *equals* `` (vide)
5. **Page URL filter optionnel :** `Page URL` *contains* `/fr/franchise`

### Données à pousser au DataLayer (suggestion)

```js
{
  event: 'franchise_form_submit',
  form_id: 'ContactForm',
  form_location: 'modal_lp',
  page_path: '/fr/franchise/',
  has_fbclid: !!document.querySelector('input[name="fbclid_input"]').value,
  has_gclid:  !!document.querySelector('input[name="gclid_input"]').value
}
```

Ce `event` custom permet ensuite d'attacher dans GTM, conditionnellement à `franchise_form_submit`, tout pixel ad (Meta Conversions API côté serveur, Google Ads conversion, etc.) sans avoir à dupliquer la logique honeypot.
