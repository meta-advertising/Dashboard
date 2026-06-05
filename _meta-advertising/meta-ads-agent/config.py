"""Configuration et connexion à l'API Meta."""

import os
from dotenv import load_dotenv
from facebook_business.api import FacebookAdsApi

load_dotenv()

META_APP_ID = os.getenv("META_APP_ID")
META_APP_SECRET = os.getenv("META_APP_SECRET")
META_ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")


def init_api():
    """Initialise la connexion à l'API Meta Marketing."""
    if not all([META_APP_ID, META_APP_SECRET, META_ACCESS_TOKEN]):
        raise ValueError(
            "Credentials manquants ! Vérifie ton fichier .env"
        )
    FacebookAdsApi.init(META_APP_ID, META_APP_SECRET, META_ACCESS_TOKEN)
    print("✅ Connexion à l'API Meta établie.")
