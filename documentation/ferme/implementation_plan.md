# Implementation Plan — Elsass Farm (Sim)
Objectif : Prototype "God-View" sur grille interactive.

## 📂 Structure de Fichiers (Cible)
`public/games/elsass-farm/v1/`

```text
├── index.html          # UI Layer & Loader
├── style.css           # Styling HUD
├── config.js           # Taille Monde, Couleurs
├── main.js             # Init Managers
├── sketch.js           # Loop p5.js (Draw & Camera)
│
├── core/
│   ├── GameState.js    # Data centrale (Or, XP, Unlocks)
│   ├── TimeManager.js  # Horloge Saisonnière
│   └── SaveManager.js  # I/O Hub
│
├── systems/
│   ├── GridSystem.js   # Logique Tiles (State : Arrosé/Poussé)
│   ├── InputManager.js # Gestion Clics Monde vs UI + Caméra
│   ├── Inventory.js    # Stocks (Graines, Produits)
│   └── UIManager.js    # Update DOM
│
└── entities/
    ├── Crop.js         # Sprite Culture (Statique)
    └── Building.js     # Sprite Bâtiment (Statique)
    // PAS DE PLAYER.JS
```

## 📅 Roadmap

### Phase 1 : Caméra & Grille (Semaine 1)
*   [x] **Setup :** Canvas Fullscreen + Hub.
*   [ ] **Camera :** Drag & Pan fluide (toucher/glisser).
*   [ ] **Grid System :** Afficher une grille infinie ou délimitée.
*   [ ] **Selection :** Convertir Clic Souris → Index Case (Col, Row).
*   [ ] **UI Debug :** Afficher les coordonnées de la case cliquée.

### Phase 2 : Actions de Ferme (Semaine 2)
*   [ ] **Outils :** Sélecteur d'action dans l'UI (Main, Houe, Arrosoir, Graines).
*   [ ] **Modification :** Changer l'état d'une case (Terre → Labourée → Plantée).
*   [ ] **Growth :** Logique de pousse (Timer ou Changement jour).

### Phase 3 : Économie (Semaine 3)
*   [ ] **Shop UI :** Acheter graines.
*   [ ] **Vente :** Panier de vente.
*   [ ] **Save :** Persistance de la grille complète.