"""Module d'analytics et rapports Meta Ads."""

from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign


def get_account_insights(account_id: str, date_preset: str = "last_30d"):
    """Récupère les insights globaux d'un compte pub."""
    account = AdAccount(account_id)
    insights = account.get_insights(fields=[
        "impressions",
        "clicks",
        "spend",
        "cpc",
        "cpm",
        "ctr",
        "reach",
        "frequency",
        "actions",
        "cost_per_action_type",
    ], params={
        "date_preset": date_preset,
    })
    return [dict(i) for i in insights]


def get_campaign_insights(campaign_id: str, date_preset: str = "last_30d"):
    """Récupère les insights d'une campagne spécifique."""
    campaign = Campaign(campaign_id)
    insights = campaign.get_insights(fields=[
        "campaign_name",
        "impressions",
        "clicks",
        "spend",
        "cpc",
        "cpm",
        "ctr",
        "reach",
        "frequency",
        "actions",
        "cost_per_action_type",
        "conversions",
        "conversion_values",
    ], params={
        "date_preset": date_preset,
    })
    return [dict(i) for i in insights]


def get_campaign_insights_by_day(campaign_id: str, date_preset: str = "last_7d"):
    """Récupère les insights jour par jour."""
    campaign = Campaign(campaign_id)
    insights = campaign.get_insights(fields=[
        "campaign_name",
        "impressions",
        "clicks",
        "spend",
        "cpc",
        "ctr",
        "reach",
    ], params={
        "date_preset": date_preset,
        "time_increment": 1,
    })
    return [dict(i) for i in insights]


def get_all_campaigns_performance(account_id: str, date_preset: str = "last_30d"):
    """Récupère les performances de toutes les campagnes d'un compte."""
    account = AdAccount(account_id)
    insights = account.get_insights(fields=[
        "campaign_id",
        "campaign_name",
        "impressions",
        "clicks",
        "spend",
        "cpc",
        "cpm",
        "ctr",
        "reach",
        "actions",
    ], params={
        "date_preset": date_preset,
        "level": "campaign",
    })
    return [dict(i) for i in insights]
