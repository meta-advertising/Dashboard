#!/usr/bin/env python3
"""Supprime les 11 anciennes pubs + recrée avec textes validés.
Ad Set 1 (Entrepreneur) uniquement.
8 pubs image (carré 1080x1080) + 3 pubs vidéo.
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
ADSET_ID = "120239106762650662"

# IDs des 11 pubs à supprimer
OLD_ADS = [
    "120239120197650662",
    "120239120199550662",
    "120239120201890662",
    "120239119515860662",
    "120239119518440662",
    "120239119528450662",
    "120239119532930662",
    "120239119521050662",
    "120239119504200662",
    "120239119511550662",
    "120239119523790662",
]

# Hashes images carrées (1080x1080)
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

# IDs vidéos
VIDEO_IDS = {
    1: "2096811104474885",
    2: "911106305234542",
    3: "1869410617089363",
}

# Thumbnails distinctes pour chaque vidéo
VIDEO_THUMBS = {
    1: SQ[1],
    2: SQ[2],
    3: SQ[3],
}

# 8 pubs image — textes validés
IMAGE_ADS = [
    {
        "name": "Entreprendre avec plaisir",
        "image_hash": SQ[1],
        "text": "Entreprendre avec plaisir, c'est exactement ce que vivent nos franchisés au quotidien. Biba Brunch, c'est un restaurant où les clients reviennent chaque week-end, une ambiance chaleureuse qui se remplit naturellement, et un modèle qui vous laisse profiter de vos soirées. Vous cherchez un projet entrepreneurial qui a du sens — et du goût ? Découvrez la franchise Biba Brunch. ☀️",
        "title": "Entreprendre autrement avec Biba Brunch",
        "description": "Découvrez un modèle de franchise gourmand et humain.",
    },
    {
        "name": "CA cible et résultats",
        "image_hash": SQ[2],
        "text": "Un concept qui parle de lui-même 👇\n\nUne carte gourmande, un positionnement premium, et des résultats à la hauteur. Biba Brunch, c'est jusqu'à 1 000 000 € de chiffre d'affaires cible, 1er restaurant brunch de Marseille, 3e brunch de France. Ces résultats ne sont pas théoriques — ils sont le fruit d'un modèle rodé, prêt à être déployé dans votre ville.",
        "title": "Un modèle validé, des résultats concrets 📈",
        "description": "Franchise brunch avec un potentiel de CA ambitieux.",
    },
    {
        "name": "Équipe et fait maison",
        "image_hash": SQ[3],
        "text": "Derrière chaque assiette Biba Brunch, il y a du fait maison, des produits frais, et surtout une équipe soudée 🤝\n\nDevenir franchisé, ce n'est pas se lancer seul : c'est intégrer un réseau où la transmission du savoir-faire est au centre de tout. Formation, recettes, process — tout est pensé pour que vous puissiez reproduire cette qualité dès le premier jour dans votre propre restaurant.",
        "title": "Du fait maison et un vrai accompagnement",
        "description": "Rejoignez un réseau où le savoir-faire se transmet.",
    },
    {
        "name": "Histoire de famille",
        "image_hash": SQ[4],
        "text": "Biba Brunch n'est pas né dans un bureau d'études. C'est une histoire de famille, un concept construit sur le terrain, affiné service après service 💛\n\nCe savoir-faire concret, cette connaissance intime du métier, c'est exactement ce que l'équipe fondatrice transmet à chaque franchisé. Pas de théorie — un accompagnement pas à pas, du business plan jusqu'à l'ouverture et au-delà.",
        "title": "Une histoire de famille devenue franchise",
        "description": "Un modèle forgé sur le terrain, transmis avec passion.",
    },
    {
        "name": "Plaisir et performance",
        "image_hash": SQ[5],
        "text": "Un restaurant qui attire le regard depuis la rue. Une carte qui génère un panier moyen élevé. Une clientèle fidèle qui revient semaine après semaine ✨\n\nBiba Brunch a trouvé l'équilibre entre un lieu de vie inspirant et un modèle économique performant. C'est cette combinaison rare que nous proposons à nos futurs franchisés : le plaisir d'un beau projet, la solidité d'un vrai business.",
        "title": "Plaisir et performance, le duo Biba Brunch",
        "description": "Un concept rentable dans un cadre qui inspire.",
    },
    {
        "name": "Marché en effervescence",
        "image_hash": SQ[6],
        "text": "Le brunch n'est plus une tendance — c'est un mode de vie 🍴\n\nLes recherches explosent, les files d'attente s'allongent, et la demande dépasse largement l'offre dans la plupart des villes françaises. Biba Brunch est déjà positionné comme une référence sur ce marché en pleine effervescence. Ouvrir une franchise aujourd'hui, c'est prendre position sur un créneau porteur avec une enseigne qui a déjà fait ses preuves.",
        "title": "Un marché en plein essor, une enseigne qui mène 🚀",
        "description": "Positionnez-vous sur le marché du brunch avec Biba.",
    },
    {
        "name": "Accompagnement humain",
        "image_hash": SQ[7],
        "text": "Ouvrir un restaurant, c'est un projet de vie. Chez Biba Brunch, on le sait — et c'est pour ça que l'accompagnement ne s'arrête pas à la signature 🤝\n\nBusiness plan, recherche de local, travaux, formation des équipes, lancement : l'équipe fondatrice est présente à chaque étape. Un accompagnement humain et bienveillant, parce qu'on ne construit pas une franchise solide autrement.",
        "title": "Accompagné à chaque étape de votre projet",
        "description": "Un réseau humain qui vous guide vers la réussite.",
    },
    {
        "name": "Ouvrez votre restaurant",
        "image_hash": SQ[8],
        "text": "Imaginez cette façade dans votre ville 🏠\n\nUn lieu chaleureux, une identité visuelle forte, une file d'attente le dimanche matin. Biba Brunch vous fournit tout pour y arriver : le concept, la formation, les process, le soutien continu. Pas besoin d'être restaurateur — il faut l'envie d'entreprendre et le goût du bien fait. Le reste, on vous le transmet.",
        "title": "Ouvrez votre restaurant Biba Brunch 🌿",
        "description": "Un concept clé en main, prêt à s'installer dans votre ville.",
    },
]

# 3 pubs vidéo — textes validés
VIDEO_ADS = [
    {
        "name": "Vidéo — Le quotidien Biba",
        "video_id": VIDEO_IDS[1],
        "thumb": VIDEO_THUMBS[1],
        "text": "Ce que vous voyez ici, c'est le quotidien d'un franchisé Biba Brunch : un restaurant vivant, des clients heureux, une énergie contagieuse ☀️\n\nCe n'est pas un clip publicitaire — c'est la réalité d'un concept qui fonctionne. Si vous cherchez un projet entrepreneurial ancré dans le concret et le plaisir, c'est le moment de nous rejoindre.",
        "title": "Le quotidien Biba Brunch, en vrai",
        "description": "Découvrez ce qui vous attend en tant que franchisé.",
    },
    {
        "name": "Vidéo — L'exigence qualité",
        "video_id": VIDEO_IDS[2],
        "thumb": VIDEO_THUMBS[2],
        "text": "Chaque détail compte chez Biba Brunch. L'accueil, le dressage, les produits frais, l'ambiance 🍳\n\nC'est cette exigence qui fait revenir les clients — et c'est cette exigence que nous transmettons à chaque franchisé. Un restaurant Biba Brunch, ce n'est pas juste un concept : c'est une promesse de qualité que vos futurs clients reconnaîtront dès la première visite.",
        "title": "L'exigence qui fait la différence",
        "description": "Un niveau de qualité qui fidélise dès le premier jour.",
    },
    {
        "name": "Vidéo — Rejoignez l'aventure",
        "video_id": VIDEO_IDS[3],
        "thumb": VIDEO_THUMBS[3],
        "text": "Du brunch servi avec générosité, un cadre soigné, des sourires sincères 💛\n\nBiba Brunch a construit sa réputation sur des fondations simples mais solides. Aujourd'hui, nous ouvrons ce modèle à des entrepreneurs motivés, partout en France. Pas de promesses creuses — un accompagnement réel, un concept éprouvé, et la liberté d'entreprendre dans un univers qui a du sens.",
        "title": "Rejoignez l'aventure Biba Brunch 🌿",
        "description": "Un concept éprouvé, ouvert aux entrepreneurs motivés.",
    },
]


def delete_old_ads():
    print("🗑️  Suppression des 11 anciennes pubs...")
    for ad_id in OLD_ADS:
        r = requests.delete(
            f"https://graph.facebook.com/v19.0/{ad_id}",
            params={"access_token": token},
        )
        result = r.json()
        if result.get("success"):
            print(f"   ✅ Supprimée: {ad_id}")
        else:
            msg = result.get("error", {}).get("message", str(result))
            print(f"   ❌ Erreur {ad_id}: {msg[:100]}")


def create_image_ad(ad_info):
    """Crée une pub image (creative + ad)."""
    creative_spec = {
        "name": ad_info["name"],
        "object_story_spec": json.dumps({
            "page_id": PAGE_ID,
            "link_data": {
                "link": "https://www.bibabrunch.com",
                "image_hash": ad_info["image_hash"],
                "message": ad_info["text"],
                "name": ad_info["title"],
                "description": ad_info["description"],
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
        print(f"   ❌ Creative ({ad_info['name']}): {msg[:120]}")
        return False

    creative_id = result["id"]

    ad_data = {
        "name": ad_info["name"],
        "adset_id": ADSET_ID,
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
        print(f"   ❌ Ad ({ad_info['name']}): {msg[:120]}")
        return False

    print(f"   ✅ {ad_info['name']} — Ad ID: {result['id']}")
    return True


def create_video_ad(ad_info):
    """Crée une pub vidéo (creative + ad)."""
    creative_spec = {
        "name": ad_info["name"],
        "object_story_spec": json.dumps({
            "page_id": PAGE_ID,
            "video_data": {
                "video_id": ad_info["video_id"],
                "image_hash": ad_info["thumb"],
                "message": ad_info["text"],
                "title": ad_info["title"],
                "link_description": ad_info["description"],
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
        print(f"   ❌ Creative ({ad_info['name']}): {msg[:120]}")
        return False

    creative_id = result["id"]

    ad_data = {
        "name": ad_info["name"],
        "adset_id": ADSET_ID,
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
        print(f"   ❌ Ad ({ad_info['name']}): {msg[:120]}")
        return False

    print(f"   ✅ {ad_info['name']} — Ad ID: {result['id']}")
    return True


def main():
    delete_old_ads()

    print("\n📸 Création des 8 pubs image...")
    img_ok = sum(1 for ad in IMAGE_ADS if create_image_ad(ad))

    print("\n🎬 Création des 3 pubs vidéo...")
    vid_ok = sum(1 for ad in VIDEO_ADS if create_video_ad(ad))

    total = img_ok + vid_ok
    errors = 11 - total
    print(f"\n{'='*60}")
    print(f"📊 Résultat: {total} pubs créées, {errors} erreurs")


if __name__ == "__main__":
    main()
