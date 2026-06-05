"""
Gestion des comptes Google Ads (REST API).
"""

import requests
from config import get_headers, search_query, CUSTOMER_ID, BASE_URL


def list_accessible_accounts():
    """Liste tous les comptes accessibles."""
    url = f"{BASE_URL}/customers:listAccessibleCustomers"
    try:
        response = requests.get(url, headers=get_headers())
        response.raise_for_status()
        data = response.json()
        resource_names = data.get("resourceNames", [])

        accounts = []
        for rn in resource_names:
            cid = rn.split("/")[1]
            try:
                rows = search_query("""
                    SELECT
                        customer.id,
                        customer.descriptive_name,
                        customer.currency_code,
                        customer.time_zone,
                        customer.manager
                    FROM customer
                    LIMIT 1
                """, cid)
                for row in rows:
                    c = row.get("customer", {})
                    accounts.append({
                        "id": str(c.get("id", cid)),
                        "name": c.get("descriptiveName", "(sans nom)"),
                        "currency": c.get("currencyCode", "-"),
                        "timezone": c.get("timeZone", "-"),
                        "is_manager": c.get("manager", False),
                    })
            except Exception:
                accounts.append({
                    "id": cid,
                    "name": "(accès limité)",
                    "currency": "-",
                    "timezone": "-",
                    "is_manager": False,
                })
        return accounts
    except Exception as e:
        print(f"Erreur lors de la récupération des comptes : {e}")
        return []


def get_account_info(customer_id=None):
    """Récupère les infos du compte actif."""
    customer_id = customer_id or CUSTOMER_ID
    try:
        rows = search_query("""
            SELECT
                customer.id,
                customer.descriptive_name,
                customer.currency_code,
                customer.time_zone,
                customer.manager,
                customer.auto_tagging_enabled
            FROM customer
            LIMIT 1
        """, customer_id)
        for row in rows:
            c = row.get("customer", {})
            return {
                "id": str(c.get("id", customer_id)),
                "name": c.get("descriptiveName", "(sans nom)"),
                "currency": c.get("currencyCode", "-"),
                "timezone": c.get("timeZone", "-"),
                "is_manager": c.get("manager", False),
                "auto_tagging": c.get("autoTaggingEnabled", False),
            }
        return None
    except Exception as e:
        print(f"Erreur : {e}")
        return None
