# 🧩 Overview — Similitude (Mode Puzzle Match-3)

Jeu de puzzle basé sur la grille, où le joueur déplace des items pour créer des alignements de 3 ou plus (match-3).

## 🗺️ Architecture Systèmes

Le jeu utilise l'architecture modulaire standard (p5.js + DOM Overlay) sans la complexité de la caméra d'Elsass Farm.

```text
   GameSystem Hub (system.js)
          ↕
┌─────────────────────────────┐
│   Core Engine (sketch.js)   │
│  Input / États / Rendu      │
└──────────────┬──────────────┘
               │
   ┌───────────┴───────────┐
   ▼                       ▼
Rendering (p5.js)      UI Layer (DOM)
- Grille Items         - HUD (Score/Chrono/Énergie)
- Effets de fusion     - Modales (Menu/Game Over)
```

## 🎯 Progression & Objectif

*   **Objectif :** Atteindre le score le plus élevé possible avant que le temps (`Chrono`) ou l'énergie (`Énergie`) ne s'épuisent.
*   **Core Loop :** Clic 1 (Sélection) → Clic 2 (Déplacement vers case vide) → Fusion → Gravité/Spawn.
*   **Contrainte :** L'énergie limite le nombre de mouvements.

## 🛠️ Tech Stack

*   **Moteur :** p5.js + p5play v3 (utilisé uniquement pour l'initialisation et les utilitaires mathématiques).
*   **Vue :** Grille 2D centrée sur l'écran.
*   **Input :** Tap/Clic simple (pas de drag pour le monde).
*   **UI :** HTML/CSS Overlays (HUD, Modales).

## ✅ Règles Absolues

1.  **Grille Fixe :** 9x9 par défaut (configurable).
2.  **Mouvement Libre :** Un item peut être déplacé vers n'importe quelle case vide.
3.  **Énergie = Clics :** Chaque déplacement coûte 1 ⚡ Énergie.
4.  **Pas de Sauvegarde :** Le jeu est une session unique (Arcade Mode).