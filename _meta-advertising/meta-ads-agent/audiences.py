"""Module de gestion des audiences Meta Ads."""

from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.customaudience import CustomAudience


def list_audiences(account_id: str):
    """Liste toutes les audiences personnalisées."""
    account = AdAccount(account_id)
    audiences = account.get_custom_audiences(fields=[
        "id",
        "name",
        "subtype",
        "approximate_count",
        "description",
        "delivery_status",
    ])
    result = []
    for a in audiences:
        result.append({
            "id": a["id"],
            "name": a.get("name", "Sans nom"),
            "type": a.get("subtype", "N/A"),
            "taille": a.get("approximate_count", "N/A"),
            "description": a.get("description", ""),
        })
    return result


def create_lookalike_audience(account_id: str, source_audience_id: str,
                               name: str, country: str = "FR", ratio: float = 0.01):
    """Crée une audience lookalike."""
    account = AdAccount(account_id)
    params = {
        "name": name,
        "subtype": "LOOKALIKE",
        "origin_audience_id": source_audience_id,
        "lookalike_spec": {
            "type": "similarity",
            "country": country,
            "ratio": ratio,
        },
    }
    audience = account.create_custom_audience(params=params)
    return audience


def get_audience_details(audience_id: str):
    """Récupère les détails d'une audience."""
    audience = CustomAudience(audience_id)
    details = audience.api_get(fields=[
        "id",
        "name",
        "subtype",
        "approximate_count",
        "description",
        "delivery_status",
        "operation_status",
        "permission_for_actions",
    ])
    return dict(details)
