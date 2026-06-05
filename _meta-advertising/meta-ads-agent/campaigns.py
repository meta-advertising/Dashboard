"""Module de gestion des campagnes Meta Ads."""

from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign


def list_campaigns(account_id: str):
    """Liste toutes les campagnes d'un compte pub."""
    account = AdAccount(account_id)
    campaigns = account.get_campaigns(fields=[
        "id",
        "name",
        "status",
        "objective",
        "daily_budget",
        "lifetime_budget",
        "start_time",
        "stop_time",
    ])
    result = []
    for c in campaigns:
        result.append({
            "id": c["id"],
            "name": c["name"],
            "status": c.get("status", "UNKNOWN"),
            "objective": c.get("objective", "N/A"),
            "daily_budget": c.get("daily_budget"),
            "lifetime_budget": c.get("lifetime_budget"),
            "start_time": c.get("start_time"),
            "stop_time": c.get("stop_time"),
        })
    return result


def create_campaign(account_id: str, name: str, objective: str,
                    daily_budget: int = None, status: str = "PAUSED"):
    """Crée une nouvelle campagne."""
    account = AdAccount(account_id)
    params = {
        "name": name,
        "objective": objective,
        "status": status,
        "special_ad_categories": [],
    }
    if daily_budget:
        params["daily_budget"] = daily_budget  # en centimes
    campaign = account.create_campaign(params=params)
    return campaign


def update_campaign(campaign_id: str, **kwargs):
    """Met à jour une campagne existante."""
    campaign = Campaign(campaign_id)
    campaign.api_update(params=kwargs)
    return campaign


def pause_campaign(campaign_id: str):
    """Met en pause une campagne."""
    return update_campaign(campaign_id, status="PAUSED")


def activate_campaign(campaign_id: str):
    """Active une campagne."""
    return update_campaign(campaign_id, status="ACTIVE")


def delete_campaign(campaign_id: str):
    """Supprime (archive) une campagne."""
    campaign = Campaign(campaign_id)
    campaign.api_delete()
    return True
