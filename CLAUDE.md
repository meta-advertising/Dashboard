# HZ Dev — Workspace principal

## Qui suis-je
Hamza Zahouane, fondateur de Meta-Advertising (agence marketing digital). On gère des campagnes Meta Ads, Google Ads et du reporting pour des clients franchise et B2C. On travaille aussi avec Koven Agency et Everfruit Digital comme partenaires.

## Organisation du repo

```
_meta-advertising/    → Portail interne Meta-Advertising + outils (agents, audit, Schmidt)
_newsletter/          → Newsletter hebdo Meta-Advertising
_everfruit/           → Rapports clients Everfruit (Monceau, Bodyhit, futurs)
_koven/               → Portail client Koven + présentations commerciales
_tools/               → Outils techniques (PDF, screenshots, etc.)
_mails/               → Brouillons de mails

clients/meta/         → Clients Meta-Advertising (dashboards, rapports)
clients/koven/        → Clients Koven Agency
projets-perso/        → Projets perso (ArabicFlow, Papoti, PipeFlow)
labs/                 → Prototypes et tests
```

## Conventions
- Toujours écrire le français avec accents corrects (é è ê ë, à â, ù û, î ï, ô, ç, œ)
- Nommage des dossiers : kebab-case
- Dashboards et rapports : HTML autonome, style dark premium, déployés sur Vercel ou GitHub Pages
- Ne pas utiliser `git add -uall` (problème mémoire sur gros repos)

## Portails
- Meta-Advertising : `_meta-advertising/meta-advertising.html`
- Koven : `_koven/portail-koven.html`

## Quand créer un nouveau client
1. Créer le dossier dans `clients/meta/` ou `clients/koven/`
2. Créer un CLAUDE.md dans le dossier
3. Ajouter le client dans le portail correspondant
