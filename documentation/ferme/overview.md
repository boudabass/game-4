🎮 Overview — Elsass Farm (Architecture Validée)
Farming sim mobile-first optimisé pour l'écosystème Game Center.
Architecture : **p5.play v3** (Rendu Jeu) + **HTML/CSS Overlays** (UI) + **GameSystem Hub** (Persistance).

🗺️ Architecture Systèmes
text
   GameSystem Hub (system.js)
          ↕
┌─────────────────────────────┐
│   Core Engine (sketch.js)   │
│  Boucle Jeu / États / Time  │
└──────────────┬──────────────┘
               │
   ┌───────────┴───────────┐
   ▼                       ▼
Rendering (p5.js)      UI Layer (DOM)
- Grille 10x10         - HUD CSS (Flexbox)
- Sprites / Anim       - Modales HTML
- Caméra               - Notifications

🔄 Game Loop Journalier (16min réelles)
text
6h  🏠 Réveil (100 énergie)
8h  🌾 Farm Nord (40 tiles)
12h 🏙️ Ville (vente + graines)
14h ⛏️ Mine (2-3 étages)
16h 🏭 Ferme Sud (crafts)
20h 🍺 Taverne (quête + repos)
2h  🛌 Sleep (+8h / Save via Hub)

🎯 Progression
Découpage strict en phases de jeu pour ne pas surcharger le joueur.
HUD fixe : Énergie ⚡ | Or 💰 | Temps 🌅 | INV/MAP/MENU

🛠️ Tech Stack (Standard Etape 10)
*   **Moteur :** p5.play v3 + planck.js (Physique/Sprites)
*   **Langage :** JavaScript ES6 Modules (Pas de transpileur/Bundler)
*   **UI :** HTML/CSS natif par-dessus le canvas (position: absolute)
*   **Données :** `window.GameSystem` pour I/O (Save/Load)
*   **Assets :** 32x32px pixel-art

✅ Règles Absolues (Game Design)
1.  **Tap uniquement** (0 drag&drop, 0 clavier).
2.  **Énergie limitée** (Gestion de ressource critique).
3.  **Slots fixes** (Pas de gestion d'inventaire "Tetris").
4.  **Sauvegarde via Hub** (Jamais d'appel API direct).
5.  **Fichiers statiques** (Tout dans `public/games/elsass-farm/v1/`).