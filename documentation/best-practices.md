# Bonnes Pratiques & Leçons Apprises - Intégration de Jeux

Ce document recense les problèmes rencontrés et les solutions standardisées pour l'intégration de nouveaux jeux (notamment p5.js) sur la plateforme.

## 1. Structure des Fichiers & Chemins
Lors de l'importation de jeux existants (ex: depuis GitHub), nous "aplatissons" souvent la structure dans un dossier unique (ex: `V1`).
*   **Problème fréquentes :** Les liens vers les assets (`<script src="./js/app.js">`, `loadImage('assets/img.png')`) cassent si les sous-dossiers sont supprimés.
*   **Bonne Pratique :**
    *   Vérifier systématiquement `index.html` pour les balises `<script>` et `<link>`.
    *   Scanner le code JS (`main.js`, `sketch.js`) pour les fonctions de chargement (`loadSound`, `loadImage`, `loadFont`).
    *   Retirer les préfixes de chemins obsolètes (ex: changer `data/sound.wav` en `sound.wav`).

## 2. Automatisation & Injection (GameAPI)
La plateforme nécessite l'objet `window.GameAPI` pour la sauvegarde des scores.
*   **Problème :** Les jeux importés écrasent souvent cet objet ou ne le contiennent pas.
*   **Solution Automatisée :** Le backend (`game-manager.ts`) est désormais capable d'injecter automatiquement ce script dans un `index.html` existant sans le détruire.
*   **Bonne Pratique :** Ne jamais écraser manuellement un `index.html` complexe. Laisser le système d'import injecter l'API.

## 3. Gestion des Assets Lourds (Audio/Vidéo)
Certains jeux (ex: "Forest") chargent plusieurs dizaines de méga-octets de données au démarrage.
*   **Problème :** L'écran de chargement de la plateforme ("Lancement de...") peut rester bloqué si le navigateur met en cache les fichiers ou si l'événement `load` de l'iframe est retardé.
*   **Bonne Pratique (Composant Client) :**
    *   Vérifier `iframe.contentDocument.readyState === 'complete'` immédiatement au montage.
    *   Toujours implémenter un **timeout de secours** (ex: 5 secondes) pour désactiver le loader plateforme et laisser la main au jeu (qui possède souvent son propre loader visuel).

## 4. Exclusion Git (Gitignore)
Le dossier `public/games` est généralement ignoré pour ne pas alourdir le repo.
*   **Bonne Pratique :** Pour travailler sur le code source d'un jeu spécifique (ex: debugging), ajouter une exception temporaire ou permanente dans `.gitignore` :
    ```gitignore
    !public/games/mon-jeu-bugge
    ```
