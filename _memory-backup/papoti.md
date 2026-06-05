# Papoti — Plateforme orthophonique interactive

## Identité
- **Nom** : Papoti (du verbe "papoter")
- **Tagline** : "Apprends à parler en t'amusant !"
- **Cible** : Enfant de 4 ans avec difficultés langagières (formation de phrases)
- **Usage** : Desktop, toujours avec un parent

## Stack technique
- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4 + CSS Custom Properties (--papoti-primary, etc.)
- Claude API (Anthropic SDK) via API Routes
- Web Speech API (TTS + Speech Recognition) + MediaRecorder API
- localStorage (pattern adapté de QalamStorage)

## Structure
```
papoti/src/
├── app/ (15 routes : /, dashboard, bilan, 8 exercices, planning, progres, api/claude)
├── components/ (Mascotte, CelebrationOverlay, AudioButton, BackButton, ClientLayout)
├── hooks/ (useProgress, useAudio+useRecorder+useBlowDetector, useTherapyStage, useClaude, useSession)
├── data/ (vocabulaire 150+ mots, phrases-modeles, praxies 20+, sons-francais, gamification, therapy-stages)
└── lib/ (storage, claude-client, utils)
```

## 8 modules d'exercices
1. **Vocabulaire** : Imagier, devinette, catégorisation (150+ mots, 16 catégories, 3 niveaux difficulté)
2. **Phrases** : Construction drag&drop (5 niveaux : mot seul → phrase complexe)
3. **Praxies** : 20+ exercices bucco-faciaux avec timer et répétitions
4. **Phonologie** : Syllabes, rimes, sons initiaux, intrus
5. **Compréhension** : Consignes simples/doubles, vrai/faux
6. **Expression** : Description d'images, récit guidé + enregistrement vocal
7. **Articulation** : 8 sons ciblés (ch, j, r, l, s, z, f, v) + enregistrement
8. **Souffle** : Bougies, course de bateau, bulles (détection micro)

## 6 stades thérapeutiques
Éveil → Premiers Sons → Premiers Mots → Premières Phrases → Phrases Complètes → Expression Libre

## Gamification
- Étoiles (jamais de 0), 27 badges, séries quotidiennes, coffres surprise
- Mascotte Papoti (SVG animé, réactions contextuelles)
- Zéro punition, encouragements variés (30+ phrases)

## IA (Claude API)
- Bilan initial avec analyse IA
- Rapports hebdo, conseils parent, adaptation dynamique
- API route /api/claude avec system prompt expert orthophoniste

## Patterns réutilisés depuis ArabicFlow/Qalam
- QalamStorage → PapotiStorage (cache mémoire + localStorage)
- useProgress (progression, badges, streaks)
- Gamification (XP → étoiles, badges, coffres)
- Learning stages → Therapy stages
- useAudio (TTS français, pitch/rate adaptés enfant)
