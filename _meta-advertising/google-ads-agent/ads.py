"""
Création et gestion des annonces Google Ads.
"""

from config import get_client, CUSTOMER_ID


def create_responsive_search_ad(ad_group_id, headlines, descriptions, final_url, customer_id=None):
    """
    Crée une annonce responsive Search (RSA).
    headlines: liste de strings (3 à 15 titres, max 30 chars chacun)
    descriptions: liste de strings (2 à 4 descriptions, max 90 chars chacune)
    """
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()
    ad_group_ad_service = client.get_service("AdGroupAdService")
    ad_group_service = client.get_service("AdGroupService")

    operation = client.get_type("AdGroupAdOperation")
    ad_group_ad = operation.create
    ad_group_ad.ad_group = ad_group_service.ad_group_path(customer_id, ad_group_id)
    ad_group_ad.status = client.enums.AdGroupAdStatusEnum.ENABLED

    ad = ad_group_ad.ad
    ad.final_urls.append(final_url)

    for h in headlines:
        headline = client.get_type("AdTextAsset")
        headline.text = h
        ad.responsive_search_ad.headlines.append(headline)

    for d in descriptions:
        desc = client.get_type("AdTextAsset")
        desc.text = d
        ad.responsive_search_ad.descriptions.append(desc)

    try:
        response = ad_group_ad_service.mutate_ad_group_ads(
            customer_id=customer_id,
            operations=[operation],
        )
        resource = response.results[0].resource_name
        return {
            "resource_name": resource,
            "headlines": headlines,
            "descriptions": descriptions,
            "url": final_url,
        }
    except Exception as e:
        print(f"Erreur création annonce : {e}")
        return None


def list_ads(campaign_id=None, ad_group_id=None, customer_id=None):
    """Liste les annonces."""
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()
    service = client.get_service("GoogleAdsService")

    query = """
        SELECT
            ad_group_ad.ad.id,
            ad_group_ad.ad.name,
            ad_group_ad.ad.type,
            ad_group_ad.status,
            ad_group_ad.ad.responsive_search_ad.headlines,
            ad_group_ad.ad.responsive_search_ad.descriptions,
            ad_group_ad.ad.final_urls,
            ad_group.name,
            ad_group.id,
            campaign.name,
            campaign.id
        FROM ad_group_ad
        WHERE ad_group_ad.status != 'REMOVED'
    """
    if campaign_id:
        query += f" AND campaign.id = {campaign_id}"
    if ad_group_id:
        query += f" AND ad_group.id = {ad_group_id}"

    query += " ORDER BY ad_group_ad.ad.id"

    try:
        response = service.search(customer_id=customer_id, query=query)
        ads = []
        for row in response:
            headlines = [h.text for h in row.ad_group_ad.ad.responsive_search_ad.headlines] if row.ad_group_ad.ad.responsive_search_ad.headlines else []
            descriptions = [d.text for d in row.ad_group_ad.ad.responsive_search_ad.descriptions] if row.ad_group_ad.ad.responsive_search_ad.descriptions else []
            ads.append({
                "id": str(row.ad_group_ad.ad.id),
                "type": row.ad_group_ad.ad.type_.name,
                "status": row.ad_group_ad.status.name,
                "headlines": headlines,
                "descriptions": descriptions,
                "urls": list(row.ad_group_ad.ad.final_urls),
                "ad_group": row.ad_group.name,
                "campaign": row.campaign.name,
            })
        return ads
    except Exception as e:
        print(f"Erreur : {e}")
        return []


def update_ad_status(ad_group_id, ad_id, new_status, customer_id=None):
    """Met à jour le statut d'une annonce (ENABLED, PAUSED, REMOVED)."""
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()
    ad_group_ad_service = client.get_service("AdGroupAdService")

    operation = client.get_type("AdGroupAdOperation")
    ad_group_ad = operation.update
    ad_group_ad.resource_name = ad_group_ad_service.ad_group_ad_path(
        customer_id, ad_group_id, ad_id
    )

    status_map = {
        "ENABLED": client.enums.AdGroupAdStatusEnum.ENABLED,
        "PAUSED": client.enums.AdGroupAdStatusEnum.PAUSED,
        "REMOVED": client.enums.AdGroupAdStatusEnum.REMOVED,
    }
    ad_group_ad.status = status_map.get(new_status, client.enums.AdGroupAdStatusEnum.PAUSED)

    client.copy_from(
        operation.update_mask,
        client.get_type("FieldMask")(paths=["status"]),
    )

    try:
        ad_group_ad_service.mutate_ad_group_ads(
            customer_id=customer_id,
            operations=[operation],
        )
        return True
    except Exception as e:
        print(f"Erreur : {e}")
        return False
