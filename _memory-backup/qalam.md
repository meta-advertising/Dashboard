# ArabicFlow Qalam - App Mobile

## Résumé
App mobile d'apprentissage de l'arabe et de l'islam, destinée aux francophones. Modes adulte et kids.

## Stack technique
- Next.js 16.1.6, React 19, TypeScript 5, Tailwind CSS 4
- Capacitor 8.1.0 pour Android
- Export statique (`output: 'export'` dans next.config.ts)
- Supabase (auth anonyme + cloud sync)
- 27 pages, 65+ composants, 20 fichiers data, 8 hooks, 10 libs

## Chemin projet
`/Users/zahouane/Test HZ Dev/arabicflow/`

## Commandes
```bash
npm run build
npx cap sync android
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd android && ./gradlew clean && ./gradlew assembleDebug
```

## État (25 fév 2026)
- Phase 1-5 : DONE
- Phase 6 (Play Store) : DONE
  - Package : `com.qalam.france`
  - Nom : "Qalam - Arabe, Coran, Islam"
  - Landing : https://qalam-france.github.io/application/
  - Contact : iam.devpro@outlook.com
  - SSH key : `~/.ssh/id_ed25519` (GitHub Qalam-France)
  - Soumission test fermé en cours de review

## Points d'attention
- CSS `transform` (animate-scale-in) casse `position: fixed` des enfants
- Android Studio JBR path : `/Applications/Android Studio.app/Contents/jbr/Contents/Home`
- Supabase non configuré = tout fonctionne en local seul (graceful degradation)
