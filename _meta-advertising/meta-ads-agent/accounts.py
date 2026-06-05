"""Module de gestion des comptes publicitaires."""

from facebook_business.adobjects.user import User
from facebook_business.adobjects.adaccount import AdAccount


def list_ad_accounts():
    """Liste tous les comptes pub accessibles."""
    me = User(fbid="me")
    accounts = me.get_ad_accounts(fields=[
        "id",
        "name",
        "account_status",
        "currency",
        "balance",
    ])
    result = []
    for acc in accounts:
        status_map = {1: "Actif", 2: "Désactivé", 3: "Non confirmé"}
        result.append({
            "id": acc["id"],
            "name": acc.get("name", "Sans nom"),
            "status": status_map.get(acc.get("account_status"), "Inconnu"),
            "currency": acc.get("currency", "EUR"),
            "balance": acc.get("balance", "N/A"),
        })
    return result


def get_account(account_id: str) -> AdAccount:
    """Récupère un compte pub par son ID."""
    if not account_id.startswith("act_"):
        account_id = f"act_{account_id}"
    return AdAccount(account_id)
