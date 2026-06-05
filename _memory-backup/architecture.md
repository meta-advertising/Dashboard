# Architecture ArabicFlow Qalam

## Structure des dossiers
```
src/
├── app/                          # Pages Next.js (App Router)
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Layout principal (ClientLayout)
│   ├── globals.css               # Variables CSS, thèmes, animations
│   ├── alphabet/page.tsx
│   ├── culture/page.tsx
│   ├── dashboard/page.tsx
│   ├── defi/page.tsx
│   ├── dictee/page.tsx           # Phase 3
│   ├── dictionnaire/page.tsx
│   ├── ecriture/page.tsx
│   ├── flashcards/page.tsx
│   ├── grammaire/page.tsx
│   ├── inscription/page.tsx
│   ├── lecture/page.tsx
│   ├── nombres/page.tsx
│   ├── quiz/page.tsx
│   ├── syllabes/page.tsx
│   ├── voyelles/page.tsx
│   └── islam/
│       ├── page.tsx              # IslamHub
│       ├── adab/page.tsx         # Phase 3
│       ├── coran/page.tsx
│       ├── duas/page.tsx
│       ├── femmes/page.tsx       # Phase 2
│       ├── piliers/page.tsx
│       └── prophetes/page.tsx
│
├── components/                   # 51 composants React
│   ├── AdabModule.tsx            # Phase 3 - 10 thèmes adab
│   ├── AuthGuard.tsx             # Protection des pages
│   ├── AuthProvider.tsx          # Contexte auth
│   ├── BackButton.tsx            # Bouton retour réutilisable (router.back)
│   ├── BottomTabBar.tsx          # Navigation mobile (5 onglets)
│   ├── ClientLayout.tsx          # Layout client-side
│   ├── CultureModule.tsx         # Culture arabe
│   ├── DictationExercise.tsx     # Phase 3 - dictées
│   ├── DictionaryModule.tsx
│   ├── DuaModule.tsx
│   ├── FlashcardDeck.tsx         # Cartes SM-2
│   ├── IslamHub.tsx              # Hub Islam (6 cartes)
│   ├── MascotCompanion.tsx       # Mascotte Qalam
│   ├── PillarsModule.tsx         # 5 piliers
│   ├── ProphetQuiz.tsx           # Quiz prophètes
│   ├── ProphetTree.tsx           # Phase 3 - arbre généalogique SVG
│   ├── ProphetsModule.tsx        # 25 prophètes
│   ├── QuranAudioPlayer.tsx
│   ├── QuranModule.tsx           # Coran + signets (Phase 3)
│   ├── QuranReviewSession.tsx    # Phase 3 - révision SM-2 Coran
│   ├── TahfidhMode.tsx           # Mémorisation Coran
│   ├── TajwidVerse.tsx           # Phase 2 - tajwid coloré
│   ├── ThemeProvider.tsx         # Thèmes (light/dark/kids)
│   ├── WomenIslamModule.tsx      # Phase 2 - femmes en islam
│   ├── WritingCanvas.tsx         # Écriture arabe canvas
│   └── tabs/                     # Onglets principaux
│       ├── HomeTab.tsx
│       ├── IslamTab.tsx
│       ├── LearnTab.tsx
│       ├── ProfileTab.tsx
│       └── QuizTab.tsx
│
├── data/                         # 18 fichiers de données
│   ├── adab.ts                   # Phase 3 - 10 AdabManners
│   ├── arabic-alphabet.ts        # 28 lettres
│   ├── arabic-vocabulary.ts      # Vocabulaire par catégories
│   ├── arabic-vowels.ts          # Voyelles/diacritiques
│   ├── culture.ts                # Culture arabe
│   ├── dictionary.ts             # Dictionnaire
│   ├── duas.ts                   # Invocations
│   ├── grammar.ts                # Grammaire
│   ├── learning-stages.ts
│   ├── letter-forms.ts           # Formes des lettres
│   ├── module-categories.ts      # Catégories de modules
│   ├── numbers.ts                # Nombres arabes
│   ├── pillars.ts                # 5 piliers
│   ├── prophets.ts               # 25 prophètes enrichis
│   ├── quran-surahs.ts
│   ├── reading-exercises.ts
│   ├── surah-index.ts            # Index 114 sourates
│   └── women-islam.ts            # Phase 2 - femmes en islam
│
├── hooks/                        # 8 hooks
│   ├── useAudio.ts               # TTS (text-to-speech)
│   ├── useAuth.ts                # Auth localStorage
│   ├── useLearningStage.ts
│   ├── useNotifications.ts       # Notifications Capacitor
│   ├── useProgress.ts            # CENTRAL - progression utilisateur
│   ├── useQuranAudio.ts          # Audio Coran (API)
│   ├── useSpacedRepetition.ts    # Algorithme SM-2
│   └── useSurah.ts               # Chargement dynamique sourates
│
└── lib/                          # 6 utilitaires
    ├── quran-api.ts              # API Al-Quran Cloud
    ├── sm2.ts                    # Algorithme SM-2
    ├── surah-cache.ts            # Cache sourates
    ├── tahfidh-engine.ts         # Moteur mémorisation
    ├── tajwid.ts                 # Règles tajwid
    └── utils.ts                  # Utilitaires généraux
```

## Fichier central : useProgress.ts
Gère TOUTE la progression utilisateur via localStorage :
- `completedModules`, `xp`, `level`, `streak`
- `readProphets`, `prophetQuizScores`
- `pillarStudied`, `adabStudied`, `womenStudied`
- `verseMemoLevels`, `bookmarkedVerses`
- `dictationExercisesDone`, `dictationBestScore`
- `badges` (gamification)

## Système de thèmes (globals.css)
Variables CSS : `--background`, `--foreground`, `--card-bg`, `--card-border`
Islam : `--islam-primary` (vert), `--islam-secondary` (doré)
3 modes : light, dark (prefers-color-scheme), kids

## Navigation
BottomTabBar avec 5 onglets : Accueil, Apprendre, Islam, Quiz, Profil

## Android
- Capacitor 8.1.0 dans `/android/`
- Plugins : text-to-speech, local-notifications, preferences
- Build : `./gradlew assembleDebug` (183 tasks)
- APK : `android/app/build/outputs/apk/debug/app-debug.apk`
