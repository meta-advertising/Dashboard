#!/usr/bin/env python3
"""Meta Ads Agent — Gère tes campagnes Meta Ads en langage naturel."""

import sys
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt

from config import init_api
from accounts import list_ad_accounts, get_account
from campaigns import (
    list_campaigns, create_campaign, pause_campaign,
    activate_campaign, delete_campaign,
)
from analytics import (
    get_account_insights, get_campaign_insights,
    get_all_campaigns_performance, get_campaign_insights_by_day,
)
from audiences import list_audiences, get_audience_details

console = Console()

# Contexte de session
session = {
    "current_account": None,
    "current_account_name": None,
}


def show_welcome():
    console.print(Panel.fit(
        "[bold cyan]🚀 Meta Ads Agent[/bold cyan]\n"
        "Gère tes campagnes Meta Ads en langage naturel.\n"
        "Tape [bold]aide[/bold] pour voir les commandes.",
        border_style="cyan",
    ))


def show_help():
    table = Table(title="Commandes disponibles", border_style="cyan")
    table.add_column("Commande", style="bold green")
    table.add_column("Description")

    commands = [
        ("comptes", "Lister tous les comptes pub"),
        ("choisir <num>", "Sélectionner un compte pub"),
        ("campagnes", "Lister les campagnes du compte actif"),
        ("stats", "Voir les stats globales du compte (30 jours)"),
        ("stats campagnes", "Performances de toutes les campagnes"),
        ("stats <campaign_id>", "Stats d'une campagne spécifique"),
        ("stats jour <campaign_id>", "Stats jour par jour d'une campagne"),
        ("créer campagne", "Créer une nouvelle campagne (assistant guidé)"),
        ("pause <campaign_id>", "Mettre en pause une campagne"),
        ("activer <campaign_id>", "Activer une campagne"),
        ("supprimer <campaign_id>", "Supprimer une campagne"),
        ("audiences", "Lister les audiences personnalisées"),
        ("aide", "Afficher cette aide"),
        ("quitter", "Quitter l'agent"),
    ]
    for cmd, desc in commands:
        table.add_row(cmd, desc)
    console.print(table)


def show_accounts():
    with console.status("Récupération des comptes pub..."):
        accounts = list_ad_accounts()
    if not accounts:
        console.print("[red]Aucun compte pub trouvé.[/red]")
        return []

    table = Table(title="Comptes publicitaires", border_style="cyan")
    table.add_column("#", style="bold")
    table.add_column("Nom", style="green")
    table.add_column("ID")
    table.add_column("Statut")
    table.add_column("Devise")

    for i, acc in enumerate(accounts, 1):
        table.add_row(
            str(i), acc["name"], acc["id"],
            acc["status"], acc["currency"],
        )
    console.print(table)
    return accounts


def select_account(accounts, choice):
    try:
        idx = int(choice) - 1
        if 0 <= idx < len(accounts):
            acc = accounts[idx]
            session["current_account"] = acc["id"]
            session["current_account_name"] = acc["name"]
            console.print(
                f"[green]✅ Compte sélectionné : {acc['name']} ({acc['id']})[/green]"
            )
        else:
            console.print("[red]Numéro invalide.[/red]")
    except ValueError:
        console.print("[red]Entre un numéro valide.[/red]")


def require_account():
    if not session["current_account"]:
        console.print(
            "[yellow]⚠️  Sélectionne d'abord un compte avec 'comptes' puis 'choisir <num>'[/yellow]"
        )
        return False
    return True


def show_campaigns():
    if not require_account():
        return
    with console.status("Récupération des campagnes..."):
        camps = list_campaigns(session["current_account"])
    if not camps:
        console.print("[yellow]Aucune campagne trouvée.[/yellow]")
        return

    table = Table(
        title=f"Campagnes — {session['current_account_name']}",
        border_style="cyan",
    )
    table.add_column("ID", style="dim")
    table.add_column("Nom", style="green")
    table.add_column("Statut")
    table.add_column("Objectif")
    table.add_column("Budget/jour")

    for c in camps:
        status_color = "green" if c["status"] == "ACTIVE" else "red"
        budget = c.get("daily_budget")
        budget_str = f"{int(budget)/100:.2f}€" if budget else "N/A"
        table.add_row(
            c["id"], c["name"],
            f"[{status_color}]{c['status']}[/{status_color}]",
            c["objective"], budget_str,
        )
    console.print(table)


def show_account_stats(date_preset="last_30d"):
    if not require_account():
        return
    with console.status("Récupération des statistiques..."):
        insights = get_account_insights(session["current_account"], date_preset)
    if not insights:
        console.print("[yellow]Aucune donnée disponible.[/yellow]")
        return

    data = insights[0]
    table = Table(
        title=f"Stats globales — {session['current_account_name']} ({date_preset})",
        border_style="cyan",
    )
    table.add_column("Métrique", style="bold")
    table.add_column("Valeur", style="green")

    metrics = [
        ("Dépenses", f"{float(data.get('spend', 0)):.2f}€"),
        ("Impressions", data.get("impressions", "0")),
        ("Portée", data.get("reach", "0")),
        ("Clics", data.get("clicks", "0")),
        ("CTR", f"{float(data.get('ctr', 0)):.2f}%"),
        ("CPC", f"{float(data.get('cpc', 0)):.2f}€"),
        ("CPM", f"{float(data.get('cpm', 0)):.2f}€"),
        ("Fréquence", f"{float(data.get('frequency', 0)):.2f}"),
    ]
    for name, value in metrics:
        table.add_row(name, value)

    # Actions (conversions, leads, etc.)
    actions = data.get("actions", [])
    if actions:
        table.add_row("", "")
        table.add_row("[bold cyan]Actions[/bold cyan]", "")
        for action in actions:
            table.add_row(f"  {action['action_type']}", action["value"])

    console.print(table)


def show_all_campaigns_stats():
    if not require_account():
        return
    with console.status("Récupération des performances..."):
        insights = get_all_campaigns_performance(session["current_account"])
    if not insights:
        console.print("[yellow]Aucune donnée disponible.[/yellow]")
        return

    table = Table(
        title=f"Performances campagnes — {session['current_account_name']}",
        border_style="cyan",
    )
    table.add_column("Campagne", style="green")
    table.add_column("Dépenses")
    table.add_column("Impressions")
    table.add_column("Clics")
    table.add_column("CTR")
    table.add_column("CPC")

    for i in insights:
        table.add_row(
            i.get("campaign_name", "N/A"),
            f"{float(i.get('spend', 0)):.2f}€",
            i.get("impressions", "0"),
            i.get("clicks", "0"),
            f"{float(i.get('ctr', 0)):.2f}%",
            f"{float(i.get('cpc', 0)):.2f}€",
        )
    console.print(table)


def show_campaign_stats(campaign_id, by_day=False):
    with console.status("Récupération des insights..."):
        if by_day:
            insights = get_campaign_insights_by_day(campaign_id)
        else:
            insights = get_campaign_insights(campaign_id)
    if not insights:
        console.print("[yellow]Aucune donnée disponible.[/yellow]")
        return

    if by_day:
        table = Table(title=f"Stats jour par jour — {campaign_id}", border_style="cyan")
        table.add_column("Date")
        table.add_column("Dépenses")
        table.add_column("Impressions")
        table.add_column("Clics")
        table.add_column("CTR")
        for i in insights:
            table.add_row(
                i.get("date_start", ""),
                f"{float(i.get('spend', 0)):.2f}€",
                i.get("impressions", "0"),
                i.get("clicks", "0"),
                f"{float(i.get('ctr', 0)):.2f}%",
            )
    else:
        data = insights[0]
        table = Table(title=f"Stats — {data.get('campaign_name', campaign_id)}", border_style="cyan")
        table.add_column("Métrique", style="bold")
        table.add_column("Valeur", style="green")
        metrics = [
            ("Dépenses", f"{float(data.get('spend', 0)):.2f}€"),
            ("Impressions", data.get("impressions", "0")),
            ("Portée", data.get("reach", "0")),
            ("Clics", data.get("clicks", "0")),
            ("CTR", f"{float(data.get('ctr', 0)):.2f}%"),
            ("CPC", f"{float(data.get('cpc', 0)):.2f}€"),
            ("CPM", f"{float(data.get('cpm', 0)):.2f}€"),
        ]
        for name, value in metrics:
            table.add_row(name, value)
    console.print(table)


def create_campaign_wizard():
    if not require_account():
        return
    console.print(Panel("[bold]Assistant création de campagne[/bold]", border_style="green"))

    name = Prompt.ask("Nom de la campagne")
    objectives = [
        "OUTCOME_AWARENESS", "OUTCOME_ENGAGEMENT", "OUTCOME_LEADS",
        "OUTCOME_SALES", "OUTCOME_TRAFFIC", "OUTCOME_APP_PROMOTION",
    ]
    console.print("Objectifs disponibles :")
    for i, obj in enumerate(objectives, 1):
        console.print(f"  {i}. {obj}")
    obj_choice = Prompt.ask("Choisis un objectif (numéro)")
    try:
        objective = objectives[int(obj_choice) - 1]
    except (ValueError, IndexError):
        console.print("[red]Choix invalide.[/red]")
        return

    budget_input = Prompt.ask("Budget journalier en € (laisser vide pour aucun)", default="")
    daily_budget = None
    if budget_input:
        daily_budget = int(float(budget_input) * 100)  # centimes

    console.print(f"\n[bold]Résumé :[/bold]")
    console.print(f"  Nom : {name}")
    console.print(f"  Objectif : {objective}")
    console.print(f"  Budget/jour : {budget_input}€" if budget_input else "  Budget/jour : Non défini")
    console.print(f"  Statut : PAUSED (en pause par défaut)")

    confirm = Prompt.ask("Confirmer la création ? (oui/non)")
    if confirm.lower() in ("oui", "o", "yes", "y"):
        with console.status("Création de la campagne..."):
            campaign = create_campaign(
                session["current_account"], name, objective, daily_budget,
            )
        console.print(f"[green]✅ Campagne créée ! ID : {campaign['id']}[/green]")
    else:
        console.print("[yellow]Création annulée.[/yellow]")


def show_audiences():
    if not require_account():
        return
    with console.status("Récupération des audiences..."):
        auds = list_audiences(session["current_account"])
    if not auds:
        console.print("[yellow]Aucune audience trouvée.[/yellow]")
        return

    table = Table(title=f"Audiences — {session['current_account_name']}", border_style="cyan")
    table.add_column("ID", style="dim")
    table.add_column("Nom", style="green")
    table.add_column("Type")
    table.add_column("Taille")

    for a in auds:
        table.add_row(a["id"], a["name"], a["type"], str(a["taille"]))
    console.print(table)


def process_command(cmd: str, accounts: list):
    cmd = cmd.strip().lower()

    if cmd in ("aide", "help", "?"):
        show_help()
    elif cmd in ("comptes", "accounts"):
        accounts[:] = show_accounts()
    elif cmd.startswith("choisir "):
        select_account(accounts, cmd.split(" ", 1)[1])
    elif cmd in ("campagnes", "campaigns"):
        show_campaigns()
    elif cmd == "stats":
        show_account_stats()
    elif cmd == "stats campagnes":
        show_all_campaigns_stats()
    elif cmd.startswith("stats jour "):
        show_campaign_stats(cmd.split(" ", 2)[2], by_day=True)
    elif cmd.startswith("stats "):
        show_campaign_stats(cmd.split(" ", 1)[1])
    elif cmd in ("créer campagne", "creer campagne", "nouvelle campagne"):
        create_campaign_wizard()
    elif cmd.startswith("pause "):
        cid = cmd.split(" ", 1)[1]
        with console.status("Mise en pause..."):
            pause_campaign(cid)
        console.print(f"[green]✅ Campagne {cid} mise en pause.[/green]")
    elif cmd.startswith("activer "):
        cid = cmd.split(" ", 1)[1]
        with console.status("Activation..."):
            activate_campaign(cid)
        console.print(f"[green]✅ Campagne {cid} activée.[/green]")
    elif cmd.startswith("supprimer "):
        cid = cmd.split(" ", 1)[1]
        confirm = Prompt.ask(f"Supprimer la campagne {cid} ? (oui/non)")
        if confirm.lower() in ("oui", "o"):
            with console.status("Suppression..."):
                delete_campaign(cid)
            console.print(f"[green]✅ Campagne {cid} supprimée.[/green]")
    elif cmd in ("audiences", "audience"):
        show_audiences()
    elif cmd in ("quitter", "quit", "exit", "q"):
        console.print("[cyan]À bientôt ! 👋[/cyan]")
        sys.exit(0)
    else:
        console.print(
            "[yellow]Commande non reconnue. Tape 'aide' pour voir les commandes.[/yellow]"
        )


def main():
    try:
        init_api()
    except Exception as e:
        console.print(f"[red]Erreur de connexion : {e}[/red]")
        sys.exit(1)

    show_welcome()
    accounts = []

    # Charger les comptes au démarrage
    accounts = show_accounts()

    while True:
        try:
            account_info = ""
            if session["current_account"]:
                account_info = f" [{session['current_account_name']}]"
            cmd = Prompt.ask(f"\n[bold cyan]meta-ads{account_info}[/bold cyan]")
            process_command(cmd, accounts)
        except KeyboardInterrupt:
            console.print("\n[cyan]À bientôt ! 👋[/cyan]")
            break
        except Exception as e:
            console.print(f"[red]Erreur : {e}[/red]")


if __name__ == "__main__":
    main()
