"""
Agent CLI interactif pour Google Ads.
Interface en français avec Rich pour un affichage soigné.
"""

import sys
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt

from accounts import list_accessible_accounts, get_account_info
from campaigns import list_campaigns, create_campaign, update_campaign_status
from keywords import list_ad_groups, list_keywords, create_ad_group, add_keywords, add_negative_keywords
from ads import list_ads, create_responsive_search_ad, update_ad_status
from analytics import get_account_stats, get_campaign_stats, get_daily_stats, get_keyword_stats
from config import CUSTOMER_ID

console = Console()
current_customer_id = CUSTOMER_ID


def show_help():
    help_table = Table(title="Commandes disponibles", show_header=True, header_style="bold cyan")
    help_table.add_column("Commande", style="bold")
    help_table.add_column("Description")

    commands = [
        ("compte", "Infos du compte actif"),
        ("comptes", "Lister tous les comptes accessibles"),
        ("choisir <id>", "Changer de compte actif"),
        ("campagnes", "Lister les campagnes"),
        ("créer campagne", "Créer une nouvelle campagne"),
        ("pause <id>", "Mettre en pause une campagne"),
        ("activer <id>", "Activer une campagne"),
        ("supprimer <id>", "Supprimer une campagne"),
        ("groupes [campaign_id]", "Lister les groupes d'annonces"),
        ("créer groupe", "Créer un groupe d'annonces"),
        ("mots-clés [ad_group_id]", "Lister les mots-clés"),
        ("ajouter mots-clés", "Ajouter des mots-clés"),
        ("annonces [campaign_id]", "Lister les annonces"),
        ("créer annonce", "Créer une annonce responsive Search"),
        ("stats", "Stats du compte (30 jours)"),
        ("stats 7", "Stats du compte (7 jours)"),
        ("stats campagnes", "Stats par campagne"),
        ("stats jour <campaign_id>", "Stats jour par jour"),
        ("stats mots-clés [campaign_id]", "Stats par mot-clé"),
        ("aide", "Afficher cette aide"),
        ("quitter", "Quitter l'agent"),
    ]
    for cmd, desc in commands:
        help_table.add_row(cmd, desc)

    console.print(help_table)


def show_account_info():
    info = get_account_info(current_customer_id)
    if info:
        panel = Panel(
            f"[bold]ID :[/bold] {info['id']}\n"
            f"[bold]Nom :[/bold] {info['name']}\n"
            f"[bold]Devise :[/bold] {info['currency']}\n"
            f"[bold]Fuseau :[/bold] {info['timezone']}\n"
            f"[bold]Manager :[/bold] {'Oui' if info['is_manager'] else 'Non'}\n"
            f"[bold]Auto-tagging :[/bold] {'Oui' if info['auto_tagging'] else 'Non'}",
            title="Compte actif",
            border_style="green",
        )
        console.print(panel)
    else:
        console.print("[red]Impossible de récupérer les infos du compte.[/red]")


def show_accounts():
    accounts = list_accessible_accounts()
    if not accounts:
        console.print("[yellow]Aucun compte trouvé.[/yellow]")
        return

    table = Table(title="Comptes accessibles", show_header=True, header_style="bold cyan")
    table.add_column("#", style="dim")
    table.add_column("ID")
    table.add_column("Nom")
    table.add_column("Devise")
    table.add_column("Manager")

    for i, acc in enumerate(accounts, 1):
        table.add_row(
            str(i), acc["id"], acc["name"], acc["currency"],
            "Oui" if acc["is_manager"] else "Non"
        )
    console.print(table)


def show_campaigns():
    campaigns = list_campaigns(current_customer_id)
    if not campaigns:
        console.print("[yellow]Aucune campagne trouvée.[/yellow]")
        return

    table = Table(title="Campagnes", show_header=True, header_style="bold cyan")
    table.add_column("ID")
    table.add_column("Nom")
    table.add_column("Type")
    table.add_column("Statut")
    table.add_column("Budget/jour")

    for c in campaigns:
        status_style = "green" if c["status"] == "ACTIVÉE" else "yellow" if c["status"] == "EN PAUSE" else "red"
        table.add_row(c["id"], c["name"], c["type"], f"[{status_style}]{c['status']}[/{status_style}]", c["budget_daily"])
    console.print(table)


def wizard_create_campaign():
    console.print("\n[bold cyan]--- Création de campagne ---[/bold cyan]")
    name = Prompt.ask("Nom de la campagne")
    campaign_type = Prompt.ask("Type", choices=["SEARCH", "DISPLAY", "PERFORMANCE_MAX", "VIDEO", "DEMAND_GEN"], default="SEARCH")
    budget = float(Prompt.ask("Budget journalier (€)", default="10"))

    result = create_campaign(name, budget, campaign_type, "PAUSED", current_customer_id)
    if result:
        console.print(f"\n[green]Campagne créée ![/green]")
        console.print(f"  ID : {result['id']}")
        console.print(f"  Nom : {result['name']}")
        console.print(f"  Type : {result['type']}")
        console.print(f"  Budget : {result['budget']}")
        console.print(f"  Statut : EN PAUSE (à activer manuellement)")
    else:
        console.print("[red]Échec de la création.[/red]")


def show_ad_groups(campaign_id=None):
    groups = list_ad_groups(campaign_id, current_customer_id)
    if not groups:
        console.print("[yellow]Aucun groupe d'annonces trouvé.[/yellow]")
        return

    table = Table(title="Groupes d'annonces", show_header=True, header_style="bold cyan")
    table.add_column("ID")
    table.add_column("Nom")
    table.add_column("Campagne")
    table.add_column("Statut")
    table.add_column("CPC max")

    for g in groups:
        table.add_row(g["id"], g["name"], g["campaign"], g["status"], g["cpc_bid"])
    console.print(table)


def wizard_create_ad_group():
    console.print("\n[bold cyan]--- Création de groupe d'annonces ---[/bold cyan]")
    campaign_id = Prompt.ask("ID de la campagne")
    name = Prompt.ask("Nom du groupe")
    cpc = Prompt.ask("CPC max en € (laisser vide pour auto)", default="")
    cpc_bid = float(cpc) if cpc else None

    result = create_ad_group(campaign_id, name, cpc_bid, current_customer_id)
    if result:
        console.print(f"[green]Groupe créé ! ID : {result['id']}[/green]")
    else:
        console.print("[red]Échec de la création.[/red]")


def show_keywords(ad_group_id=None):
    keywords = list_keywords(ad_group_id, current_customer_id)
    if not keywords:
        console.print("[yellow]Aucun mot-clé trouvé.[/yellow]")
        return

    table = Table(title="Mots-clés", show_header=True, header_style="bold cyan")
    table.add_column("ID")
    table.add_column("Mot-clé")
    table.add_column("Type")
    table.add_column("Statut")
    table.add_column("Groupe")

    for k in keywords:
        table.add_row(k["id"], k["text"], k["match_type"], k["status"], k["ad_group"])
    console.print(table)


def wizard_add_keywords():
    console.print("\n[bold cyan]--- Ajout de mots-clés ---[/bold cyan]")
    ad_group_id = Prompt.ask("ID du groupe d'annonces")
    match_type = Prompt.ask("Type de correspondance", choices=["BROAD", "PHRASE", "EXACT"], default="BROAD")
    kw_input = Prompt.ask("Mots-clés (séparés par des virgules)")
    keywords = [k.strip() for k in kw_input.split(",") if k.strip()]

    results = add_keywords(ad_group_id, keywords, match_type, current_customer_id)
    if results:
        console.print(f"[green]{len(results)} mot(s)-clé(s) ajouté(s) ![/green]")
    else:
        console.print("[red]Échec de l'ajout.[/red]")


def show_ads(campaign_id=None):
    ads_list = list_ads(campaign_id, customer_id=current_customer_id)
    if not ads_list:
        console.print("[yellow]Aucune annonce trouvée.[/yellow]")
        return

    table = Table(title="Annonces", show_header=True, header_style="bold cyan")
    table.add_column("ID")
    table.add_column("Type")
    table.add_column("Statut")
    table.add_column("Titres")
    table.add_column("Groupe")
    table.add_column("Campagne")

    for ad in ads_list:
        headlines_str = " | ".join(ad["headlines"][:3]) if ad["headlines"] else "-"
        table.add_row(ad["id"], ad["type"], ad["status"], headlines_str, ad["ad_group"], ad["campaign"])
    console.print(table)


def wizard_create_ad():
    console.print("\n[bold cyan]--- Création d'annonce responsive Search ---[/bold cyan]")
    ad_group_id = Prompt.ask("ID du groupe d'annonces")
    url = Prompt.ask("URL de destination")

    console.print("[dim]Entrez au moins 3 titres (max 30 caractères chacun). Tapez 'fin' pour terminer.[/dim]")
    headlines = []
    while len(headlines) < 15:
        h = Prompt.ask(f"Titre {len(headlines)+1}")
        if h.lower() == "fin" and len(headlines) >= 3:
            break
        if h.lower() == "fin":
            console.print("[yellow]Il faut au moins 3 titres.[/yellow]")
            continue
        headlines.append(h)

    console.print("[dim]Entrez au moins 2 descriptions (max 90 caractères chacune). Tapez 'fin' pour terminer.[/dim]")
    descriptions = []
    while len(descriptions) < 4:
        d = Prompt.ask(f"Description {len(descriptions)+1}")
        if d.lower() == "fin" and len(descriptions) >= 2:
            break
        if d.lower() == "fin":
            console.print("[yellow]Il faut au moins 2 descriptions.[/yellow]")
            continue
        descriptions.append(d)

    result = create_responsive_search_ad(ad_group_id, headlines, descriptions, url, current_customer_id)
    if result:
        console.print(f"[green]Annonce créée ![/green]")
    else:
        console.print("[red]Échec de la création.[/red]")


def show_stats(days=30):
    stats = get_account_stats(days, current_customer_id)
    if not stats:
        console.print("[yellow]Aucune donnée trouvée.[/yellow]")
        return

    panel = Panel(
        f"[bold]Période :[/bold] {stats['period']}\n"
        f"[bold]Dépenses :[/bold] {stats['cost']}\n"
        f"[bold]Impressions :[/bold] {stats['impressions']:,}\n"
        f"[bold]Clics :[/bold] {stats['clicks']:,}\n"
        f"[bold]CTR :[/bold] {stats['ctr']}\n"
        f"[bold]CPC moyen :[/bold] {stats['avg_cpc']}\n"
        f"[bold]Conversions :[/bold] {stats['conversions']}\n"
        f"[bold]Coût/conversion :[/bold] {stats['cost_per_conversion']}\n"
        f"[bold]Taux conversion :[/bold] {stats['conversion_rate']}",
        title="Statistiques du compte",
        border_style="blue",
    )
    console.print(panel)


def show_campaign_stats(days=30):
    stats = get_campaign_stats(days=days, customer_id=current_customer_id)
    if not stats:
        console.print("[yellow]Aucune donnée trouvée.[/yellow]")
        return

    table = Table(title=f"Stats campagnes ({days} jours)", show_header=True, header_style="bold cyan")
    table.add_column("Campagne")
    table.add_column("Statut")
    table.add_column("Dépenses")
    table.add_column("Impressions")
    table.add_column("Clics")
    table.add_column("CTR")
    table.add_column("CPC moy.")
    table.add_column("Conv.")

    for s in stats:
        table.add_row(s["name"], s["status"], s["cost"], str(s["impressions"]), str(s["clicks"]), s["ctr"], s["avg_cpc"], s["conversions"])
    console.print(table)


def show_daily_stats(campaign_id, days=30):
    daily = get_daily_stats(campaign_id, days, current_customer_id)
    if not daily:
        console.print("[yellow]Aucune donnée trouvée.[/yellow]")
        return

    table = Table(title=f"Stats quotidiennes — Campagne {campaign_id}", show_header=True, header_style="bold cyan")
    table.add_column("Date")
    table.add_column("Dépenses")
    table.add_column("Impressions")
    table.add_column("Clics")
    table.add_column("CTR")
    table.add_column("CPC moy.")
    table.add_column("Conv.")

    for d in daily:
        table.add_row(d["date"], d["cost"], str(d["impressions"]), str(d["clicks"]), d["ctr"], d["avg_cpc"], d["conversions"])
    console.print(table)


def show_keyword_stats(campaign_id=None, days=30):
    keywords = get_keyword_stats(campaign_id, days, current_customer_id)
    if not keywords:
        console.print("[yellow]Aucune donnée trouvée.[/yellow]")
        return

    table = Table(title="Stats mots-clés (top 50)", show_header=True, header_style="bold cyan")
    table.add_column("Mot-clé")
    table.add_column("Type")
    table.add_column("Impressions")
    table.add_column("Clics")
    table.add_column("CTR")
    table.add_column("CPC moy.")
    table.add_column("Dépenses")
    table.add_column("Conv.")

    for k in keywords:
        table.add_row(k["keyword"], k["match_type"], str(k["impressions"]), str(k["clicks"]), k["ctr"], k["avg_cpc"], k["cost"], k["conversions"])
    console.print(table)


def main():
    global current_customer_id

    console.print(Panel(
        "[bold green]Google Ads Agent[/bold green]\n"
        f"Compte actif : {current_customer_id}\n"
        "Tapez [bold]aide[/bold] pour voir les commandes.",
        border_style="green",
    ))

    while True:
        try:
            command = Prompt.ask("\n[bold blue]google-ads[/bold blue]").strip().lower()
        except (KeyboardInterrupt, EOFError):
            console.print("\n[dim]Au revoir ![/dim]")
            break

        if not command:
            continue

        # Compte
        elif command == "compte":
            show_account_info()

        elif command == "comptes":
            show_accounts()

        elif command.startswith("choisir "):
            new_id = command.replace("choisir ", "").strip().replace("-", "")
            current_customer_id = new_id
            console.print(f"[green]Compte actif changé : {new_id}[/green]")

        # Campagnes
        elif command == "campagnes":
            show_campaigns()

        elif command in ("créer campagne", "creer campagne"):
            wizard_create_campaign()

        elif command.startswith("pause "):
            cid = command.replace("pause ", "").strip()
            if update_campaign_status(cid, "PAUSED", current_customer_id):
                console.print(f"[green]Campagne {cid} mise en pause.[/green]")

        elif command.startswith("activer "):
            cid = command.replace("activer ", "").strip()
            if update_campaign_status(cid, "ENABLED", current_customer_id):
                console.print(f"[green]Campagne {cid} activée.[/green]")

        elif command.startswith("supprimer "):
            cid = command.replace("supprimer ", "").strip()
            confirm = Prompt.ask(f"Confirmer la suppression de la campagne {cid} ?", choices=["oui", "non"], default="non")
            if confirm == "oui":
                if update_campaign_status(cid, "REMOVED", current_customer_id):
                    console.print(f"[green]Campagne {cid} supprimée.[/green]")

        # Groupes d'annonces
        elif command == "groupes":
            show_ad_groups()

        elif command.startswith("groupes "):
            cid = command.replace("groupes ", "").strip()
            show_ad_groups(cid)

        elif command in ("créer groupe", "creer groupe"):
            wizard_create_ad_group()

        # Mots-clés
        elif command in ("mots-clés", "mots-cles"):
            show_keywords()

        elif command.startswith("mots-clés ") or command.startswith("mots-cles "):
            ag_id = command.split(" ", 1)[1].strip()
            show_keywords(ag_id)

        elif command in ("ajouter mots-clés", "ajouter mots-cles"):
            wizard_add_keywords()

        # Annonces
        elif command == "annonces":
            show_ads()

        elif command.startswith("annonces "):
            cid = command.replace("annonces ", "").strip()
            show_ads(cid)

        elif command in ("créer annonce", "creer annonce"):
            wizard_create_ad()

        # Stats
        elif command == "stats":
            show_stats(30)

        elif command == "stats 7":
            show_stats(7)

        elif command == "stats 14":
            show_stats(14)

        elif command == "stats campagnes":
            show_campaign_stats()

        elif command.startswith("stats jour "):
            cid = command.replace("stats jour ", "").strip()
            show_daily_stats(cid)

        elif command in ("stats mots-clés", "stats mots-cles"):
            show_keyword_stats()

        elif command.startswith("stats mots-clés ") or command.startswith("stats mots-cles "):
            cid = command.split(" ", 2)[2].strip()
            show_keyword_stats(cid)

        # Aide / Quitter
        elif command == "aide":
            show_help()

        elif command in ("quitter", "exit", "quit", "q"):
            console.print("[dim]Au revoir ![/dim]")
            break

        else:
            console.print(f"[yellow]Commande inconnue : {command}. Tapez 'aide' pour voir les commandes.[/yellow]")


if __name__ == "__main__":
    main()
