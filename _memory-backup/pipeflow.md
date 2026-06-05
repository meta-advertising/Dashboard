---
name: PipeFlow CRM+Automation
description: Projet PipeFlow - CRM + Automation platform (Pipedrive+Zapier) pour agence Meta Advertising / Kodify. État d'avancement complet au 16/03/2026.
type: project
---

## PipeFlow — CRM + Automation Platform

**Stack** : Backend Express/Prisma/PostgreSQL (port 4000) + Frontend Vue 3/Vite/Tailwind/Pinia (port 5173)
**Monorepo** : `pipeflow/apps/backend` + `pipeflow/apps/frontend`
**DB** : PostgreSQL embedded (port 5432, data `.pg-data/`)
**Compte test** : `admin@pipeflow.dev` / `PipeFlow2026Super` (ADMIN, tenant: Meta Advertising)
**RBAC** : SUPER_ADMIN > ADMIN > MANAGER > USER, middleware `requireRole()`
**Multi-tenant** : Toutes requêtes scopées par `tenantId`

## État des 7 phases (toutes COMPLÈTES au 15/03/2026)

### Phase 1 — Contrôle d'accès ADMIN/CLIENT ✅
- Backend: `requireRole()` sur routes workflows, pipelines, webhooks, intégrations
- Frontend: sidebar conditionnelle (`AppLayout.vue`), route guards (`meta: adminOnly`), auth store helpers (`isAdmin`, `isSuperAdmin`)

### Phase 2 — Pages Détail ✅
- `DealDetail.vue`, `ContactDetail.vue`, `OrganizationDetail.vue` avec layout 2 colonnes + timeline
- Composant `Timeline.vue` réutilisable (activités, notes, changements)
- Backend enrichi avec includes complets sur GET /:id

### Phase 3 — CRM Avancé ✅
- Bulk actions sur Contacts, Leads, Deals (checkbox + floating bar)
- `Products.vue` — catalogue produits CRUD
- `Settings.vue` — onglet Pipelines (CRUD stages, reorder, couleurs)
- Backend: routes `/products` CRUD, endpoints `/bulk`

### Phase 4 — Workflow Builder Visuel ✅
- `WorkflowBuilder.vue` — plein écran avec Vue Flow (`@vue-flow/core`, `@vue-flow/minimap`, `@vue-flow/controls`)
- Nœuds custom : `TriggerNode.vue` (violet), `ConditionNode.vue` (ambre, 2 sorties), `ActionNode.vue` (cyan)
- `NodeConfigPanel.vue` — panneau config dynamique
- Drag-drop palette, conversion bidirectionnelle backend↔VueFlow (`toBackendFormat`/`fromBackendFormat`)
- Note: erreur TS sur `NodeTypesObject` (type Vue Flow) — n'affecte pas le runtime, vite build passe

### Phase 5 — Email + Intégrations ✅
- `email.service.ts` — envoi via Resend/SendGrid avec template `{{variable}}`, fallback console.log en dev
- `meta-ads.service.ts` — webhook receiver + polling Meta Marketing API
- `google-ads.service.ts` — webhook receiver Google Ads
- Routes publiques (sans auth) : `GET/POST /api/webhooks/meta`, `POST /api/webhooks/google`
- `POST /api/integrations/meta/sync` — sync manuelle authentifiée
- Workflow engine mis à jour pour utiliser le vrai service email

### Phase 6 — Analytics Prévisions ✅
- Backend: `GET /api/analytics/forecast` — pipeline pondéré (montant × probabilité) groupé par mois + summary
- Frontend: onglet "Prévisions" dans `Analytics.vue` — 4 KPI cards + barres mensuelles empilées (total + pondéré)

### Phase 7 — Dashboard Admin Cross-Tenant ✅
- Backend: `GET /api/admin/dashboard` (KPIs agrégés tous tenants), `GET /api/admin/tenants/:id/dashboard` (détail)
- Frontend: onglet "Dashboard" (par défaut) dans `Admin.vue` — 5 KPIs globaux, cartes par tenant cliquables, panneau détail

## Améliorations Post-Phase 7 (session 16/03/2026) ✅

### Backend — Nouvelles routes + modèles
- **6 nouveaux modèles Prisma** : SavedFilter, Goal (GoalType/GoalPeriod), Subscription (SubscriptionType), CallLog, GlobalVariable, WorkflowStorage
- **Nouvelles routes** : goals.ts, saved-filters.ts, subscriptions.ts, call-logs.ts, global-variables.ts, search.ts, products.ts
- **Toutes enregistrées** dans index.ts avec `app.use('/api', ...)`
- **0 erreurs TypeScript** sur tout le backend (12 fichiers corrigés)

### Backend — Workflow Engine avancé
- 9 types de nœuds : trigger, condition, filter, action, delay, formatter, loop, code, storage
- `executeDelay()` — pause d'exécution
- `executeFormatter()` — 15+ opérations (uppercase, lowercase, trim, replace, concat, math, date_format, etc.)
- `executeCode()` — exécution JS sandboxée via `new Function`
- `executeStorage()` — get/set/delete par workflow + get_global
- Filter node : arrête l'exécution silencieusement si condition fausse
- Loop node : itère sur tableau, met `_loopItem`/`_loopIndex` dans le contexte

### Backend — Filtres avancés
- Utilitaire `filter-parser.ts` — parse `?filters=[{field, operator, value}]` en clauses Prisma where
- Supporte champs de base + champs personnalisés (préfixe `cf_`)
- Opérateurs : contains, equals, starts_with, ends_with, gt, gte, lt, lte, is_empty, is_not_empty
- Intégré dans contacts.ts, deals.ts, leads.ts

### Backend — Custom Fields 16 types
- Types : text, large_text, numeric, monetary, single_option, multiple_options, date, date_range, time, time_range, phone, address, person, organization, user, autocomplete
- `GET /api/custom-fields/types` — liste avec labels/icônes
- `GET /api/custom-fields/autocomplete/:fieldName` — suggestions auto-complétion
- `POST /api/custom-fields/evaluate-formula` — évaluation formules mathématiques

### Frontend — Nouvelles vues
- `DealDetail.vue` (21kB) — layout 2 colonnes, timeline, actions gagné/perdu, produits, champs personnalisés
- `ContactDetail.vue` (13kB) — fiche contact, deals liés, timeline, organisation
- `OrganizationDetail.vue` (14.5kB) — infos org, contacts, deals, hiérarchie parent/enfants
- `Products.vue` — table produits CRUD avec modal
- `Goals.vue` — objectifs avec barres de progression
- `CallLogs.vue` — journal d'appels avec filtres
- `Subscriptions.vue` — MRR/ARR KPIs + table abonnements
- `GlobalSearch.vue` — recherche full-text ⌘K (contacts, deals, leads, orgs)

### Frontend — Composants
- `FilterBuilder.vue` — filtres avancés réutilisable (champs base + custom, opérateurs, sauvegarde)
- Intégré dans Contacts.vue
- `Timeline.vue` — flux chronologique mixte (activités, notes)

### Frontend — Améliorations
- Settings.vue : 16 types de champs personnalisés dans le sélecteur
- Toutes les navigations fonctionnelles (Pipeline cards → DealDetail, Contact rows → ContactDetail, etc.)
- 30 routes enregistrées dans main.ts
- Build frontend : 1.70s, 0 erreurs

## Prochaines étapes possibles
- Tests automatisés (unitaires + intégration)
- Déploiement (Docker, CI/CD)
- Onboarding wizard pour nouveau tenant
- Email sync bidirectionnelle, campaigns
- Calendar sync, meeting scheduler
- Merge doublons detection
- Smart Docs + signature
- 2FA, SSO
- Responsive mobile

**Why:** Le user (agence Meta Advertising / Kodify) construit cette plateforme comme produit interne + SaaS potentiel.
**How to apply:** Toujours se référer à ce fichier pour connaître l'état du projet et éviter de refaire du travail déjà fait.
