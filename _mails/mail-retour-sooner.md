**Objet : Dashboard SOONER — Retour sur tes remarques + corrections appliquées**

---

Salut Sébastien,

Merci pour ton retour détaillé, c'était très utile. Voici le point complet sur les corrections et le fonctionnement du dashboard.

---

### 1. Achats SVOD (corrigé ✅)

**Le problème :** Le dashboard utilisait "Website purchases" de Meta (qui inclut SVOD + TVOD mélangés) et "Conversions" de Google Ads (idem). Résultat : le chiffre de 1,3K était gonflé par les TVOD.

**La correction :** On utilise maintenant les **custom conversions** spécifiques :

- **Meta SVOD** = Purchase SVOD Mensuel Classique + Purchase SVOD Annuel + Purchase SVOD SOONER+
- **Google Ads SVOD** = Conversions filtrées sur "Sooner - Abonnement" (Mensuel, Annuel, SOONER+)

Sur la période 1 mars — 3 avril :

| Source | SVOD | TVOD |
|---|---|---|
| Meta | 216 | 670 |
| Google Ads | 57,87 | 401,30 |
| **Total** | **~274** | **~1 071** |

---

### 2. CPA SVOD (corrigé ✅)

**Avant :** 4,79 € (faux, calculé sur SVOD+TVOD)
**Maintenant :** **~23 €** (calculé uniquement sur les achats SVOD)

Formule : Dépenses totales (Meta + Google Ads) / Achats SVOD uniquement

Le CPA est au-dessus de la cible de 15 €, affiché en rouge dans le dashboard.

---

### 3. Dépenses totales (OK ✅)

Le chiffre de 6 337 € était correct dès le départ (Meta spend + Google Ads cost). Pas de modification.

---

### 4. ROAS (corrigé ✅)

Calculé maintenant sur le **revenu SVOD uniquement** (somme des conversion values SVOD Meta + Google Ads), divisé par le spend total.

---

### 5. Les 1 702 achats GA4 (OK ✅ — c'est normal)

GA4 track **tout** : SVOD + TVOD + le reste. Les 1 702 sont le nombre total de transactions e-commerce sur le site. C'est la source de vérité e-commerce globale.

Dans le dashboard, la page **GA4 / Site** affiche bien ce total avec le label "Achats (SVOD + TVOD)" pour éviter toute confusion. Un bloc **SVOD vs TVOD** a été ajouté sur cette page avec le détail par type d'abonnement.

---

### 6. Structure du dashboard (5 pages)

| Page | Contenu | Données SVOD/TVOD |
|---|---|---|
| **Overview** | KPIs globaux, charts, donuts | SVOD only pour les KPIs principaux |
| **Meta Ads** | Campagnes, ad sets, créatives | Achats = SVOD only |
| **Google Ads** | Campagnes, conversions par action | Conv = SVOD only + détail par action |
| **GA4 / Site** | Sessions, funnel, e-commerce | Vision globale (SVOD+TVOD) + bloc détail SVOD vs TVOD |
| **Bilan Mensuel** | Synthèse mensuelle, comparaison MoM | SVOD only |

---

### 7. Point d'attention : GA4 Ecommerce

Dans GA4, le champ `item_category` remonte "(not set)" pour toutes les transactions. Ça signifie que le tracking e-commerce du site ne tague pas SVOD vs TVOD au niveau produit. Pour avoir un split natif dans GA4, il faudrait corriger le datalayer (côté GTM / dev du site) pour tagger `item_category` = "SVOD" ou "TVOD" sur les events purchase.

En attendant, le dashboard croise les données des custom conversions Meta + Google Ads pour reconstituer le split.

---

### 8. Fonctionnalités disponibles

- **Filtres de dates** : 7J, 30J, Ce mois, Mois dernier, Personnalisé (dates libres)
- **Export PDF/CSV** : bouton Export en haut à droite, avec sélection des sections
- **Tableaux triables** : clic sur les en-têtes de colonnes
- **Commentaires** : zone de commentaires sauvegardée avec historique (page Bilan)
- **CPA color-codé** : vert < 15 €, orange 15-20 €, rouge > 20 €

---

URL du dashboard : **https://sooner-france.github.io/dashboard/**

N'hésite pas si tu as d'autres questions.

Hamza
