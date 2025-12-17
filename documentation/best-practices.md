# Bonnes Pratiques & Leçons Apprises - Développement de Jeux p5play

Ce document résume les standards à suivre pour développer des jeux robustes et performants pour la plateforme. Pour des détails techniques, consultez le dossier `documentation/patterns/`.

## 1. Stack Technique Standard
*   **Moteur :** p5.js + **p5play v3**. L'utilisation de p5play est **fortement recommandée** pour la gestion des sprites, de la physique et des scènes.
*   **Communication :** Le `GameSystem Hub` (`system.js`) est le seul point de contact avec la plateforme.

## 2. Structure de Projet
*   **Autonomie :** Chaque jeu doit être dans son propre dossier (`public/games/{nom-jeu}/{version}/`).
*   **Point d'entrée :** Un `index.html` est obligatoire et doit suivre le template standard (voir `patterns/00_environment.md`).
*   **Assets :** Les assets (images, sons) doivent être dans un sous-dossier `assets/` et appelés avec des chemins relatifs (`'assets/player.png'`).

## 3. Logique de Jeu (Patterns p5play)
*   **Sprites, pas de classes manuelles :** Utilisez `new Sprite()` pour tous les objets du jeu. Évitez de recréer des classes `Player` ou `Enemy` manuelles.
*   **Groupes pour la performance :** Utilisez `new Group()` pour gérer les collections d'objets (ennemis, tirs, nourriture). C'est plus performant et plus simple pour les collisions.
*   **Collisions intégrées :** Utilisez les méthodes `.overlaps()` et `.collides()` de p5play. N'utilisez plus `dist()` pour les vérifications manuelles.
*   **Gestion de scènes :** Utilisez le système `states.add()` de p5play pour gérer les écrans (Menu, Jeu, Game Over). C'est plus propre que des variables `let state`.

## 4. Intégration avec le GameSystem Hub
*   **Scores :** La soumission des scores se fait **uniquement** via `window.GameSystem.Score.submit(score)`. Typiquement, cela se fait dans un callback de collision ou à la transition vers l'état "Game Over".
*   **Cycle de vie :** Signalez que votre jeu est prêt en appelant `window.GameSystem.Lifecycle.notifyReady()` à la fin de votre `setup()` ou au début de votre première scène.
*   **UI :** Le menu ☰ et le bouton plein écran sont injectés automatiquement par `system.js`. N'implémentez pas les vôtres.

## 5. Gestion des Assets Lourds
*   **`preload()` est votre ami :** Chargez tous les sons et images dans la fonction `preload()` de p5.js pour garantir qu'ils sont disponibles avant le début du jeu.
*   **Timeout de sécurité :** Le lecteur de jeu de la plateforme a un timeout de 5 secondes. Si votre jeu met plus de temps à charger (ce qui est rare avec `preload`), l'écran de chargement de la plateforme disparaîtra pour laisser place au vôtre.