"""
Gestion des mots-clés et groupes d'annonces Google Ads.
"""

from config import get_client, CUSTOMER_ID


def create_ad_group(campaign_id, name, cpc_bid=None, customer_id=None):
    """Crée un groupe d'annonces dans une campagne."""
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()
    ad_group_service = client.get_service("AdGroupService")
    campaign_service = client.get_service("CampaignService")

    operation = client.get_type("AdGroupOperation")
    ad_group = operation.create
    ad_group.name = name
    ad_group.campaign = campaign_service.campaign_path(customer_id, campaign_id)
    ad_group.status = client.enums.AdGroupStatusEnum.ENABLED
    ad_group.type_ = client.enums.AdGroupTypeEnum.SEARCH_STANDARD

    if cpc_bid:
        ad_group.cpc_bid_micros = int(cpc_bid * 1_000_000)

    try:
        response = ad_group_service.mutate_ad_groups(
            customer_id=customer_id,
            operations=[operation],
        )
        resource = response.results[0].resource_name
        return {
            "id": resource.split("/")[-1],
            "resource_name": resource,
            "name": name,
        }
    except Exception as e:
        print(f"Erreur création groupe d'annonces : {e}")
        return None


def add_keywords(ad_group_id, keywords, match_type="BROAD", customer_id=None):
    """
    Ajoute des mots-clés à un groupe d'annonces.
    keywords: liste de strings
    match_type: BROAD, PHRASE, EXACT
    """
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()
    criterion_service = client.get_service("AdGroupCriterionService")
    ad_group_service = client.get_service("AdGroupService")

    match_map = {
        "BROAD": client.enums.KeywordMatchTypeEnum.BROAD,
        "PHRASE": client.enums.KeywordMatchTypeEnum.PHRASE,
        "EXACT": client.enums.KeywordMatchTypeEnum.EXACT,
    }

    operations = []
    for kw in keywords:
        operation = client.get_type("AdGroupCriterionOperation")
        criterion = operation.create
        criterion.ad_group = ad_group_service.ad_group_path(customer_id, ad_group_id)
        criterion.status = client.enums.AdGroupCriterionStatusEnum.ENABLED
        criterion.keyword.text = kw
        criterion.keyword.match_type = match_map.get(match_type, client.enums.KeywordMatchTypeEnum.BROAD)
        operations.append(operation)

    try:
        response = criterion_service.mutate_ad_group_criteria(
            customer_id=customer_id,
            operations=operations,
        )
        return [r.resource_name for r in response.results]
    except Exception as e:
        print(f"Erreur ajout mots-clés : {e}")
        return []


def add_negative_keywords(campaign_id, keywords, customer_id=None):
    """Ajoute des mots-clés négatifs au niveau campagne."""
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()
    criterion_service = client.get_service("CampaignCriterionService")
    campaign_service = client.get_service("CampaignService")

    operations = []
    for kw in keywords:
        operation = client.get_type("CampaignCriterionOperation")
        criterion = operation.create
        criterion.campaign = campaign_service.campaign_path(customer_id, campaign_id)
        criterion.negative = True
        criterion.keyword.text = kw
        criterion.keyword.match_type = client.enums.KeywordMatchTypeEnum.BROAD
        operations.append(operation)

    try:
        response = criterion_service.mutate_campaign_criteria(
            customer_id=customer_id,
            operations=operations,
        )
        return [r.resource_name for r in response.results]
    except Exception as e:
        print(f"Erreur ajout mots-clés négatifs : {e}")
        return []


def list_keywords(ad_group_id=None, customer_id=None):
    """Liste les mots-clés (optionnel: filtrés par groupe d'annonces)."""
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()
    service = client.get_service("GoogleAdsService")

    query = """
        SELECT
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            ad_group_criterion.status,
            ad_group_criterion.criterion_id,
            ad_group.name,
            ad_group.id
        FROM ad_group_criterion
        WHERE ad_group_criterion.type = 'KEYWORD'
            AND ad_group_criterion.status != 'REMOVED'
    """
    if ad_group_id:
        query += f" AND ad_group.id = {ad_group_id}"

    query += " ORDER BY ad_group_criterion.keyword.text"

    try:
        response = service.search(customer_id=customer_id, query=query)
        keywords = []
        for row in response:
            keywords.append({
                "id": str(row.ad_group_criterion.criterion_id),
                "text": row.ad_group_criterion.keyword.text,
                "match_type": row.ad_group_criterion.keyword.match_type.name,
                "status": row.ad_group_criterion.status.name,
                "ad_group": row.ad_group.name,
                "ad_group_id": str(row.ad_group.id),
            })
        return keywords
    except Exception as e:
        print(f"Erreur : {e}")
        return []


def list_ad_groups(campaign_id=None, customer_id=None):
    """Liste les groupes d'annonces."""
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()
    service = client.get_service("GoogleAdsService")

    query = """
        SELECT
            ad_group.id,
            ad_group.name,
            ad_group.status,
            ad_group.cpc_bid_micros,
            campaign.name,
            campaign.id
        FROM ad_group
        WHERE ad_group.status != 'REMOVED'
    """
    if campaign_id:
        query += f" AND campaign.id = {campaign_id}"

    query += " ORDER BY ad_group.name"

    try:
        response = service.search(customer_id=customer_id, query=query)
        groups = []
        for row in response:
            cpc = row.ad_group.cpc_bid_micros / 1_000_000 if row.ad_group.cpc_bid_micros else 0
            groups.append({
                "id": str(row.ad_group.id),
                "name": row.ad_group.name,
                "status": row.ad_group.status.name,
                "cpc_bid": f"{cpc:.2f}€",
                "campaign": row.campaign.name,
                "campaign_id": str(row.campaign.id),
            })
        return groups
    except Exception as e:
        print(f"Erreur : {e}")
        return []
