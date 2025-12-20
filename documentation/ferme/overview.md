🎮 Overview — Elsass Farm (Mode Simulation)
Farming sim mobile-first type "FarmVille" / "God-Game".
Pas d'avatar visible. Le joueur est une caméra omnisciente qui interagit directement avec la grille.

🗺️ Architecture Systèmes
text
   GameSystem Hub (system.js)
          ↕
┌─────────────────────────────┐
│   Core Engine (sketch.js)   │
│  Caméra / Input / États     │
└──────────────┬──────────────┘
               │
   ┌───────────┴───────────┐
   ▼                       ▼
Rendering (p5.js)      UI Layer (DOM)
- Grille Monde         - HUD (Énergie/Or)
- Sprites Cultures     - Modales (Shop/Inv)
- Particules           - Menus

🔄 Game Loop
*   **Navigation :** Drag & Pan (Doigt/Souris) pour bouger la caméra.
*   **Action :** Tap sur une tuile → Action immédiate (Arroser/Planter/Récolter).
*   **Coût :** Chaque action coûte de l'Énergie ⚡.
*   **Temps :** Le temps avance par "Tours" ou par horloge simulée, pas par déplacement.

🎯 Progression
1.  **Gestion :** Optimiser l'espace (Grille) et les ressources (Eau/Or).
2.  **Expansion :** Acheter de nouvelles parcelles (Débloquer zones de la caméra).
3.  **Automatisation :** Placer des structures qui travaillent seules.

🛠️ Tech Stack
*   **Moteur :** p5.play v3 (Utilisé pour le rendu des sprites statiques et la caméra).
*   **Vue :** Top-Down 2D (Vue de dessus stricte).
*   **Input :** Raycasting simple (Screen X/Y → Grid Col/Row).
*   **UI :** HTML/CSS Overlays.

✅ Règles Absolues
1.  **Caméra Libre :** Le monde est plus grand que l'écran.
2.  **Tap = Action :** Pas de sélection de perso, on clique directement sur la terre.
3.  **Énergie limitante :** Le frein principal est l'énergie, pas le temps de trajet.
4.  **Sauvegarde Hub :** Persistance JSON via `window.GameSystem`.