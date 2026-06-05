#!/usr/bin/env python3
"""Création des 24 pubs Biba Brunch avec platform_customizations.
- object_story_spec : image carrée (1080x1080) → placements Facebook
- platform_customizations : image portrait (1080x1350) → placements Instagram
- instagram_actor_id au niveau de la pub
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

ADSET_IDS = ["120239106762650662", "120239106763220662", "120239106763730662"]

# Hashes des images carrées (1080x1080) — Facebook
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

# Hashes des images portrait (1080x1350) — Instagram
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

THEMES = [
    "Entreprendre avec plaisir",
    "CA cible 1M",
    "Équipe fait maison",
    "Histoire de famille",
    "Plaisir et performance",
    "Marché effervescence",
    "Accompagnement humain",
    "Ouvrez votre restaurant",
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

        for i in range(8):
            theme = THEMES[i]
            sq_hash = SQ[i + 1]
            pt_hash = PT[i + 1]

            # Creative : carré par défaut (FB) + portrait pour Instagram
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
                            "value": {"lead_gen_form_id": FORM_ID},
                        },
                    },
                }),
                "platform_customizations": json.dumps({
                    "instagram": {
                        "image_hash": pt_hash,
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
                print(f"   ❌ Creative ({theme}): {msg[:120]}")
                total_errors += 1
                continue

            creative_id = result["id"]

            # Pub avec instagram_actor_id au niveau ad
            ad_data = {
                "name": f"Biba — {ad_text['prefix']} — {theme}",
                "adset_id": adset_id,
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
                print(f"   ❌ Ad ({theme}): {msg[:120]}")
                total_errors += 1
            else:
                print(f"   ✅ {theme} — Ad ID: {result['id']}")
                total_created += 1

    print(f"\n{'='*60}")
    print(f"📊 Résultat: {total_created} pubs créées, {total_errors} erreurs")


if __name__ == "__main__":
    main()
