# Monceau Fleurs — Reporting EVF

## Contexte
Reporting complet pour le codir franchise Monceau Fleurs (Emova Group). Demande de Lola Pasquier via Sébastien Sanita. Collaboration démarrée en décembre 2025.

## Sources de données
- **Meta Ads** : export CSV mensuel depuis le Business Manager (campagnes MONCEAU FLEURS_LeadAds_*)
- **Google Ads** : export CSV mensuel (Search Brand, Search Générique, YouTube)
- **GA4** : export depuis Everfruit (Data Extract Monceau)
- **Everfruit** : fichier "2026 - Suivi Client EVERFUIT .xlsx" pour benchmarks et budgets

## Méthodologie
- **Attribution plateforme** pour les CPL Monceau (Meta Ads + Google Ads)
- **Leads Meta** = on-Facebook leads + website leads (pixel)
- **Benchmark agence** = données Everfruit (attribution GA4 côté agence)
- **Pas de CPL global blended** — on reste par canal (Meta / Google)

## Déploiement
- URL : https://reporting-monceau.vercel.app
- Dossier Vercel : ce dossier (index.html)
- Déployer : `npx vercel --yes --prod`

## Fichiers
- `index.html` — le reporting déployé
- `reporting-monceau-fleurs.html` — copie de travail
