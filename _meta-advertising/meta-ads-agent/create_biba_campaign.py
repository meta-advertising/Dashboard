#!/usr/bin/env python3
"""Script de création complète de la campagne Biba Brunch — Recrutement Franchisés."""

import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("META_ACCESS_TOKEN")
AD_ACCOUNT = "act_852935385848128"
PAGE_ID = "104826605806643"
IG_ID = "17841455716206414"
API_VERSION = "v19.0"
BASE_URL = f"https://graph.facebook.com/{API_VERSION}"

VISUALS_DIR = os.path.expanduser("~/Desktop/Biba brunch/Visuels Ads - Biba Brunch")


def api_call(method, endpoint, params=None, data=None, files=None):
    """Appel API Meta avec gestion d'erreurs."""
    url = f"{BASE_URL}/{endpoint}"
    if params is None:
        params = {}
    params["access_token"] = TOKEN

    if method == "GET":
        r = requests.get(url, params=params)
    elif method == "POST":
        if files:
            r = requests.post(url, params=params, data=data, files=files)
        else:
            r = requests.post(url, params=params, json=data)

    result = r.json()
    if "error" in result:
        print(f"❌ ERREUR: {result['error'].get('message', result['error'])}")
        print(f"   Endpoint: {endpoint}")
        return None
    return result


def get_page_token():
    """Récupère le token de la Page Facebook."""
    print("🔑 Récupération du token de la Page...")
    # Try via business
    r = api_call("GET", f"{PAGE_ID}", {"fields": "access_token"})
    if r and "access_token" in r:
        print("   ✅ Token de page récupéré")
        return r["access_token"]

    # Try via me/accounts
    r = api_call("GET", "me/accounts", {"fields": "id,access_token", "limit": 500})
    if r:
        for page in r.get("data", []):
            if page["id"] == PAGE_ID:
                print("   ✅ Token de page récupéré via me/accounts")
                return page["access_token"]

    print("   ⚠️  Pas de token de page, utilisation du token utilisateur")
    return TOKEN


def step1_create_campaign():
    """Étape 1 : Créer la campagne."""
    print("\n" + "="*60)
    print("📢 ÉTAPE 1 : Création de la campagne")
    print("="*60)

    data = {
        "name": "Biba Brunch — Recrutement Franchisés 2026",
        "objective": "OUTCOME_LEADS",
        "status": "PAUSED",
        "special_ad_categories": json.dumps([]),
    }

    r = api_call("POST", f"{AD_ACCOUNT}/campaigns", data=data)
    if r:
        campaign_id = r["id"]
        print(f"   ✅ Campagne créée ! ID: {campaign_id}")
        return campaign_id
    return None


def step2_create_lead_form(page_token):
    """Étape 2 : Créer le formulaire de leads."""
    print("\n" + "="*60)
    print("📋 ÉTAPE 2 : Création du formulaire Lead")
    print("="*60)

    form_data = {
        "access_token": page_token,
        "name": "Biba Brunch — Devenir Franchisé",
        "follow_up_action_url": "https://www.bibabrunch.com",
        "locale": "fr_FR",
        "allow_organic_lead": True,
        "block_display_for_non_targeted_viewer": False,
        "context_card": json.dumps({
            "title": "Devenez franchisé Biba Brunch 🌿",
            "content": [
                "Biba Brunch, c'est le concept brunch qui cartonne à Marseille — déjà classé 3e de France !",
                "",
                "🥐 Un modèle rentable et clé en main",
                "💰 Jusqu'à 1 000 000 € de CA cible",
                "🤝 Un accompagnement humain à chaque étape",
                "",
                "Remplissez ce formulaire pour recevoir notre dossier de présentation et être recontacté par notre équipe."
            ],
            "style": "PARAGRAPH_STYLE",
        }),
        "questions": json.dumps([
            {"type": "FIRST_NAME"},
            {"type": "LAST_NAME"},
            {"type": "EMAIL"},
            {"type": "PHONE"},
            {"type": "POST_CODE"},
            {"type": "CITY"},
            {
                "type": "CUSTOM",
                "key": "projet_professionnel",
                "label": "Quel est votre projet professionnel actuel ?",
                "options": [
                    {"value": "Création d'entreprise", "key": "creation"},
                    {"value": "Reconversion professionnelle", "key": "reconversion"},
                    {"value": "Déjà restaurateur ou commerçant", "key": "restaurateur"},
                    {"value": "Autre", "key": "autre"},
                ],
            },
            {
                "type": "CUSTOM",
                "key": "ville_ouverture",
                "label": "Dans quelle ville souhaitez-vous ouvrir votre Biba Brunch ?",
            },
            {
                "type": "CUSTOM",
                "key": "budget_investissement",
                "label": "Quel est votre budget d'investissement estimé ?",
                "options": [
                    {"value": "Moins de 50 000 €", "key": "moins_50k"},
                    {"value": "50 000 - 100 000 €", "key": "50k_100k"},
                    {"value": "100 000 - 200 000 €", "key": "100k_200k"},
                    {"value": "200 000 - 350 000 €", "key": "200k_350k"},
                    {"value": "Plus de 350 000 €", "key": "plus_350k"},
                ],
            },
            {
                "type": "CUSTOM",
                "key": "delai_lancement",
                "label": "Quand souhaitez-vous vous lancer ?",
                "options": [
                    {"value": "Dans les 3 mois", "key": "3_mois"},
                    {"value": "Dans les 6 mois", "key": "6_mois"},
                    {"value": "Dans l'année", "key": "1_an"},
                    {"value": "Je me renseigne pour le moment", "key": "renseigne"},
                ],
            },
        ]),
        "privacy_policy": json.dumps({
            "url": "https://www.bibabrunch.com/politique-de-confidentialite",
            "link_text": "Politique de confidentialité",
        }),
        "thank_you_page": json.dumps({
            "title": "Merci pour votre intérêt ! 🎉",
            "body": "Notre équipe vous recontactera dans les plus brefs délais pour échanger sur votre projet de franchise Biba Brunch.",
            "button_text": "Découvrir Biba Brunch",
            "button_type": "VIEW_WEBSITE",
            "website_url": "https://www.bibabrunch.com",
        }),
    }

    url = f"{BASE_URL}/{PAGE_ID}/leadgen_forms"
    r = requests.post(url, data=form_data)
    result = r.json()

    if "error" in result:
        print(f"   ❌ ERREUR formulaire: {result['error'].get('message')}")
        print(f"   Détails: {json.dumps(result['error'], indent=2)}")
        return None

    form_id = result["id"]
    print(f"   ✅ Formulaire créé ! ID: {form_id}")
    return form_id


def step3_create_adsets(campaign_id):
    """Étape 3 : Créer les 3 ensembles de publicités."""
    print("\n" + "="*60)
    print("🎯 ÉTAPE 3 : Création des 3 ensembles de publicités")
    print("="*60)

    # Ciblage géographique commun : Monaco, Lyon, Clermont-Ferrand, Perpignan
    geo_locations = {
        "cities": [
            {"key": "1647850", "radius": 20, "distance_unit": "kilometer"},  # Monaco
            {"key": "1006201", "radius": 30, "distance_unit": "kilometer"},  # Lyon
            {"key": "1005296", "radius": 30, "distance_unit": "kilometer"},  # Clermont-Ferrand
            {"key": "1007298", "radius": 30, "distance_unit": "kilometer"},  # Perpignan
        ],
    }

    adsets_config = [
        {
            "name": "Ad Set 1 — Entrepreneur(e) gourmand(e) et ambitieux(se)",
            "targeting": {
                "geo_locations": geo_locations,
                "age_min": 25,
                "age_max": 55,
                "interests": [
                    {"id": "6003012317397", "name": "Entrepreneurship"},
                    {"id": "6003384248805", "name": "Investment"},
                    {"id": "6003107902433", "name": "Business"},
                    {"id": "6003659420716", "name": "Franchise"},
                ],
                "behaviors": [],
            },
        },
        {
            "name": "Ad Set 2 — Restaurateur(trice) en quête de renouveau",
            "targeting": {
                "geo_locations": geo_locations,
                "age_min": 28,
                "age_max": 55,
                "interests": [
                    {"id": "6004037858578", "name": "Restaurants"},
                    {"id": "6003384248805", "name": "Investment"},
                    {"id": "6003659420716", "name": "Franchise"},
                    {"id": "6003025078498", "name": "Food and beverage"},
                ],
            },
        },
        {
            "name": "Ad Set 3 — Passionné(e) de brunch et d'art de vivre",
            "targeting": {
                "geo_locations": geo_locations,
                "age_min": 25,
                "age_max": 50,
                "interests": [
                    {"id": "6003346281073", "name": "Brunch"},
                    {"id": "6003397425735", "name": "Interior design"},
                    {"id": "6003107902433", "name": "Business"},
                    {"id": "6003659420716", "name": "Franchise"},
                    {"id": "6003139266461", "name": "Gastronomy"},
                ],
            },
        },
    ]

    # Budget quotidien : 50€ / 3 ad sets = ~16.67€ par ad set = 1667 centimes
    daily_budget_per_adset = 1667

    adset_ids = []
    for config in adsets_config:
        data = {
            "campaign_id": campaign_id,
            "name": config["name"],
            "status": "PAUSED",
            "daily_budget": str(daily_budget_per_adset),
            "billing_event": "IMPRESSIONS",
            "optimization_goal": "LEAD_GENERATION",
            "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
            "targeting": json.dumps(config["targeting"]),
            "promoted_object": json.dumps({
                "page_id": PAGE_ID,
            }),
        }

        r = api_call("POST", f"{AD_ACCOUNT}/adsets", data=data)
        if r:
            adset_id = r["id"]
            print(f"   ✅ {config['name']} — ID: {adset_id}")
            adset_ids.append(adset_id)
        else:
            adset_ids.append(None)

    return adset_ids


def step4_upload_images():
    """Étape 4 : Upload des visuels."""
    print("\n" + "="*60)
    print("🖼️  ÉTAPE 4 : Upload des visuels")
    print("="*60)

    image_hashes = {}
    for i in range(1, 17):
        filename = f"{i}.png"
        filepath = os.path.join(VISUALS_DIR, filename)

        with open(filepath, "rb") as f:
            files = {"filename": (filename, f, "image/png")}
            r = api_call("POST", f"{AD_ACCOUNT}/adimages", files=files)

        if r and "images" in r:
            img_data = list(r["images"].values())[0]
            image_hashes[filename] = img_data["hash"]
            print(f"   ✅ {filename} uploadé — hash: {img_data['hash'][:12]}...")
        else:
            print(f"   ❌ Erreur upload {filename}")

    return image_hashes


def step5_create_ads(adset_ids, image_hashes, form_id):
    """Étape 5 : Créer les publicités."""
    print("\n" + "="*60)
    print("📰 ÉTAPE 5 : Création des publicités")
    print("="*60)

    # Paires de visuels : (carré 1080x1080, portrait 1080x1350)
    visual_pairs = [
        ("1.png", "2.png"),   # Entreprendre avec plaisir
        ("3.png", "4.png"),   # CA cible
        ("5.png", "6.png"),   # L'équipe
        ("7.png", "8.png"),   # Histoire de famille
        ("9.png", "10.png"),  # Plaisir et performance
        ("11.png", "12.png"), # Marché en effervescence
        ("13.png", "14.png"), # Accompagnement humain
        ("15.png", "16.png"), # Ouvrez votre restaurant
    ]

    ad_texts = [
        {
            "name_prefix": "Entrepreneur",
            "text": "🥐 Vous rêvez d'entreprendre dans un univers gourmand et convivial ?\n\nBiba Brunch, c'est le concept qui cartonne à Marseille — déjà 3e brunch de France 🇫🇷\n\n✅ Un modèle rentable et clé en main\n✅ Jusqu'à 1 000 000 € de CA cible\n✅ Un accompagnement humain à chaque étape",
            "title": "Devenez franchisé Biba Brunch 🌿",
            "description": "Ouvrez votre restaurant brunch dans votre ville.",
        },
        {
            "name_prefix": "Restaurateur",
            "text": "🍳 Restaurateur(trice), commerçant(e) : et si vous donniez un nouvel élan à votre parcours ?\n\nRejoignez Biba Brunch, l'enseigne qui allie plaisir et performance 💛\n\n✅ Un concept premium accessible à tous\n✅ Une carte créative, pensée pour la marge\n✅ Une marque forte, moderne et inspirante",
            "title": "Rejoignez la franchise Biba Brunch 🥞",
            "description": "Une enseigne clé en main, alliant plaisir et rentabilité.",
        },
        {
            "name_prefix": "Passionné",
            "text": "☀️ Passionné(e) de brunch, de déco et d'art de vivre ?\n\nTransformez votre passion en réussite entrepreneuriale avec Biba Brunch !\n\n🌸 Un univers feel good et solaire\n🍴 Du fait maison, de la générosité\n🤝 Une équipe qui vous accompagne vraiment",
            "title": "Ouvrez votre Biba Brunch 🌺",
            "description": "Faites de votre passion une aventure entrepreneuriale.",
        },
    ]

    total_ads = 0
    for idx, (adset_id, ad_text) in enumerate(zip(adset_ids, ad_texts)):
        if not adset_id:
            print(f"   ⏩ Ad Set {idx+1} ignoré (pas d'ID)")
            continue

        print(f"\n   📁 Ad Set {idx+1} — {ad_text['name_prefix']}")

        for pair_idx, (square, portrait) in enumerate(visual_pairs):
            sq_hash = image_hashes.get(square)
            pt_hash = image_hashes.get(portrait)

            if not sq_hash or not pt_hash:
                print(f"      ⏩ Paire {pair_idx+1} ignorée (hash manquant)")
                continue

            # Creative avec les 2 formats
            creative_data = {
                "name": f"Biba — {ad_text['name_prefix']} — Visuel {pair_idx+1}",
                "object_story_spec": json.dumps({
                    "page_id": PAGE_ID,
                    "instagram_actor_id": IG_ID,
                    "link_data": {
                        "image_hash": sq_hash,
                        "message": ad_text["text"],
                        "name": ad_text["title"],
                        "description": ad_text["description"],
                        "call_to_action": {
                            "type": "LEARN_MORE",
                            "value": {
                                "lead_gen_form_id": form_id,
                            },
                        },
                    },
                }),
                "asset_feed_spec": json.dumps({
                    "images": [
                        {"hash": sq_hash},
                        {"hash": pt_hash},
                    ],
                    "bodies": [{"text": ad_text["text"]}],
                    "titles": [{"text": ad_text["title"]}],
                    "descriptions": [{"text": ad_text["description"]}],
                    "call_to_action_types": ["LEARN_MORE"],
                    "link_urls": [{"website_url": "https://www.bibabrunch.com"}],
                    "ad_formats": ["SINGLE_IMAGE"],
                }),
            }

            # Créer le creative
            r = api_call("POST", f"{AD_ACCOUNT}/adcreatives", data=creative_data)
            if not r:
                # Fallback : creative simple sans asset_feed_spec
                creative_data_simple = {
                    "name": f"Biba — {ad_text['name_prefix']} — Visuel {pair_idx+1}",
                    "object_story_spec": json.dumps({
                        "page_id": PAGE_ID,
                        "instagram_actor_id": IG_ID,
                        "link_data": {
                            "image_hash": sq_hash,
                            "message": ad_text["text"],
                            "name": ad_text["title"],
                            "description": ad_text["description"],
                            "call_to_action": {
                                "type": "LEARN_MORE",
                                "value": {
                                    "lead_gen_form_id": form_id,
                                },
                            },
                        },
                    }),
                }
                r = api_call("POST", f"{AD_ACCOUNT}/adcreatives", data=creative_data_simple)

            if not r:
                print(f"      ❌ Creative {pair_idx+1} échouée")
                continue

            creative_id = r["id"]

            # Créer la publicité
            ad_data = {
                "name": f"Biba — {ad_text['name_prefix']} — Visuel {pair_idx+1}",
                "adset_id": adset_id,
                "creative": json.dumps({"creative_id": creative_id}),
                "status": "PAUSED",
            }

            r = api_call("POST", f"{AD_ACCOUNT}/ads", data=ad_data)
            if r:
                total_ads += 1
                print(f"      ✅ Pub {pair_idx+1} créée — ID: {r['id']}")
            else:
                print(f"      ❌ Pub {pair_idx+1} échouée")

    return total_ads


def main():
    print("🚀 CRÉATION CAMPAGNE BIBA BRUNCH — RECRUTEMENT FRANCHISÉS")
    print("="*60)

    # Étape 0 : Token de page
    page_token = get_page_token()

    # Étape 1 : Campagne
    campaign_id = step1_create_campaign()
    if not campaign_id:
        print("❌ Impossible de créer la campagne. Abandon.")
        return

    # Étape 2 : Formulaire Lead
    form_id = step2_create_lead_form(page_token)
    if not form_id:
        print("⚠️  Formulaire non créé — on continue sans pour l'instant")

    # Étape 3 : Ad Sets
    adset_ids = step3_create_adsets(campaign_id)
    if not any(adset_ids):
        print("❌ Aucun ad set créé. Abandon.")
        return

    # Étape 4 : Upload images
    image_hashes = step4_upload_images()
    if not image_hashes:
        print("❌ Aucune image uploadée. Abandon.")
        return

    # Étape 5 : Créer les pubs
    if form_id:
        total_ads = step5_create_ads(adset_ids, image_hashes, form_id)
    else:
        print("⚠️  Pas de formulaire — les publicités ne peuvent pas être créées sans form_id")
        total_ads = 0

    # Résumé
    print("\n" + "="*60)
    print("🏁 RÉSUMÉ")
    print("="*60)
    print(f"   📢 Campagne : {campaign_id}")
    print(f"   📋 Formulaire : {form_id or 'Non créé'}")
    print(f"   🎯 Ad Sets : {sum(1 for a in adset_ids if a)}/3")
    print(f"   🖼️  Images : {len(image_hashes)}/16")
    print(f"   📰 Publicités : {total_ads}")
    print(f"   💰 Budget : 50€/jour (~16,67€/ad set)")
    print(f"   ⏸️  Statut : PAUSED — en attente d'activation")
    print("="*60)


if __name__ == "__main__":
    main()
