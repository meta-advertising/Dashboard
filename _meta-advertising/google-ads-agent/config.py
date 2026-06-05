"""
Configuration et initialisation du client Google Ads API (REST).
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

CUSTOMER_ID = os.getenv("GOOGLE_ADS_CUSTOMER_ID")
DEVELOPER_TOKEN = os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN")
CLIENT_ID = os.getenv("GOOGLE_ADS_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_ADS_CLIENT_SECRET")
REFRESH_TOKEN = os.getenv("GOOGLE_ADS_REFRESH_TOKEN")
LOGIN_CUSTOMER_ID = os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID", CUSTOMER_ID)

API_VERSION = "v18"
BASE_URL = f"https://googleads.googleapis.com/{API_VERSION}"

_access_token_cache = {"token": None}


def get_access_token():
    """Obtient un access token via le refresh token."""
    if _access_token_cache["token"]:
        return _access_token_cache["token"]

    response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": REFRESH_TOKEN,
            "grant_type": "refresh_token",
        },
    )
    response.raise_for_status()
    token = response.json()["access_token"]
    _access_token_cache["token"] = token
    return token


def get_headers():
    """Retourne les headers pour les requêtes API."""
    return {
        "Authorization": f"Bearer {get_access_token()}",
        "developer-token": DEVELOPER_TOKEN,
        "login-customer-id": LOGIN_CUSTOMER_ID,
        "Content-Type": "application/json",
    }


def search_query(query, customer_id=None):
    """Exécute une requête GAQL via l'API REST."""
    customer_id = customer_id or CUSTOMER_ID
    url = f"{BASE_URL}/customers/{customer_id}/googleAds:searchStream"
    response = requests.post(
        url,
        headers=get_headers(),
        json={"query": query},
    )
    if response.status_code != 200:
        error_data = response.json()
        error_msg = error_data.get("error", {}).get("message", response.text)
        raise Exception(f"API Error ({response.status_code}): {error_msg}")

    results = response.json()
    rows = []
    for batch in results:
        rows.extend(batch.get("results", []))
    return rows


def mutate(service_name, customer_id, operations_payload):
    """Exécute une mutation via l'API REST."""
    customer_id = customer_id or CUSTOMER_ID
    url = f"{BASE_URL}/customers/{customer_id}/{service_name}:mutate"
    response = requests.post(
        url,
        headers=get_headers(),
        json=operations_payload,
    )
    if response.status_code != 200:
        error_data = response.json()
        error_msg = error_data.get("error", {}).get("message", response.text)
        raise Exception(f"API Error ({response.status_code}): {error_msg}")

    return response.json()
