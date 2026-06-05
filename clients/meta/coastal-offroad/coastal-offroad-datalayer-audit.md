# Audit dataLayer eCommerce - Coastal Offroad

**Date :** 18 fevrier 2026
**Outil :** Puppeteer + script d'audit automatise
**Objectif :** Verifier la conformite du tracking ecommerce dataLayer (GA4 / GTM)
**Plateforme detectee :** Odoo eCommerce (et non Shopify)
**Nombre de sites audites :** 4

---

## Resume global

| Site | GTM | dataLayer | Format | view_item_list | view_item | add_to_cart | view_cart / begin_checkout |
|------|-----|-----------|--------|----------------|-----------|-------------|---------------------------|
| Coastal Offroad US | ✅ GTM-M7DTZTJ | ✅ | UA | ❌ | ❌ | ❌ | ❌ |
| Coastal Offroad NZ | ✅ GTM-KST5KJ2 | ✅ | UA | ❌ | ❌ | ❌ | ❌ |
| Coastal Offroad AU | ✅ GTM-N9MZG42 | ✅ | UA | ❌ | ❌ | ❌ | ❌ |
| Coastal Offroad CA | ✅ GTM-T436HZG | ✅ | UA | ❌ | ❌ | ❌ | ❌ |

---

## Coastal Offroad US
**URL :** https://coastaloffroad.com
**GTM :** ✅ Detecte (GTM-M7DTZTJ)
**dataLayer :** ✅ Present

### Homepage
**URL :** https://coastaloffroad.com
**Entries dataLayer :** 6

**Events ecommerce detectes :**

- ❌ `(pas de cle event)` — Format: **UA (Enhanced Ecommerce)**
  - Champs produit :
    - ✅ `name`
    - ✅ `id`
    - ✅ `price`
    - ✅ `category`
  - Problemes :
    - ⚠️ Format UA obsolete - migration GA4 recommandee
    - ⚠️ Pas de cle 'event' - ne declenchera pas de tag GTM

### Product Page
**URL :** https://www.coastaloffroad.com/shop/1st-gen-tundra-high-clearance-front-bumper-kit-1563
**Entries dataLayer :** 8

**Events ecommerce detectes :** ❌ Aucun event ecommerce dans le dataLayer

### Add to Cart
**URL :** https://www.coastaloffroad.com/shop/1st-gen-tundra-high-clearance-front-bumper-kit-1563
**Bouton Add to Cart :** ❌ Non trouve
**Entries dataLayer :** 8 (0 nouvelles apres action)

**Events ecommerce detectes :** ❌ Aucun event ecommerce dans le dataLayer

### Cart / Checkout
**URL :** https://www.coastaloffroad.com/shop/cart
**Entries dataLayer :** 4

**Events ecommerce detectes :** ❌ Aucun event ecommerce dans le dataLayer

### Bilan des events GA4 attendus

- ❌ `view_item_list` — Page d'accueil / collection
- ❌ `view_item` — Fiche produit
- ❌ `add_to_cart` — Clic sur Ajouter au panier
- ❌ `view_cart` — Page panier
- ❌ `begin_checkout` — Debut checkout

<details>
<summary>Donnees brutes dataLayer (ecommerce events)</summary>

```json
[
  {
    "step": "Homepage",
    "ecommerce": {
      "currencyCode": "USD",
      "impressions": [
        {
          "name": "Lexus GX470 High Clearance Front Bumper Kit",
          "id": "CO0418",
          "price": 822.96,
          "brand": "GX470",
          "category": "2003-2009",
          "list": "Search Results",
          "position": 1
        },
        {
          "name": "4th Gen 4Runner / Hilux Surf High Clearance Front Bumper Kit",
          "id": "CO06939",
          "price": 822.96,
          "brand": "4Runner",
          "category": "2003-2009",
          "list": "Search Results",
          "position": 2
        },
        {
          "name": "3rd Gen 4Runner / Hilux Surf High Clearance Front Bumper Kit",
          "id": "CO0721",
          "price": 747.31,
          "brand": "4Runner",
          "category": "1996-2002",
          "list": "Search Results",
          "position": 3
        },
        {
          "name": "1st Gen Tundra High Clearance Front Bumper Kit",
          "id": "CO65556",
          "price": 822.96,
          "brand": "Tundra",
          "category": "2000-2006",
          "list": "Search Results",
          "position": 4
        },
        {
          "name": "R51 Nissan Pathfinder High Clearance Rear Bumper Kit",
          "id": "CO43920",
          "price": 846.3,
          "brand": "",
          "category": "Nissan",
          "list": "Search Results",
          "position": 5
        },
        {
          "name": "R50 Nissan Pathfinder High Clearance Rear Bumper Kit",
          "id": "CO6758",
          "price": 808.06,
          "brand": "Pathfinder R50",
          "category": "1996-2004",
          "list": "Search Results",
          "position": 6
        },
        {
          "name": "R50 Nissan Pathfinder High Clearance Front Bumper Kit",
          "id": "CO0849",
          "price": 750.75,
          "brand": "Pathfinder R50",
          "category": "1996-2004",
          "list": "Search Results",
          "position": 7
        },
        {
          "name": "Mitsubishi L400 Series 2 Delica High Clearance Front Bumper Kit",
          "id": "CO0677",
          "price": 822.96,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 8
        },
        {
          "name": "Mitsubishi L400 Series 1 Delica High Clearance Front Bumper Kit",
          "id": "CO14993",
          "price": 859.64,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 9
        },
        {
          "name": "Mitsubishi L400 Delica Series 2 Low Profile Rear Bumper Kit",
          "id": "CO0665",
          "price": 928.41,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 10
        },
        {
          "name": "Mitsubishi L400 Delica Series 1 Low Profile Rear Bumper Kit",
          "id": "CO16274",
          "price": 928.41,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 11
        },
        {
          "name": "Lexus GX460 High Clearance Front Bumper Kit",
          "id": "CO8089",
          "price": 937.58,
          "brand": "GX460",
          "category": "2010-2013",
          "list": "Search Results",
          "position": 12
        },
        {
          "name": "Kickout Rock Slider Weld-Together Kit",
          "id": "CO0575",
          "price": 663.64,
          "brand": "Land Cruiser 100",
          "category": "1998-2007",
          "list": "Search Results",
          "position": 13
        },
        {
          "name": "GX470 / Land Cruiser Prado 120 Low Profile Rear Bumper Kit",
          "id": "CO0640",
          "price": 847.6,
          "brand": "GX470",
          "category": "2003-2009",
          "list": "Search Results",
          "position": 14
        },
        {
          "name": "GX460 / Land Cruiser Prado 150 Low Profile Rear Bumper Kit",
          "id": "CO8006",
          "price": 916.95,
          "brand": "Lexus",
          "category": "GX460",
          "list": "Search Results",
          "position": 15
        },
        {
          "name": "FJ Cruiser High Clearance Front Bumper Kit",
          "id": "CO4892",
          "price": 785.14,
          "brand": "FJ Cruiser",
          "category": "2007-2013",
          "list": "Search Results",
          "position": 16
        },
        {
          "name": "Die-Cut Decals",
          "id": "CO94451",
          "price": 15.21,
          "brand": "",
          "category": "Merchandise",
          "list": "Search Results",
          "position": 17
        },
        {
          "name": "Swing Out Carrier Systems",
          "id": "CO0417",
          "price": 645.3,
          "brand": "",
          "category": "Accessories",
          "list": "Search Results",
          "position": 18
        },
        {
          "name": "80 Series Land Cruiser High Clearance Rear Bumper Kit",
          "id": "CO5002",
          "price": 847.03,
          "brand": "Land Cruiser 80",
          "category": "1991-1997",
          "list": "Search Results",
          "position": 19
        },
        {
          "name": "80 Series Land Cruiser High Clearance Front Bumper Kit",
          "id": "CO13108",
          "price": 785.14,
          "brand": "Land Cruiser 80",
          "category": "1991-1997",
          "list": "Search Results",
          "position": 20
        }
      ]
    }
  }
]
```

</details>

---

## Coastal Offroad NZ
**URL :** https://coastaloffroad.co.nz
**GTM :** ✅ Detecte (GTM-KST5KJ2)
**dataLayer :** ✅ Present

### Homepage
**URL :** https://coastaloffroad.co.nz
**Entries dataLayer :** 6

**Events ecommerce detectes :**

- ❌ `(pas de cle event)` — Format: **UA (Enhanced Ecommerce)**
  - Champs produit :
    - ✅ `name`
    - ✅ `id`
    - ✅ `price`
    - ✅ `category`
  - Problemes :
    - ⚠️ Format UA obsolete - migration GA4 recommandee
    - ⚠️ Pas de cle 'event' - ne declenchera pas de tag GTM

### Product Page
**URL :** https://www.coastaloffroad.co.nz/shop/3rd-gen-4runner-hilux-surf-high-clearance-front-bumper-kit-1621
**Entries dataLayer :** 8

**Events ecommerce detectes :** ❌ Aucun event ecommerce dans le dataLayer

### Add to Cart
**URL :** https://www.coastaloffroad.co.nz/shop/3rd-gen-4runner-hilux-surf-high-clearance-front-bumper-kit-1621
**Bouton Add to Cart :** ❌ Non trouve
**Entries dataLayer :** 8 (0 nouvelles apres action)

**Events ecommerce detectes :** ❌ Aucun event ecommerce dans le dataLayer

### Cart / Checkout
**URL :** https://www.coastaloffroad.co.nz/shop/cart
**Entries dataLayer :** 4

**Events ecommerce detectes :** ❌ Aucun event ecommerce dans le dataLayer

### Bilan des events GA4 attendus

- ❌ `view_item_list` — Page d'accueil / collection
- ❌ `view_item` — Fiche produit
- ❌ `add_to_cart` — Clic sur Ajouter au panier
- ❌ `view_cart` — Page panier
- ❌ `begin_checkout` — Debut checkout

<details>
<summary>Donnees brutes dataLayer (ecommerce events)</summary>

```json
[
  {
    "step": "Homepage",
    "ecommerce": {
      "currencyCode": "NZD",
      "impressions": [
        {
          "name": "Lexus GX470 High Clearance Front Bumper Kit",
          "id": "CO0418",
          "price": 822.96,
          "brand": "GX470",
          "category": "2003-2009",
          "list": "Search Results",
          "position": 1
        },
        {
          "name": "4th Gen 4Runner / Hilux Surf High Clearance Front Bumper Kit",
          "id": "CO06939",
          "price": 822.96,
          "brand": "4Runner",
          "category": "2003-2009",
          "list": "Search Results",
          "position": 2
        },
        {
          "name": "3rd Gen 4Runner / Hilux Surf High Clearance Front Bumper Kit",
          "id": "CO0721",
          "price": 747.31,
          "brand": "4Runner",
          "category": "1996-2002",
          "list": "Search Results",
          "position": 3
        },
        {
          "name": "R51 Nissan Pathfinder High Clearance Rear Bumper Kit",
          "id": "CO43920",
          "price": 846.3,
          "brand": "",
          "category": "Nissan",
          "list": "Search Results",
          "position": 4
        },
        {
          "name": "R50 Nissan Pathfinder High Clearance Rear Bumper Kit",
          "id": "CO6758",
          "price": 808.06,
          "brand": "Pathfinder R50",
          "category": "1996-2004",
          "list": "Search Results",
          "position": 5
        },
        {
          "name": "R50 Nissan Pathfinder High Clearance Front Bumper Kit",
          "id": "CO0849",
          "price": 750.75,
          "brand": "Pathfinder R50",
          "category": "1996-2004",
          "list": "Search Results",
          "position": 6
        },
        {
          "name": "Mitsubishi L400 Series 2 Delica High Clearance Front Bumper Kit",
          "id": "CO0677",
          "price": 822.96,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 7
        },
        {
          "name": "Mitsubishi L400 Series 1 Delica High Clearance Front Bumper Kit",
          "id": "CO14993",
          "price": 859.64,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 8
        },
        {
          "name": "Mitsubishi L400 Delica Series 2 Low Profile Rear Bumper Kit",
          "id": "CO0665",
          "price": 928.41,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 9
        },
        {
          "name": "Mitsubishi L400 Delica Series 1 Low Profile Rear Bumper Kit",
          "id": "CO16274",
          "price": 928.41,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 10
        },
        {
          "name": "Kickout Rock Slider Weld-Together Kit",
          "id": "CO0575",
          "price": 663.64,
          "brand": "Land Cruiser 100",
          "category": "1998-2007",
          "list": "Search Results",
          "position": 11
        },
        {
          "name": "GX470 / Land Cruiser Prado 120 Low Profile Rear Bumper Kit",
          "id": "CO0640",
          "price": 847.6,
          "brand": "GX470",
          "category": "2003-2009",
          "list": "Search Results",
          "position": 12
        },
        {
          "name": "GX460 / Land Cruiser Prado 150 Low Profile Rear Bumper Kit",
          "id": "CO8006",
          "price": 916.95,
          "brand": "Lexus",
          "category": "GX460",
          "list": "Search Results",
          "position": 13
        },
        {
          "name": "FJ Cruiser High Clearance Front Bumper Kit",
          "id": "CO4892",
          "price": 785.14,
          "brand": "FJ Cruiser",
          "category": "2007-2013",
          "list": "Search Results",
          "position": 14
        },
        {
          "name": "Die-Cut Decals",
          "id": "CO94451",
          "price": 15.21,
          "brand": "",
          "category": "Merchandise",
          "list": "Search Results",
          "position": 15
        },
        {
          "name": "Swing Out Carrier Systems",
          "id": "CO0417",
          "price": 645.3,
          "brand": "",
          "category": "Accessories",
          "list": "Search Results",
          "position": 16
        },
        {
          "name": "80 Series Land Cruiser High Clearance Rear Bumper Kit",
          "id": "CO5002",
          "price": 847.03,
          "brand": "Land Cruiser 80",
          "category": "1991-1997",
          "list": "Search Results",
          "position": 17
        },
        {
          "name": "80 Series Land Cruiser High Clearance Front Bumper Kit",
          "id": "CO13108",
          "price": 785.14,
          "brand": "Land Cruiser 80",
          "category": "1991-1997",
          "list": "Search Results",
          "position": 18
        },
        {
          "name": "70 Series Land Cruiser High Clearance Rear Bumper Kit",
          "id": "CO27024",
          "price": 746.17,
          "brand": "Land Cruiser 70",
          "category": "1984-2000",
          "list": "Search Results",
          "position": 19
        },
        {
          "name": "70 Series Land Cruiser High Clearance Front Bumper Kit",
          "id": "CO0930",
          "price": 720.95,
          "brand": "Land Cruiser 70",
          "category": "1984-2000",
          "list": "Search Results",
          "position": 20
        }
      ]
    }
  }
]
```

</details>

---

## Coastal Offroad AU
**URL :** https://coastaloffroadbumpers.com.au
**GTM :** ✅ Detecte (GTM-N9MZG42)
**dataLayer :** ✅ Present

### Homepage
**URL :** https://coastaloffroadbumpers.com.au
**Entries dataLayer :** 6

**Events ecommerce detectes :**

- ❌ `(pas de cle event)` — Format: **UA (Enhanced Ecommerce)**
  - Champs produit :
    - ✅ `name`
    - ✅ `id`
    - ✅ `price`
    - ✅ `category`
  - Problemes :
    - ⚠️ Format UA obsolete - migration GA4 recommandee
    - ⚠️ Pas de cle 'event' - ne declenchera pas de tag GTM

### Product Page
**URL :** https://www.coastaloffroadbumpers.com.au/shop/1st-gen-tundra-high-clearance-front-bumper-kit-1563
**Entries dataLayer :** 8

**Events ecommerce detectes :** ❌ Aucun event ecommerce dans le dataLayer

### Add to Cart
**URL :** https://www.coastaloffroadbumpers.com.au/shop/1st-gen-tundra-high-clearance-front-bumper-kit-1563
**Bouton Add to Cart :** ❌ Non trouve
**Entries dataLayer :** 8 (0 nouvelles apres action)

**Events ecommerce detectes :** ❌ Aucun event ecommerce dans le dataLayer

### Cart / Checkout
**URL :** https://www.coastaloffroadbumpers.com.au/shop/cart
**Entries dataLayer :** 4

**Events ecommerce detectes :** ❌ Aucun event ecommerce dans le dataLayer

### Bilan des events GA4 attendus

- ❌ `view_item_list` — Page d'accueil / collection
- ❌ `view_item` — Fiche produit
- ❌ `add_to_cart` — Clic sur Ajouter au panier
- ❌ `view_cart` — Page panier
- ❌ `begin_checkout` — Debut checkout

<details>
<summary>Donnees brutes dataLayer (ecommerce events)</summary>

```json
[
  {
    "step": "Homepage",
    "ecommerce": {
      "currencyCode": "AUD",
      "impressions": [
        {
          "name": "Lexus GX470 High Clearance Front Bumper Kit",
          "id": "CO0418",
          "price": 822.96,
          "brand": "GX470",
          "category": "2003-2009",
          "list": "Search Results",
          "position": 1
        },
        {
          "name": "4th Gen 4Runner / Hilux Surf High Clearance Front Bumper Kit",
          "id": "CO06939",
          "price": 822.96,
          "brand": "4Runner",
          "category": "2003-2009",
          "list": "Search Results",
          "position": 2
        },
        {
          "name": "3rd Gen 4Runner / Hilux Surf High Clearance Front Bumper Kit",
          "id": "CO0721",
          "price": 747.31,
          "brand": "4Runner",
          "category": "1996-2002",
          "list": "Search Results",
          "position": 3
        },
        {
          "name": "1st Gen Tundra High Clearance Front Bumper Kit",
          "id": "CO65556",
          "price": 822.96,
          "brand": "Tundra",
          "category": "2000-2006",
          "list": "Search Results",
          "position": 4
        },
        {
          "name": "R51 Nissan Pathfinder High Clearance Rear Bumper Kit",
          "id": "CO43920",
          "price": 846.3,
          "brand": "",
          "category": "Nissan",
          "list": "Search Results",
          "position": 5
        },
        {
          "name": "R50 Nissan Pathfinder High Clearance Rear Bumper Kit",
          "id": "CO6758",
          "price": 808.06,
          "brand": "Pathfinder R50",
          "category": "1996-2004",
          "list": "Search Results",
          "position": 6
        },
        {
          "name": "R50 Nissan Pathfinder High Clearance Front Bumper Kit",
          "id": "CO0849",
          "price": 750.75,
          "brand": "Pathfinder R50",
          "category": "1996-2004",
          "list": "Search Results",
          "position": 7
        },
        {
          "name": "Mitsubishi L400 Series 2 Delica High Clearance Front Bumper Kit",
          "id": "CO0677",
          "price": 822.96,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 8
        },
        {
          "name": "Mitsubishi L400 Series 1 Delica High Clearance Front Bumper Kit",
          "id": "CO14993",
          "price": 859.64,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 9
        },
        {
          "name": "Mitsubishi L400 Delica Series 2 Low Profile Rear Bumper Kit",
          "id": "CO0665",
          "price": 928.41,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 10
        },
        {
          "name": "Mitsubishi L400 Delica Series 1 Low Profile Rear Bumper Kit",
          "id": "CO16274",
          "price": 928.41,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 11
        },
        {
          "name": "Kickout Rock Slider Weld-Together Kit",
          "id": "CO0575",
          "price": 663.64,
          "brand": "Land Cruiser 100",
          "category": "1998-2007",
          "list": "Search Results",
          "position": 12
        },
        {
          "name": "GX470 / Land Cruiser Prado 120 Low Profile Rear Bumper Kit",
          "id": "CO0640",
          "price": 847.6,
          "brand": "GX470",
          "category": "2003-2009",
          "list": "Search Results",
          "position": 13
        },
        {
          "name": "GX460 / Land Cruiser Prado 150 Low Profile Rear Bumper Kit",
          "id": "CO8006",
          "price": 916.95,
          "brand": "Lexus",
          "category": "GX460",
          "list": "Search Results",
          "position": 14
        },
        {
          "name": "FJ Cruiser High Clearance Front Bumper Kit",
          "id": "CO4892",
          "price": 785.14,
          "brand": "FJ Cruiser",
          "category": "2007-2013",
          "list": "Search Results",
          "position": 15
        },
        {
          "name": "Die-Cut Decals",
          "id": "CO94451",
          "price": 15.21,
          "brand": "",
          "category": "Merchandise",
          "list": "Search Results",
          "position": 16
        },
        {
          "name": "Swing Out Carrier Systems",
          "id": "CO0417",
          "price": 645.3,
          "brand": "",
          "category": "Accessories",
          "list": "Search Results",
          "position": 17
        },
        {
          "name": "80 Series Land Cruiser High Clearance Rear Bumper Kit",
          "id": "CO5002",
          "price": 847.03,
          "brand": "Land Cruiser 80",
          "category": "1991-1997",
          "list": "Search Results",
          "position": 18
        },
        {
          "name": "80 Series Land Cruiser High Clearance Front Bumper Kit",
          "id": "CO13108",
          "price": 785.14,
          "brand": "Land Cruiser 80",
          "category": "1991-1997",
          "list": "Search Results",
          "position": 19
        },
        {
          "name": "70 Series Land Cruiser High Clearance Rear Bumper Kit",
          "id": "CO27024",
          "price": 746.17,
          "brand": "Land Cruiser 70",
          "category": "1984-2000",
          "list": "Search Results",
          "position": 20
        }
      ]
    }
  }
]
```

</details>

---

## Coastal Offroad CA
**URL :** https://coastaloffroad.ca
**GTM :** ✅ Detecte (GTM-T436HZG)
**dataLayer :** ✅ Present

### Homepage
**URL :** https://coastaloffroad.ca
**Entries dataLayer :** 7

**Events ecommerce detectes :**

- ❌ `(pas de cle event)` — Format: **UA (Enhanced Ecommerce)**
  - Champs produit :
    - ✅ `name`
    - ✅ `id`
    - ✅ `price`
    - ✅ `category`
  - Problemes :
    - ⚠️ Format UA obsolete - migration GA4 recommandee
    - ⚠️ Pas de cle 'event' - ne declenchera pas de tag GTM

### Product Page
**URL :** https://www.coastaloffroad.ca/shop/1st-gen-tundra-high-clearance-front-bumper-kit-1563
**Entries dataLayer :** 9

**Events ecommerce detectes :** ❌ Aucun event ecommerce dans le dataLayer

### Add to Cart
**URL :** https://www.coastaloffroad.ca/shop/1st-gen-tundra-high-clearance-front-bumper-kit-1563
**Bouton Add to Cart :** ❌ Non trouve
**Entries dataLayer :** 9 (0 nouvelles apres action)

**Events ecommerce detectes :** ❌ Aucun event ecommerce dans le dataLayer

### Cart / Checkout
**URL :** https://www.coastaloffroad.ca/shop/cart
**Entries dataLayer :** 5

**Events ecommerce detectes :** ❌ Aucun event ecommerce dans le dataLayer

### Bilan des events GA4 attendus

- ❌ `view_item_list` — Page d'accueil / collection
- ❌ `view_item` — Fiche produit
- ❌ `add_to_cart` — Clic sur Ajouter au panier
- ❌ `view_cart` — Page panier
- ❌ `begin_checkout` — Debut checkout

<details>
<summary>Donnees brutes dataLayer (ecommerce events)</summary>

```json
[
  {
    "step": "Homepage",
    "ecommerce": {
      "currencyCode": "CAD",
      "impressions": [
        {
          "name": "Lexus GX470 High Clearance Front Bumper Kit",
          "id": "CO0418",
          "price": 822.96,
          "brand": "GX470",
          "category": "2003-2009",
          "list": "Search Results",
          "position": 1
        },
        {
          "name": "4th Gen 4Runner / Hilux Surf High Clearance Front Bumper Kit",
          "id": "CO06939",
          "price": 822.96,
          "brand": "4Runner",
          "category": "2003-2009",
          "list": "Search Results",
          "position": 2
        },
        {
          "name": "3rd Gen 4Runner / Hilux Surf High Clearance Front Bumper Kit",
          "id": "CO0721",
          "price": 747.31,
          "brand": "4Runner",
          "category": "1996-2002",
          "list": "Search Results",
          "position": 3
        },
        {
          "name": "1st Gen Tundra High Clearance Front Bumper Kit",
          "id": "CO65556",
          "price": 822.96,
          "brand": "Tundra",
          "category": "2000-2006",
          "list": "Search Results",
          "position": 4
        },
        {
          "name": "R51 Nissan Pathfinder High Clearance Rear Bumper Kit",
          "id": "CO43920",
          "price": 846.3,
          "brand": "",
          "category": "Nissan",
          "list": "Search Results",
          "position": 5
        },
        {
          "name": "R50 Nissan Pathfinder High Clearance Rear Bumper Kit",
          "id": "CO6758",
          "price": 808.06,
          "brand": "Pathfinder R50",
          "category": "1996-2004",
          "list": "Search Results",
          "position": 6
        },
        {
          "name": "R50 Nissan Pathfinder High Clearance Front Bumper Kit",
          "id": "CO0849",
          "price": 750.75,
          "brand": "Pathfinder R50",
          "category": "1996-2004",
          "list": "Search Results",
          "position": 7
        },
        {
          "name": "Mitsubishi L400 Series 2 Delica High Clearance Front Bumper Kit",
          "id": "CO0677",
          "price": 822.96,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 8
        },
        {
          "name": "Mitsubishi L400 Series 1 Delica High Clearance Front Bumper Kit",
          "id": "CO14993",
          "price": 859.64,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 9
        },
        {
          "name": "Mitsubishi L400 Delica Series 2 Low Profile Rear Bumper Kit",
          "id": "CO0665",
          "price": 928.41,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 10
        },
        {
          "name": "Mitsubishi L400 Delica Series 1 Low Profile Rear Bumper Kit",
          "id": "CO16274",
          "price": 928.41,
          "brand": "",
          "category": "Mitsubishi",
          "list": "Search Results",
          "position": 11
        },
        {
          "name": "Lexus GX460 High Clearance Front Bumper Kit",
          "id": "CO8089",
          "price": 937.58,
          "brand": "GX460",
          "category": "2010-2013",
          "list": "Search Results",
          "position": 12
        },
        {
          "name": "Kickout Rock Slider Weld-Together Kit",
          "id": "CO0575",
          "price": 663.64,
          "brand": "Land Cruiser 100",
          "category": "1998-2007",
          "list": "Search Results",
          "position": 13
        },
        {
          "name": "GX470 / Land Cruiser Prado 120 Low Profile Rear Bumper Kit",
          "id": "CO0640",
          "price": 847.6,
          "brand": "GX470",
          "category": "2003-2009",
          "list": "Search Results",
          "position": 14
        },
        {
          "name": "GX460 / Land Cruiser Prado 150 Low Profile Rear Bumper Kit",
          "id": "CO8006",
          "price": 916.95,
          "brand": "Lexus",
          "category": "GX460",
          "list": "Search Results",
          "position": 15
        },
        {
          "name": "FJ Cruiser High Clearance Front Bumper Kit",
          "id": "CO4892",
          "price": 785.14,
          "brand": "FJ Cruiser",
          "category": "2007-2013",
          "list": "Search Results",
          "position": 16
        },
        {
          "name": "Die-Cut Decals",
          "id": "CO94451",
          "price": 15.21,
          "brand": "",
          "category": "Merchandise",
          "list": "Search Results",
          "position": 17
        },
        {
          "name": "Swing Out Carrier Systems",
          "id": "CO0417",
          "price": 645.3,
          "brand": "",
          "category": "Accessories",
          "list": "Search Results",
          "position": 18
        },
        {
          "name": "80 Series Land Cruiser High Clearance Rear Bumper Kit",
          "id": "CO5002",
          "price": 847.03,
          "brand": "Land Cruiser 80",
          "category": "1991-1997",
          "list": "Search Results",
          "position": 19
        },
        {
          "name": "80 Series Land Cruiser High Clearance Front Bumper Kit",
          "id": "CO13108",
          "price": 785.14,
          "brand": "Land Cruiser 80",
          "category": "1991-1997",
          "list": "Search Results",
          "position": 20
        }
      ]
    }
  }
]
```

</details>

---

## Diagnostic global

### Constats cles

| # | Constat | Gravite |
|---|---------|---------|
| 1 | **Format UA obsolete (Enhanced Ecommerce)** utilise sur les 4 sites | CRITIQUE |
| 2 | **Aucune cle `event`** sur les push ecommerce de la homepage → GTM ne peut pas declencher de tags | CRITIQUE |
| 3 | **Aucun event GA4** detecte sur l'ensemble du funnel (view_item, add_to_cart, etc.) | CRITIQUE |
| 4 | **Aucun tracking sur les fiches produit** - le dataLayer ne contient aucun event ecommerce | MAJEUR |
| 5 | **Aucun tracking add_to_cart** - pas d'event lors de l'ajout au panier | MAJEUR |
| 6 | **Aucun tracking panier/checkout** - pas d'event view_cart ni begin_checkout | MAJEUR |
| 7 | Les donnees produit (name, id, price, category) sont presentes dans les impressions UA → elles peuvent servir de base pour la migration GA4 | INFO |
| 8 | Plateforme Odoo detectee - les recommandations doivent tenir compte du contexte Odoo | INFO |

---

## Recommandations et corrections pour le developpeur

### 1. CRITIQUE : Migrer du format UA vers GA4

Les 4 sites pushent des donnees au format Universal Analytics Enhanced Ecommerce (`impressions`, `currencyCode`, `detail`, etc.). **Ce format est obsolete depuis juillet 2024** (arret de Google Analytics UA).

**Ce qui existe actuellement (UA - A SUPPRIMER) :**
```javascript
// ❌ Format UA actuel - ne fonctionne plus avec GA4
dataLayer.push({
  ecommerce: {
    currencyCode: "USD",
    impressions: [
      { name: "Lexus GX470...", id: "CO0418", price: 822.96, brand: "GX470", category: "2003-2009", list: "Search Results", position: 1 }
    ]
  }
});
```

**Ce qui doit etre implemente (GA4) :**
```javascript
// ✅ Format GA4 correct
dataLayer.push({ ecommerce: null }); // Reset obligatoire
dataLayer.push({
  event: "view_item_list",
  ecommerce: {
    item_list_id: "search_results",
    item_list_name: "Search Results",
    items: [
      {
        item_id: "CO0418",
        item_name: "Lexus GX470 High Clearance Front Bumper Kit",
        item_brand: "GX470",
        item_category: "2003-2009",
        price: 822.96,
        currency: "USD",
        index: 0
      }
    ]
  }
});
```

### 2. CRITIQUE : Ajouter la cle `event` a chaque push

Actuellement les push ecommerce n'ont **pas de cle `event`**. Sans cette cle, GTM ne peut pas declencher de tag.

```javascript
// ❌ Actuel - pas de cle event
dataLayer.push({
  ecommerce: { currencyCode: "USD", impressions: [...] }
});

// ✅ Correction - ajouter event
dataLayer.push({
  event: "view_item_list", // ← OBLIGATOIRE
  ecommerce: { ... }
});
```

### 3. MAJEUR : Implementer les events du funnel ecommerce GA4

Chaque etape du funnel doit emettre son event. Voici les events a implementer dans Odoo :

#### a) `view_item_list` — Pages /shop et homepage (listing produits)
```javascript
dataLayer.push({ ecommerce: null });
dataLayer.push({
  event: "view_item_list",
  ecommerce: {
    item_list_id: "shop_all",
    item_list_name: "All Products",
    items: [{
      item_id: "CO0418",
      item_name: "Lexus GX470 High Clearance Front Bumper Kit",
      item_brand: "GX470",
      item_category: "2003-2009",
      price: 822.96,
      currency: "USD",
      index: 0
    }]
  }
});
```

#### b) `select_item` — Clic sur un produit dans le listing
```javascript
dataLayer.push({ ecommerce: null });
dataLayer.push({
  event: "select_item",
  ecommerce: {
    item_list_id: "shop_all",
    item_list_name: "All Products",
    items: [{
      item_id: "CO0418",
      item_name: "Lexus GX470 High Clearance Front Bumper Kit",
      price: 822.96,
      currency: "USD"
    }]
  }
});
```

#### c) `view_item` — Fiche produit (ex: /shop/lexus-gx470-...-1678)
```javascript
dataLayer.push({ ecommerce: null });
dataLayer.push({
  event: "view_item",
  ecommerce: {
    currency: "USD",
    value: 822.96,
    items: [{
      item_id: "CO0418",
      item_name: "Lexus GX470 High Clearance Front Bumper Kit",
      item_brand: "GX470",
      item_category: "2003-2009",
      price: 822.96,
      quantity: 1
    }]
  }
});
```

#### d) `add_to_cart` — Clic sur "Add to Cart"
```javascript
dataLayer.push({ ecommerce: null });
dataLayer.push({
  event: "add_to_cart",
  ecommerce: {
    currency: "USD",
    value: 822.96,
    items: [{
      item_id: "CO0418",
      item_name: "Lexus GX470 High Clearance Front Bumper Kit",
      price: 822.96,
      quantity: 1
    }]
  }
});
```

#### e) `view_cart` — Page /shop/cart
```javascript
dataLayer.push({ ecommerce: null });
dataLayer.push({
  event: "view_cart",
  ecommerce: {
    currency: "USD",
    value: 1645.92,
    items: [
      { item_id: "CO0418", item_name: "...", price: 822.96, quantity: 2 }
    ]
  }
});
```

#### f) `begin_checkout` — Clic sur "Proceed to Checkout"
```javascript
dataLayer.push({ ecommerce: null });
dataLayer.push({
  event: "begin_checkout",
  ecommerce: {
    currency: "USD",
    value: 1645.92,
    items: [
      { item_id: "CO0418", item_name: "...", price: 822.96, quantity: 2 }
    ]
  }
});
```

#### g) `purchase` — Page de confirmation de commande
```javascript
dataLayer.push({ ecommerce: null });
dataLayer.push({
  event: "purchase",
  ecommerce: {
    transaction_id: "ORD-12345",
    value: 1645.92,
    tax: 123.45,
    shipping: 50.00,
    currency: "USD",
    items: [
      { item_id: "CO0418", item_name: "...", price: 822.96, quantity: 2 }
    ]
  }
});
```

### 4. Implementation dans Odoo

Pour implementer ces events dans Odoo, le developpeur doit :

1. **Creer un module Odoo custom** ou modifier le template `website_sale` pour injecter le dataLayer
2. **Dans le template produit** (`/shop/<slug>`) : ajouter un bloc `<script>` avec `view_item`
3. **Dans le template shop** (`/shop`) : ajouter un bloc `<script>` avec `view_item_list`
4. **Intercepter le bouton Add to Cart** via JavaScript (event listener sur le formulaire `/shop/cart/update`) pour pusher `add_to_cart`
5. **Dans le template cart** (`/shop/cart`) : ajouter `view_cart`
6. **Dans le template checkout** : ajouter `begin_checkout`
7. **Dans la page de confirmation** (`/shop/confirmation`) : ajouter `purchase`

### 5. Toujours envoyer `ecommerce: null` avant chaque push

Pour eviter la contamination de donnees entre events :
```javascript
dataLayer.push({ ecommerce: null }); // ← TOUJOURS avant un push ecommerce
dataLayer.push({ event: "view_item", ecommerce: { ... } });
```

### 6. Adapter la devise par site

| Site | Devise |
|------|--------|
| coastaloffroad.com (US) | USD |
| coastaloffroad.co.nz (NZ) | NZD |
| coastaloffroadbumpers.com.au (AU) | AUD |
| coastaloffroad.ca (CA) | CAD |

### 7. Conteneurs GTM a configurer

| Site | GTM Container ID |
|------|-----------------|
| coastaloffroad.com | GTM-M7DTZTJ |
| coastaloffroad.co.nz | GTM-KST5KJ2 |
| coastaloffroadbumpers.com.au | GTM-N9MZG42 |
| coastaloffroad.ca | GTM-T436HZG |

Dans chaque conteneur GTM, configurer les tags GA4 event pour chaque event du funnel en utilisant les triggers `Custom Event` correspondants.

---

*Rapport genere automatiquement par le script d'audit Puppeteer le 18 fevrier 2026.*
