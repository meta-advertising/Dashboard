# Problèmes connus & solutions

## CSS transform casse position: fixed
**Problème** : Un composant enfant avec `position: fixed` ne fonctionne pas quand un parent utilise `transform` (ex: `animate-scale-in` qui fait `transform: scale()`).
**Cause** : CSS spec - `transform` crée un nouveau containing block, les enfants `fixed` deviennent relatifs à ce parent au lieu du viewport.
**Solution** : Ne pas wrapper les composants fullscreen (`position: fixed`) dans des éléments animés avec `transform`. Rendre le composant directement sans wrapper.
**Exemple** : ProphetQuiz dans ProphetsModule.tsx - rendu direct sans `<div className="animate-scale-in">`.

## Android Studio ne voit pas les nouveaux modules
**Problème** : Après `npx cap sync android`, les nouvelles pages ne s'affichent pas dans l'app.
**Solution** : Faire un clean + rebuild complet :
```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd android && ./gradlew clean && ./gradlew assembleDebug
```

## Java non trouvé dans le terminal
**Problème** : `JAVA_HOME` pas configuré, `java` non disponible.
**Solution** : Utiliser le JBR bundlé avec Android Studio :
```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
```

## Accents français manquants
**Problème** : Les agents de génération de code peuvent oublier les accents français.
**Vigilance** : Toujours vérifier é è ê ë, à â, ù û ü, î ï, ô, ç, œ dans tout texte français.
**Mots fréquemment oubliés** : Égypte, Émirats, États, Écoute, Étapes, Étudié, Résumé, Révision, Dictée, Découvrir, Généalogie, Prophètes, manières, thèmes, réponse, mémoire, révisé, terminée, mémorisés, cœur.

## Modules manquants dans l'onglet Islam (RÉSOLU)
**Problème** : L'onglet Islam du dashboard ne montrait que 4 modules (Coran, Prophètes, Duas, Piliers) au lieu de 6 (manquait Femmes et Adab).
**Cause** : `module-categories.ts` et `Dashboard.tsx` avaient des MODULE_CATEGORIES incomplètes pour la catégorie islam. L'IslamTab utilisait ces données incomplètes, tandis que IslamHub (page /islam) avait les 6 modules hardcodés.
**Solution** : Ajouter `femmes` et `adab` dans la catégorie islam de `module-categories.ts` ET dans le duplicate MODULE_CATEGORIES de `Dashboard.tsx`. Ajouter aussi les cases correspondantes dans `getModuleProgress()`.
**Attention** : Dashboard.tsx a un duplicate complet de MODULE_CATEGORIES - toujours synchroniser les deux !

## Navigation hardcodée vers /islam (AMÉLIORÉ)
**Problème** : Les boutons retour des modules Islam pointaient vers `/islam` (hardcodé) ce qui cassait la navigation quand l'utilisateur venait du dashboard.
**Solution** : Créé `BackButton.tsx` réutilisable qui utilise `router.back()` avec fallback. Remplacé les liens hardcodés dans tous les modules Islam.

## Build warnings (ignorables)
- `flatDir` warning dans Gradle : normal avec Capacitor, pas d'impact
- `unchecked or unsafe operations` dans Capacitor plugins : warnings des dépendances, pas notre code
- `deprecated API` dans text-to-speech plugin : warning du plugin communautaire
