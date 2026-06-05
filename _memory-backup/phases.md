# Historique des phases - ArabicFlow Qalam

## Phase 1 - Fondations (DONE)
Création de l'app complète :
- Landing page, inscription, dashboard
- Alphabet arabe (28 lettres avec audio TTS)
- Voyelles et diacritiques
- Nombres arabes
- Grammaire arabe
- Module lecture
- Quiz interactifs
- Flashcards avec SM-2 (répétition espacée)
- Dictionnaire arabe-français
- Module culture arabe
- Écriture arabe (canvas)
- Syllabes
- Islam Hub (Coran, Prophètes, Piliers, Duas)
- Système de progression, XP, badges, streak
- Mode kids/adult
- Mascotte Qalam
- Navigation par onglets (BottomTabBar)
- Export Android via Capacitor

## Phase 2 - Améliorations (DONE)
1. Fix dark mode (variables CSS corrigées dans globals.css)
2. Tajwid coloré (TajwidVerse.tsx + lib/tajwid.ts)
3. Femmes de l'Islam (women-islam.ts + WomenIslamModule.tsx + /islam/femmes)
4. Enrichissement des 25 prophètes (histoires longues, résumés kids)
5. Terminologie Isa (عيسى عليه السلام)

## Phase 3 - Nouvelles fonctionnalités (DONE - 24 fév 2026)

### 1. Signets Coran
- `useProgress.ts` : ajout `bookmarkedVerses: string[]`, `toggleBookmark()`, `isBookmarked()`
- `QuranModule.tsx` : icône étoile sur chaque verset, filtre "Mes signets"
- Badges : `first-bookmark`, `bookworm`

### 2. Révision SM-2 Coran
- `QuranReviewSession.tsx` : session de révision des versets mémorisés (niveau >= 4)
- Cartes flashcard : réciter de mémoire → voir réponse → noter (Oublié/Difficile/Facile)
- Utilise `useSpacedRepetition.ts` existant
- `QuranModule.tsx` : bouton "Révision" avec badge due count

### 3. Arbre généalogique des Prophètes
- `ProphetTree.tsx` : arbre SVG interactif, 25 prophètes avec liens de filiation
- Nœuds colorés (vert=lu, gris=non lu), sélection → fiche détail
- `ProphetsModule.tsx` : bouton "Généalogie" dans le header

### 4. Section Adab (bonnes manières)
- `adab.ts` : 10 thèmes (salam, parents, table, parole, voisin, tahara, mosquée, rue, animaux, générosité)
- Chaque thème : 4 sections, verset clé, hadith, étapes pratiques, exemple du Prophète
- `AdabModule.tsx` : grille overview + vue détail avec accordéon
- `IslamHub.tsx` : 6e carte ajoutée
- `useProgress.ts` : `adabStudied`, badges `first-adab`, `all-adab`

### 5. Dictées arabes
- `DictationExercise.tsx` : mode lettre/mot, 10 questions par session
- Audio TTS + 4 choix (1 correct + 3 distracteurs intelligents)
- Feedback immédiat, score final avec étoiles
- Intégration SM-2 + XP
- `/dictee/page.tsx`

## Corrections post-Phase 3
- Fix bug ProphetQuiz : `animate-scale-in` wrapper retiré (cassait `position: fixed`)
- Fix visibilité modules Android : `./gradlew clean && assembleDebug`
- Vérification complète accents/orthographe : ~170+ corrections sur 12 fichiers
  - adab.ts : réécriture complète (~125+ accents)
  - culture.ts : 18 corrections (Égypte, Émirats, cœur...)
  - module-categories.ts : 3 corrections
  - 8 composants : 43 corrections
  - adab/page.tsx : 3 corrections

## Phase 4 - Dashboard gamifié + Tests de niveau (DONE - 24 fév 2026)

### Feature A : Dashboard gamifié avancé
- `gamification.ts` : coffres (6 paliers), titres spéciaux (12), défis hebdo (7 types), streak tiers
- `useProgress.ts` : 13 nouveaux champs + 10 nouvelles méthodes (objectif quotidien, défis hebdo, XP history, coffres, titres, test résultats)
- `DailyGoal.tsx` : anneau SVG circulaire, objectif configurable 1-10, bonus +50 XP
- `WeeklyChallenge.tsx` : 3 défis hebdo déterministes, barres progression, récompenses
- `RewardChest.tsx` : 6 coffres SVG (fermé/ouvert/verrouillé), animation ouverture, titres spéciaux
- `StreakDisplay.tsx` : flamme SVG 3 tiers (normal/or/diamant), animations glow/sparkle
- `XPChart.tsx` : graphique SVG barres 7 derniers jours
- `SkillRadar.tsx` : radar/araignée SVG 5 axes (alphabet, vocabulaire, grammaire, lecture, nombres)
- `HomeTab.tsx` : intégration DailyGoal, WeeklyChallenge, StreakDisplay, XPChart, SkillRadar, bouton test niveau
- `ProfileTab.tsx` : intégration titres spéciaux, coffres, XPChart, SkillRadar, bouton test niveau
- `globals.css` : 7 nouvelles animations (chest-open, gold-glow, diamond-sparkle, ring-fill, results-reveal, chest-glow, bar-grow, radar-draw)

### Feature B : Tests de niveau
- `level-test.ts` : 5 domaines, génération questions depuis données existantes, difficulté adaptative, labels A1-C1
- `LevelTest.tsx` : machine d'états intro→playing→calculating→results, 25 questions, feedback visuel
- `SkillProfile.tsx` : résultats avec radar, comparaison avec test précédent, 3 recommandations personnalisées
- `/test-niveau/page.tsx` : page dédiée avec BackButton et MascotCompanion
- 4 nouveaux badges : daily-goal-streak, weekly-champion, first-test, test-improver
- `module-categories.ts` : +21 badges ajoutés à ALL_BADGES

### Build
- 27/27 pages (26 + test-niveau)
- Android sync + APK OK

## Phase 5 - Sauvegarde & Multi-profils & Supabase (DONE - 24 fév 2026)

### A. Couche stockage abstraite
- `storage.ts` : singleton QalamStorage avec cache mémoire + async flush vers Capacitor Preferences (natif) ou localStorage (web)
- `profile-keys.ts` : helper `profileKey(profileId, suffix)` → `qalam-profile:{id}:{suffix}`
- `ClientLayout.tsx` : `await storage.initialize()` au bootstrap

### B. Migration localStorage → storage
- 12 fichiers migrés : AuthProvider, useProgress, useSpacedRepetition, ThemeProvider, useNotifications, useAuth, DuaModule, GrammarModule, ReadingModule, dashboard/page, surah-cache
- Zéro appel direct à localStorage restant hors storage.ts

### C. Multi-profils
- `profile-manager.ts` : ProfileManager (CRUD, max 5 profils, switchProfile, deleteProfile)
- `migrate-legacy.ts` : migration auto données legacy vers format namespacé
- `ProfileSelector.tsx` : grille profils avec ajout/suppression
- `ProfileGate.tsx` : gate app (0→inscription, 1→auto, 2+→sélecteur)
- `AuthProvider.tsx` : rewrite pour profileManager + namespaced keys
- `useProgress.ts`, `useSpacedRepetition.ts`, `DuaModule.tsx`, `GrammarModule.tsx`, `ReadingModule.tsx`, `dashboard/page.tsx` : getStorageKey() avec profileKey

### D. Supabase cloud sync
- `supabase.ts` : client Supabase avec storage adapter custom
- `sync-service.ts` : auth anonyme, push/pull XP-based, sync périodique 5min, linkEmail, recoverWithEmail
- `ClientLayout.tsx` : startPeriodicSync + appStateChange listener via @capacitor/app
- `AuthProvider.tsx` : createAnonymousUser en background à l'inscription
- `supabase-schema.sql` : tables profiles + user_progress + RLS
- `.env.local` : NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY

### E. Lier email + récupération
- `LinkEmailCard.tsx` : carte dans ProfileTab pour lier email/mdp
- `inscription/page.tsx` : lien "Récupérer un compte existant"

### Build
- 27/27 pages, Android sync + APK OK
- Packages ajoutés : @supabase/supabase-js@2.97.0, @capacitor/app@8.0.1

## Idées pour Phase 6 (non encore planifiées)
- Audio Coran hors-ligne
- Partage de progression
- Mode hors-ligne complet
- Support anglais
- Nettoyage Dashboard.tsx (supprimer duplicates MODULE_CATEGORIES)
