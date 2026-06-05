#!/usr/bin/env python3
"""Création des pubs Biba Brunch — Entrepreneur avec textes personnalisés.
2 ad sets :
- Feed (FB feed + IG feed) : carré 1080 + portrait 1350
- Stories/Reels (FB/IG stories + reels) : format 1920
"""

import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()
token = os.getenv("META_ACCESS_TOKEN")

AD_ACCOUNT = "act_852935385848128"
PAGE_ID = "104826605806643"
FORM_ID = "4369170910008753"
IG_ID = "17841455716206414"

ADSET_FEED = "120239106762650662"
ADSET_STORIES = "120239117451370662"

# Hashes des images carrées (1080x1080)
SQ = {
    1: "0db58de885a35fc645be0f2b460c4bf9",
    2: "ae838dfb6c9d7e3c2a7f26d60fae903c",
    3: "a7f6b840a1517a7504428f423e459874",
    4: "2b8018cd88a55e82ecb647e208841d89",
    5: "b29a22b46869b7a5bc9ac2998b7c91af",
    6: "f58ae6d5c01d486edf95ad15e7fd9def",
    7: "8c1d4fbf98243bf920677401b4ad7370",
    8: "52c929c0802cb2683d1e69ebc1807eb4",
}

# Hashes des images portrait (1080x1350)
PT = {
    1: "c353a483cad65517509a4ca084110de1",
    2: "58282a22ce8926da1aaede0dd174c67f",
    3: "e4473fc4b4492ac36b16695ab8ec3bc7",
    4: "b9749a0a53fe671fb2fd0601953e6613",
    5: "8aa45d540dee7a5926b2d3b7f59bed61",
    6: "0fa67c2f5e8e8b5deab1476e77e9701e",
    7: "4c00c4f59aeaa21defe90052a1ac1313",
    8: "7b1335acf5eb9594f63d66d909d2bd0a",
}

# Hashes des images story (1080x1920)
ST = {
    1: "255fe8f502dda1034747c17102f0117e",
    2: "2812f8611f4ac31f33b5f740ace2dcb7",
    3: "fdfa32ce1f8cee8efd9ecda6d85df126",
    4: "bec32a407094cb6339f3851cc69dad64",
    5: "fbd2a2304d31cd7c8aec94fd422453e0",
    6: "a71f3cec7f9ef275552c78f1d29111ee",
    7: "5cb4b8b2e76e5e2cd22ceb9d8ed67da4",
    8: "9c938944568909522111be4befd48b54",
}

# 8 textes personnalisés par thème
ADS = [
    {
        "theme": "Entreprendre avec plaisir",
        "text": "🥐 Entreprendre, oui — mais avec plaisir !\n\nBiba Brunch, c'est un concept gourmand, convivial et rentable. Déjà 3ᵉ brunch de France, l'aventure ne fait que commencer.\n\n✅ Un modèle clé en main, pensé pour réussir\n✅ Un univers feel good qui attire naturellement\n✅ Un accompagnement humain à chaque étape",
        "title": "Devenez franchisé Biba Brunch 🌿",
        "description": "Entreprendre dans un univers gourmand et solaire.",
    },
    {
        "theme": "CA cible 1M",
        "text": "💰 Jusqu'à 1 000 000 € de chiffre d'affaires cible.\n\nBiba Brunch, c'est un modèle économique solide, testé et validé à Marseille — déjà 3ᵉ brunch de France 🇫🇷\n\n✅ Un concept premium à forte rentabilité\n✅ Une carte pensée pour la marge\n✅ Des résultats concrets dès la première année",
        "title": "Un CA cible ambitieux et atteignable 📈",
        "description": "Un modèle rentable, validé et clé en main.",
    },
    {
        "theme": "Équipe fait maison",
        "text": "🍴 Du fait maison, une équipe soudée, un vrai savoir-faire.\n\nChez Biba Brunch, tout est préparé sur place avec des produits frais. Et derrière chaque restaurant, une équipe formée et passionnée.\n\n✅ Une carte généreuse, 100% fait maison\n✅ Des process simples et reproductibles\n✅ Une formation complète pour vous et vos équipes",
        "title": "Le fait maison au cœur du concept 🥞",
        "description": "Une cuisine authentique et une équipe bien formée.",
    },
    {
        "theme": "Histoire de famille",
        "text": "👨‍👩‍👧‍👦 Biba Brunch, c'est avant tout une histoire de famille.\n\nNé à Marseille d'une passion pour le brunch et l'art de vivre, le concept a grandi avec des valeurs fortes : générosité, authenticité et transmission.\n\n✅ Une marque à taille humaine\n✅ Des valeurs familiales sincères\n✅ Un réseau où chaque franchisé compte",
        "title": "Rejoignez la famille Biba Brunch 💛",
        "description": "Une aventure entrepreneuriale portée par des valeurs familiales.",
    },
    {
        "theme": "Plaisir et performance",
        "text": "☀️ Allier plaisir et performance, c'est possible.\n\nBiba Brunch prouve qu'on peut créer un lieu de vie inspirant tout en atteignant des objectifs financiers ambitieux.\n\n✅ Un concept solaire qui fidélise la clientèle\n✅ Un ticket moyen élevé, un panier généreux\n✅ Jusqu'à 1M€ de CA cible",
        "title": "Plaisir et rentabilité avec Biba Brunch ✨",
        "description": "Un concept où bien-être rime avec performance.",
    },
    {
        "theme": "Marché effervescence",
        "text": "📊 Le marché du brunch est en pleine effervescence.\n\n+15% de croissance par an, une demande qui explose — et Biba Brunch est déjà positionné comme le 3ᵉ brunch de France 🇫🇷\n\n✅ Un marché en forte croissance\n✅ Un positionnement premium et différenciant\n✅ Une marque forte avec une communauté engagée",
        "title": "Surfez sur le boom du brunch 🌊",
        "description": "Un marché en plein essor, une enseigne déjà leader.",
    },
    {
        "theme": "Accompagnement humain",
        "text": "🤝 Un accompagnement humain, du premier jour jusqu'à la réussite.\n\nChez Biba Brunch, vous n'êtes jamais seul(e). L'équipe fondatrice vous guide à chaque étape : business plan, travaux, formation, lancement.\n\n✅ Un accompagnement personnalisé\n✅ Des outils et process éprouvés\n✅ Une équipe disponible et à l'écoute",
        "title": "Accompagné(e) à chaque étape 🌿",
        "description": "Un réseau humain qui vous accompagne vers la réussite.",
    },
    {
        "theme": "Ouvrez votre restaurant",
        "text": "🌺 Et si vous ouvriez votre propre restaurant brunch ?\n\nAvec Biba Brunch, lancez-vous dans une aventure entrepreneuriale clé en main, dans un univers feel good et gourmand.\n\n✅ Un concept prêt à déployer dans votre ville\n✅ Pas besoin d'être restaurateur\n✅ Formation complète + accompagnement continu",
        "title": "Ouvrez votre Biba Brunch 🥐",
        "description": "Votre restaurant brunch clé en main, dans votre ville.",
    },
]


def create_feed_ads():
    """Créer les 8 pubs Feed (carré FB + portrait IG)."""
    print("\n📁 AD SET FEED — Entrepreneur")
    created, errors = 0, 0

    for i, ad in enumerate(ADS):
        sq_hash = SQ[i + 1]
        pt_hash = PT[i + 1]

        creative_spec = {
            "name": f"Feed — {ad['theme']}",
            "object_story_spec": json.dumps({
                "page_id": PAGE_ID,
                "link_data": {
                    "link": "https://www.bibabrunch.com",
                    "image_hash": sq_hash,
                    "message": ad["text"],
                    "name": ad["title"],
                    "description": ad["description"],
                    "call_to_action": {
                        "type": "LEARN_MORE",
                        "value": {"lead_gen_form_id": FORM_ID},
                    },
                },
            }),
            "platform_customizations": json.dumps({
                "instagram": {"image_hash": pt_hash},
            }),
        }

        r = requests.post(
            f"https://graph.facebook.com/v19.0/{AD_ACCOUNT}/adcreatives",
            params={"access_token": token},
            data=creative_spec,
        )
        result = r.json()

        if "error" in result:
            msg = result["error"].get("error_user_msg", result["error"]["message"])
            print(f"   ❌ Creative ({ad['theme']}): {msg[:120]}")
            errors += 1
            continue

        creative_id = result["id"]

        ad_data = {
            "name": f"Feed — {ad['theme']}",
            "adset_id": ADSET_FEED,
            "creative": json.dumps({"creative_id": creative_id}),
            "status": "PAUSED",
            "instagram_actor_id": IG_ID,
        }

        r = requests.post(
            f"https://graph.facebook.com/v19.0/{AD_ACCOUNT}/ads",
            params={"access_token": token},
            data=ad_data,
        )
        result = r.json()

        if "error" in result:
            msg = result["error"].get("error_user_msg", result["error"]["message"])
            print(f"   ❌ Ad ({ad['theme']}): {msg[:120]}")
            errors += 1
        else:
            print(f"   ✅ {ad['theme']} — Ad ID: {result['id']}")
            created += 1

    return created, errors


def create_story_ads():
    """Créer les 8 pubs Stories/Reels (format 1920)."""
    print("\n📁 AD SET STORIES/REELS — Entrepreneur")
    created, errors = 0, 0

    for i, ad in enumerate(ADS):
        st_hash = ST[i + 1]

        creative_spec = {
            "name": f"Story — {ad['theme']}",
            "object_story_spec": json.dumps({
                "page_id": PAGE_ID,
                "link_data": {
                    "link": "https://www.bibabrunch.com",
                    "image_hash": st_hash,
                    "message": ad["text"],
                    "name": ad["title"],
                    "description": ad["description"],
                    "call_to_action": {
                        "type": "LEARN_MORE",
                        "value": {"lead_gen_form_id": FORM_ID},
                    },
                },
            }),
        }

        r = requests.post(
            f"https://graph.facebook.com/v19.0/{AD_ACCOUNT}/adcreatives",
            params={"access_token": token},
            data=creative_spec,
        )
        result = r.json()

        if "error" in result:
            msg = result["error"].get("error_user_msg", result["error"]["message"])
            print(f"   ❌ Creative ({ad['theme']}): {msg[:120]}")
            errors += 1
            continue

        creative_id = result["id"]

        ad_data = {
            "name": f"Story — {ad['theme']}",
            "adset_id": ADSET_STORIES,
            "creative": json.dumps({"creative_id": creative_id}),
            "status": "PAUSED",
            "instagram_actor_id": IG_ID,
        }

        r = requests.post(
            f"https://graph.facebook.com/v19.0/{AD_ACCOUNT}/ads",
            params={"access_token": token},
            data=ad_data,
        )
        result = r.json()

        if "error" in result:
            msg = result["error"].get("error_user_msg", result["error"]["message"])
            print(f"   ❌ Ad ({ad['theme']}): {msg[:120]}")
            errors += 1
        else:
            print(f"   ✅ {ad['theme']} — Ad ID: {result['id']}")
            created += 1

    return created, errors


def main():
    c1, e1 = create_feed_ads()
    c2, e2 = create_story_ads()

    total = c1 + c2
    errors = e1 + e2
    print(f"\n{'='*60}")
    print(f"📊 Résultat: {total} pubs créées, {errors} erreurs")


if __name__ == "__main__":
    main()
