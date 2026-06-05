"""
Analytics et rapports Google Ads.
"""

from config import get_client, CUSTOMER_ID


def get_account_stats(days=30, customer_id=None):
    """Récupère les stats globales du compte sur les X derniers jours."""
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()
    service = client.get_service("GoogleAdsService")

    query = f"""
        SELECT
            metrics.impressions,
            metrics.clicks,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions,
            metrics.cost_per_conversion,
            metrics.conversions_from_interactions_rate
        FROM customer
        WHERE segments.date DURING LAST_{days}_DAYS
    """
    # GAQL ne supporte que certaines valeurs
    if days == 30:
        date_range = "LAST_30_DAYS"
    elif days == 7:
        date_range = "LAST_7_DAYS"
    elif days == 14:
        date_range = "LAST_14_DAYS"
    else:
        date_range = "LAST_30_DAYS"

    query = f"""
        SELECT
            metrics.impressions,
            metrics.clicks,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions,
            metrics.cost_per_conversion,
            metrics.conversions_from_interactions_rate
        FROM customer
        WHERE segments.date DURING {date_range}
    """

    try:
        response = service.search(customer_id=customer_id, query=query)
        for row in response:
            cost = row.metrics.cost_micros / 1_000_000
            avg_cpc = row.metrics.average_cpc / 1_000_000
            cost_per_conv = row.metrics.cost_per_conversion / 1_000_000 if row.metrics.cost_per_conversion else 0
            return {
                "period": f"{days} derniers jours",
                "impressions": row.metrics.impressions,
                "clicks": row.metrics.clicks,
                "ctr": f"{row.metrics.ctr * 100:.2f}%",
                "avg_cpc": f"{avg_cpc:.2f}€",
                "cost": f"{cost:.2f}€",
                "conversions": f"{row.metrics.conversions:.1f}",
                "cost_per_conversion": f"{cost_per_conv:.2f}€",
                "conversion_rate": f"{row.metrics.conversions_from_interactions_rate * 100:.2f}%",
            }
        return None
    except Exception as e:
        print(f"Erreur : {e}")
        return None


def get_campaign_stats(campaign_id=None, days=30, customer_id=None):
    """Récupère les stats par campagne."""
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()
    service = client.get_service("GoogleAdsService")

    if days == 7:
        date_range = "LAST_7_DAYS"
    elif days == 14:
        date_range = "LAST_14_DAYS"
    else:
        date_range = "LAST_30_DAYS"

    query = f"""
        SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            metrics.impressions,
            metrics.clicks,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions,
            metrics.cost_per_conversion
        FROM campaign
        WHERE segments.date DURING {date_range}
            AND campaign.status != 'REMOVED'
    """
    if campaign_id:
        query += f" AND campaign.id = {campaign_id}"

    query += " ORDER BY metrics.cost_micros DESC"

    try:
        response = service.search(customer_id=customer_id, query=query)
        stats = []
        for row in response:
            cost = row.metrics.cost_micros / 1_000_000
            avg_cpc = row.metrics.average_cpc / 1_000_000
            cost_per_conv = row.metrics.cost_per_conversion / 1_000_000 if row.metrics.cost_per_conversion else 0
            stats.append({
                "id": str(row.campaign.id),
                "name": row.campaign.name,
                "status": row.campaign.status.name,
                "impressions": row.metrics.impressions,
                "clicks": row.metrics.clicks,
                "ctr": f"{row.metrics.ctr * 100:.2f}%",
                "avg_cpc": f"{avg_cpc:.2f}€",
                "cost": f"{cost:.2f}€",
                "conversions": f"{row.metrics.conversions:.1f}",
                "cost_per_conversion": f"{cost_per_conv:.2f}€",
            })
        return stats
    except Exception as e:
        print(f"Erreur : {e}")
        return []


def get_daily_stats(campaign_id, days=30, customer_id=None):
    """Récupère les stats jour par jour pour une campagne."""
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()
    service = client.get_service("GoogleAdsService")

    if days == 7:
        date_range = "LAST_7_DAYS"
    elif days == 14:
        date_range = "LAST_14_DAYS"
    else:
        date_range = "LAST_30_DAYS"

    query = f"""
        SELECT
            segments.date,
            metrics.impressions,
            metrics.clicks,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions
        FROM campaign
        WHERE campaign.id = {campaign_id}
            AND segments.date DURING {date_range}
        ORDER BY segments.date DESC
    """

    try:
        response = service.search(customer_id=customer_id, query=query)
        daily = []
        for row in response:
            cost = row.metrics.cost_micros / 1_000_000
            avg_cpc = row.metrics.average_cpc / 1_000_000
            daily.append({
                "date": row.segments.date,
                "impressions": row.metrics.impressions,
                "clicks": row.metrics.clicks,
                "ctr": f"{row.metrics.ctr * 100:.2f}%",
                "avg_cpc": f"{avg_cpc:.2f}€",
                "cost": f"{cost:.2f}€",
                "conversions": f"{row.metrics.conversions:.1f}",
            })
        return daily
    except Exception as e:
        print(f"Erreur : {e}")
        return []


def get_keyword_stats(campaign_id=None, days=30, customer_id=None):
    """Récupère les stats par mot-clé."""
    customer_id = customer_id or CUSTOMER_ID
    client = get_client()
    service = client.get_service("GoogleAdsService")

    if days == 7:
        date_range = "LAST_7_DAYS"
    elif days == 14:
        date_range = "LAST_14_DAYS"
    else:
        date_range = "LAST_30_DAYS"

    query = f"""
        SELECT
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            ad_group.name,
            campaign.name,
            metrics.impressions,
            metrics.clicks,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions
        FROM keyword_view
        WHERE segments.date DURING {date_range}
    """
    if campaign_id:
        query += f" AND campaign.id = {campaign_id}"

    query += " ORDER BY metrics.impressions DESC LIMIT 50"

    try:
        response = service.search(customer_id=customer_id, query=query)
        keywords = []
        for row in response:
            cost = row.metrics.cost_micros / 1_000_000
            avg_cpc = row.metrics.average_cpc / 1_000_000
            keywords.append({
                "keyword": row.ad_group_criterion.keyword.text,
                "match_type": row.ad_group_criterion.keyword.match_type.name,
                "ad_group": row.ad_group.name,
                "campaign": row.campaign.name,
                "impressions": row.metrics.impressions,
                "clicks": row.metrics.clicks,
                "ctr": f"{row.metrics.ctr * 100:.2f}%",
                "avg_cpc": f"{avg_cpc:.2f}€",
                "cost": f"{cost:.2f}€",
                "conversions": f"{row.metrics.conversions:.1f}",
            })
        return keywords
    except Exception as e:
        print(f"Erreur : {e}")
        return []
