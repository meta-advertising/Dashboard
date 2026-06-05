#!/usr/bin/env python3
"""Création des 24 publicités pour la campagne Biba Brunch."""

import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()
token = os.getenv("META_ACCESS_TOKEN")

AD_ACCOUNT = "act_852935385848128"
PAGE_ID = "104826605806643"
IG_ID = "17841455716206414"
FORM_ID = "4369170910008753"

ADSET_IDS = ["120239106762650662", "120239106763220662", "120239106763730662"]

IMAGE_HASHES = {
    "1.png": "0db58de885a35fc645be0f2b460c4bf9",
    "2.png": "c353a483cad65517509a4ca084110de1",
    "3.png": "ae838dfb6c9d7e3c2a7f26d60fae903c",
    "4.png": "58282a22ce8926da1aaede0dd174c67f",
    "5.png": "a7f6b840a1517a7504428f423e459874",
    "6.png": "e4473fc4b4492ac36b16695ab8ec3bc7",
    "7.png": "2b8018cd88a55e82ecb647e208841d89",
    "8.png": "b9749a0a53fe671fb2fd0601953e6613",
    "9.png": "b29a22b46869b7a5bc9ac2998b7c91af",
    "10.png": "8aa45d540dee7a5926b2d3b7f59bed61",
    "11.png": "f58ae6d5c01d486edf95ad15e7fd9def",
    "12.png": "0fa67c2f5e8e8b5deab1476e77e9701e",
    "13.png": "8c1d4fbf98243bf920677401b4ad7370",
    "14.png": "4c00c4f59aeaa21defe90052a1ac1313",
    "15.png": "52c929c0802cb2683d1e69ebc1807eb4",
    "16.png": "7b1335acf5eb9594f63d66d909d2bd0a",
}

PAIRS = [
    ("1.png", "2.png", "Entreprendre avec plaisir"),
    ("3.png", "4.png", "CA cible 1M"),
    ("5.png", "6.png", "Équipe fait maison"),
    ("7.png", "8.png", "Histoire de famille"),
    ("9.png", "10.png", "Plaisir et performance"),
    ("11.png", "12.png", "Marché effervescence"),
    ("13.png", "14.png", "Accompagnement humain"),
    ("15.png", "16.png", "Ouvrez votre restaurant"),
]

AD_TEXTS = [
    {
        "prefix": "Entrepreneur",
        "text": "🥐 Vous rêvez d'entreprendre dans un univers gourmand et convivial ?\n\nBiba Brunch, c'est le concept qui cartonne à Marseille — déjà 3e brunch de France 🇫🇷\n\n✅ Un modèle rentable et clé en main\n✅ Jusqu'à 1 000 000 € de CA cible\n✅ Un accompagnement humain à chaque étape",
        "title": "Devenez franchisé Biba Brunch 🌿",
        "description": "Ouvrez votre restaurant brunch dans votre ville.",
    },
    {
        "prefix": "Restaurateur",
        "text": "🍳 Restaurateur(trice), commerçant(e) : et si vous donniez un nouvel élan à votre parcours ?\n\nRejoignez Biba Brunch, l'enseigne qui allie plaisir et performance 💛\n\n✅ Un concept premium accessible à tous\n✅ Une carte créative, pensée pour la marge\n✅ Une marque forte, moderne et inspirante",
        "title": "Rejoignez la franchise Biba Brunch 🥞",
        "description": "Une enseigne clé en main, alliant plaisir et rentabilité.",
    },
    {
        "prefix": "Passionné",
        "text": "☀️ Passionné(e) de brunch, de déco et d'art de vivre ?\n\nTransformez votre passion en réussite entrepreneuriale avec Biba Brunch !\n\n🌸 Un univers feel good et solaire\n🍴 Du fait maison, de la générosité\n🤝 Une équipe qui vous accompagne vraiment",
        "title": "Ouvrez votre Biba Brunch 🌺",
        "description": "Faites de votre passion une aventure entrepreneuriale.",
    },
]


def main():
    total_created = 0
    total_errors = 0

    for adset_idx, (adset_id, ad_text) in enumerate(zip(ADSET_IDS, AD_TEXTS)):
        print(f"\n📁 Ad Set {adset_idx+1} — {ad_text['prefix']}")

        for pair_idx, (square, portrait, theme) in enumerate(PAIRS):
            sq_hash = IMAGE_HASHES[square]

            creative_spec = {
                "name": f"Biba — {ad_text['prefix']} — {theme}",
                "object_story_spec": json.dumps({
                    "page_id": PAGE_ID,
                    "link_data": {
                        "link": "https://www.bibabrunch.com",
                        "image_hash": sq_hash,
                        "message": ad_text["text"],
                        "name": ad_text["title"],
                        "description": ad_text["description"],
                        "call_to_action": {
                            "type": "LEARN_MORE",
                            "value": {
                                "lead_gen_form_id": FORM_ID,
                            },
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
                print(f"   ❌ Creative {pair_idx+1} ({theme}): {msg[:100]}")
                total_errors += 1
                continue

            creative_id = result["id"]

            ad_data = {
                "name": f"Biba — {ad_text['prefix']} — {theme}",
                "adset_id": adset_id,
                "creative": json.dumps({"creative_id": creative_id}),
                "status": "PAUSED",
            }

            r = requests.post(
                f"https://graph.facebook.com/v19.0/{AD_ACCOUNT}/ads",
                params={"access_token": token},
                data=ad_data,
            )
            result = r.json()

            if "error" in result:
                msg = result["error"].get("error_user_msg", result["error"]["message"])
                print(f"   ❌ Ad {pair_idx+1} ({theme}): {msg[:100]}")
                total_errors += 1
            else:
                print(f"   ✅ {theme} — Ad ID: {result['id']}")
                total_created += 1

    print(f"\n{'='*60}")
    print(f"📊 Résultat: {total_created} pubs créées, {total_errors} erreurs")


if __name__ == "__main__":
    main()
