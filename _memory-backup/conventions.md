# Conventions de code - ArabicFlow Qalam

## Langue
- **Interface utilisateur** : Français (avec accents corrects !)
- **Contenu arabe** : Unicode escapes dans les fichiers .ts (`\u0622\u062F\u0645` etc.)
- **Noms de variables/fonctions** : Anglais (camelCase)
- **Commentaires dans le code** : Anglais

## Composants React
- Directive `'use client'` en haut de chaque composant
- Export default pour les composants principaux
- Props typées avec `interface XxxProps {}`
- Mode kids/adult via `const { mode } = useTheme(); const isKids = mode === 'kids';`
- Texte conditionnel : `{isKids ? 'Version enfant' : 'Version adulte'}`

## Styling
- Tailwind CSS pour la mise en page
- Variables CSS inline pour les couleurs thématiques :
  ```tsx
  style={{ color: 'var(--islam-primary)', background: 'var(--card-bg)' }}
  ```
- Pas de modules CSS, pas de styled-components
- Classes d'animation : `animate-fade-in`, `animate-slide-in-up`, `animate-scale-in`
- Classe `btn-hover` pour les effets hover sur les boutons
- Classe `arabic-text` pour le texte arabe
- `direction: 'rtl'` pour le texte arabe

## Structure des modules de données
```typescript
export interface ModuleItem {
  id: string;
  rank: number;
  nameFr: string;
  nameAr: string;
  nameTranslit: string;
  icon: string;
  summary: string;
  kidsSummary: string;
  sections: { title: string; content: string; kidsContent: string }[];
  // ... champs spécifiques au module
  difficulty: 1 | 2 | 3;
}
```

## Structure des pages (App Router)
```tsx
'use client';
import AuthGuard from '@/components/AuthGuard';
import ModuleComponent from '@/components/ModuleComponent';
import MascotCompanion from '@/components/MascotCompanion';

const MASCOT_MSGS = ['Message 1', 'Message 2', 'Message 3'];

export default function ModulePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen py-8 px-4" style={{ background: 'var(--background)' }}>
        <ModuleComponent />
        <MascotCompanion contextMessages={MASCOT_MSGS} />
      </div>
    </AuthGuard>
  );
}
```

## Progression (useProgress.ts)
- Ajouter un champ au type `UserProgress`
- Ajouter au `DEFAULT_PROGRESS`
- Ajouter migration dans `loadProgress()`
- Ajouter fonctions de mise à jour
- Ajouter badges si pertinent
- Ajouter au `return` du hook

## Boutons
- Toujours `type="button"` sur les boutons non-submit
- `className="cursor-pointer btn-hover"` pour l'interactivité
- Arrondi : `rounded-xl` ou `rounded-2xl`

## SVG inline
- Utiliser des SVG inline plutôt que des icônes de bibliothèque
- `width`, `height`, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth="2"`, `strokeLinecap="round"`, `strokeLinejoin="round"`

## Android / Capacitor
- `next.config.ts` : `output: 'export'` pour générer dans `/out/`
- `capacitor.config.ts` : `webDir: 'out'`
- Build flow : `npm run build` → `npx cap sync android` → `./gradlew assembleDebug`
