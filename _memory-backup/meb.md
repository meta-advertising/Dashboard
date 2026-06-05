# Mon Extension Bois (MEB) - Dashboard Marketing

## Client
Damien Branly — Réseau franchise Mon Extension Bois (extensions/surélévations bois)

## Structure fichiers
- `dashboard-meb-national.html` : Dashboard national (fichier principal, contient PDF + synthèse multi-agences)
- `dashboard-meb-{ville}.html` : Dashboards par agence (lille, arras, cambrai, metz, larochelle, franchise)
- `MEB-*/index.html` : Versions déployées sur GitHub Pages (monextensionbois-france.github.io)
- `MEB-Portail/index.html` : Portail d'accès aux dashboards

## Configuration
- PUB_KEY Supermetrics : `2PACX-1vTgtIHThvJaikT-EErGEFf0RbNFl_-QVBnCHIIGDBrVRcg-giq8-JbKXUH8-VXgPWUKhGPcXWcqfGlR`
- SSH key : `~/.ssh/id_mon-extension-bois`
- GitHub : monextensionbois-france

## GID des sources de données
| Agence | META gid | GOOGLE gid |
|--------|----------|------------|
| Metz | 1268271660 | 315040518 |
| Cambrai | 527627149 | 410923096 |
| La Rochelle | 383075600 | 236834002 |
| Lille | 588356426 | 1620127247 |
| Arras | 842145848 | 100199164 |
| Franchise | 1803648907 | N/A |
| National | 2000998345 | 1236487492 |

## Fonctionnalités PDF (tous les dashboards) — Fév 2026
- Export PDF personnalisable avec jsPDF (pas html2canvas)
- Modal de sélection : période + KPIs + glossaire + graphique historique + tableau + répartition
- Graphique historique : Chart.js offscreen → canvas.toDataURL → jsPDF addImage
- Glossaire indicateurs : explications simples pour franchisés novices
- Header PDF premium : fond blanc, logo grande taille, filet orange, typo brun/orange
- Couleurs : Meta = bleu #1877f2, Google = vert #34a853
- Rapport synthèse multi-agences : **uniquement sur le dashboard national**, PDF paysage A4

## Points techniques PDF
- jsPDF Helvetica ne supporte PAS les accents → textes PDF sans accents (Depenses, Cout, etc.)
- Chart.js offscreen : `responsive:false, animation:false, devicePixelRatio:2`, setTimeout 250ms
- `need(h)` pour vérif saut de page (PAS `checkPage`)
- `sectionTitle(label)` pour titres de section PDF (barre orange + trait)
- Synthèse multi-agences : format paysage, fetch séquentiel par agence via PUB_KEY + GID
- Logo MEB en base64 PNG : variable `PDF_LOGO_DATA` (converti depuis WebP du site, 300px)
- En-têtes tableau re-dessinés après saut de page (synthèse)
- Serveur MEB bloque CORS → logo obligatoirement en base64 hardcodé

## Génération des dashboards agences
- Les 6 dashboards agences sont générés à partir du national comme template
- Script Python : remplace title, PDF_ENTITY, GIDs, sidebar-badge + supprime synthèse
- Franchise : pas de GOOGLE_URL (GOOGLE_URL=null)

## Conversions Google Ads — RÉSOLU
- Agences Arras, Cambrai, La Rochelle, Metz avaient 0 conversions
- Cause : conversions non configurées sur les comptes Google Ads
- Damien a configuré les conversions le 26/02/2026
- Historique non récupérable rétroactivement, données fiables à partir de maintenant

## Historique demandes Damien
### 23/02/2026
1. Graphique historique mensuel dans PDF : DONE
2. Glossaire indicateurs (mémo) : DONE
3. Logo + couleurs MEB : DONE
4. Rapport synthèse multi-agences comparatif : DONE
5. Couleurs différentes Meta vs Google : DONE
6. Investigation 0 conversions Google : DONE

### 26/02/2026
7. Fix logo PDF (base64 corrompu → régénéré proprement) : DONE
8. Header PDF premium (fond blanc, logo grand format) : DONE
9. Fix saut de page tableaux synthèse (en-têtes répétés) : DONE
10. Déploiement sur toutes les agences + GitHub Pages : DONE
- Synthèse multi-agences gardée uniquement sur le national
