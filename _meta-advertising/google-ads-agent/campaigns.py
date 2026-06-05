"""
Gestion des campagnes Google Ads.
"""

from config import get_client, CUSTOMER_ID


CAMPAIGN_STATUS = {
    0: "NON SPÉCIFIÉ",
    1: "INCONNU",
    2: "ACTIVÉE",
    3: "EN PAUSE",
    4: "SUPPRIMÉE",
}

CAMPAIGN_TYPE = {
    0: "NON SPÉCIFIÉ",
    2: "SEARCH",
    3: "DISPLAY",
    4: "SHOPPING",
    5: "HOTEL",
    6: "VIDEO",
    7: "MULTI-CANAL",
    8: "LOCAL",
    9: "SMART",
    10: "PERFORMANCE MAX",
    11: "LOCAL SERVICES",
    12: "DISCOVERY",
    13: "TRAVEL",
    14: "DEMAND GEN",
}


def list_campaigns(customer_id=None):
    """Liste toutes les campagnes du compte."""
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()
    service = client.get_service("GoogleAdsService")

    query = """
        SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            campaign_budget.amount_micros,
            campaign.start_date,
            campaign.end_date
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
    """
    try:
        response = service.search(customer_id=customer_id, query=query)
        campaigns = []
        for row in response:
            budget_euros = row.campaign_budget.amount_micros / 1_000_000 if row.campaign_budget.amount_micros else 0
            campaigns.append({
                "id": str(row.campaign.id),
                "name": row.campaign.name,
                "status": CAMPAIGN_STATUS.get(row.campaign.status, "INCONNU"),
                "type": CAMPAIGN_TYPE.get(row.campaign.advertising_channel_type, "INCONNU"),
                "budget_daily": f"{budget_euros:.2f}€",
                "start_date": row.campaign.start_date,
                "end_date": row.campaign.end_date or "-",
            })
        return campaigns
    except Exception as e:
        print(f"Erreur : {e}")
        return []


def create_campaign(name, budget_daily, campaign_type="SEARCH", status="PAUSED", customer_id=None):
    """
    Crée une nouvelle campagne.
    budget_daily en euros (ex: 10.0 pour 10€/jour)
    campaign_type: SEARCH, DISPLAY, PERFORMANCE_MAX, etc.
    """
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()

    campaign_service = client.get_service("CampaignService")
    budget_service = client.get_service("CampaignBudgetService")

    # 1. Créer le budget
    budget_operation = client.get_type("CampaignBudgetOperation")
    budget = budget_operation.create
    budget.name = f"Budget - {name}"
    budget.amount_micros = int(budget_daily * 1_000_000)
    budget.delivery_method = client.enums.BudgetDeliveryMethodEnum.STANDARD

    if campaign_type == "PERFORMANCE_MAX":
        budget.explicitly_shared = False

    try:
        budget_response = budget_service.mutate_campaign_budgets(
            customer_id=customer_id,
            operations=[budget_operation],
        )
        budget_resource = budget_response.results[0].resource_name
    except Exception as e:
        print(f"Erreur création budget : {e}")
        return None

    # 2. Créer la campagne
    campaign_operation = client.get_type("CampaignOperation")
    campaign = campaign_operation.create
    campaign.name = name
    campaign.campaign_budget = budget_resource
    campaign.status = client.enums.CampaignStatusEnum.PAUSED if status == "PAUSED" else client.enums.CampaignStatusEnum.ENABLED

    type_enum = client.enums.AdvertisingChannelTypeEnum
    type_map = {
        "SEARCH": type_enum.SEARCH,
        "DISPLAY": type_enum.DISPLAY,
        "PERFORMANCE_MAX": type_enum.PERFORMANCE_MAX,
        "VIDEO": type_enum.VIDEO,
        "SHOPPING": type_enum.SHOPPING,
        "DEMAND_GEN": type_enum.DEMAND_GEN,
    }
    campaign.advertising_channel_type = type_map.get(campaign_type, type_enum.SEARCH)

    # Config spécifique Search
    if campaign_type == "SEARCH":
        campaign.manual_cpc.enhanced_cpc_enabled = False
        campaign.network_settings.target_google_search = True
        campaign.network_settings.target_search_network = False

    # Config spécifique Performance Max
    if campaign_type == "PERFORMANCE_MAX":
        campaign.bidding_strategy_type = client.enums.BiddingStrategyTypeEnum.MAXIMIZE_CONVERSIONS

    try:
        response = campaign_service.mutate_campaigns(
            customer_id=customer_id,
            operations=[campaign_operation],
        )
        campaign_resource = response.results[0].resource_name
        campaign_id = campaign_resource.split("/")[-1]
        return {
            "id": campaign_id,
            "resource_name": campaign_resource,
            "name": name,
            "type": campaign_type,
            "budget": f"{budget_daily:.2f}€/jour",
            "status": status,
        }
    except Exception as e:
        print(f"Erreur création campagne : {e}")
        return None


def update_campaign_status(campaign_id, new_status, customer_id=None):
    """Met à jour le statut d'une campagne (ENABLED, PAUSED, REMOVED)."""
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()
    campaign_service = client.get_service("CampaignService")

    campaign_operation = client.get_type("CampaignOperation")
    campaign = campaign_operation.update
    campaign.resource_name = campaign_service.campaign_path(customer_id, campaign_id)

    status_map = {
        "ENABLED": client.enums.CampaignStatusEnum.ENABLED,
        "PAUSED": client.enums.CampaignStatusEnum.PAUSED,
        "REMOVED": client.enums.CampaignStatusEnum.REMOVED,
    }
    campaign.status = status_map.get(new_status, client.enums.CampaignStatusEnum.PAUSED)

    client.copy_from(
        campaign_operation.update_mask,
        client.get_type("FieldMask")(paths=["status"]),
    )

    try:
        campaign_service.mutate_campaigns(
            customer_id=customer_id,
            operations=[campaign_operation],
        )
        return True
    except Exception as e:
        print(f"Erreur : {e}")
        return False
