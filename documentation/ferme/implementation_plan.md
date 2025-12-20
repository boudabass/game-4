# Implementation Plan — Elsass Farm (Pure JS)
Objectif : Prototype jouable respectant le standard "Etape 10".

## 📂 Structure de Fichiers (Cible)
Tout réside dans `public/games/elsass-farm/v1/`.

```text
public/games/elsass-farm/v1/
├── index.html          # Point d'entrée + Chargement Libs & CSS
├── style.css           # Styles HUD & Modales (Overlay)
├── config.js           # Constantes (Couleurs, Balance, Timers)
├── main.js             # Entry point (window.onload, GameSystem init)
├── sketch.js           # Boucle p5.js (setup, draw, touchStarted)
│
├── core/
│   ├── GameState.js    # Machine à états (MENU, FARM, CITY...)
│   ├── TimeManager.js  # Horloge, Saisons, Énergie
│   └── SaveManager.js  # Bridge vers window.GameSystem
│
├── systems/
│   ├── GridSystem.js   # Logique Tiles (Nord/Sud)
│   ├── Inventory.js    # Données & Logique items
│   └── UIManager.js    # Manipulation DOM (Afficher/Cacher Divs)
│
└── entities/
    ├── Player.js       # Sprite Joueur (si visible)
    └── Crop.js         # Logique culture individuelle
```

## 📅 Roadmap (3 Phases)

### Phase 1 : Core Engine & UI (Semaine 1)
*   [ ] **Setup :** `index.html` avec chargement p5.play + `system.js`.
*   [ ] **Grid :** Affichage grille 10x10 p5.play (Sprites statiques).
*   [ ] **Interaction :** Tap tile → Changement couleur/état.
*   [ ] **UI Overlay :** HUD HTML par-dessus le canvas (Énergie, Or).
*   [ ] **Save :** Connexion basique `window.GameSystem`.

### Phase 2 : Farming Loop (Semaine 2)
*   [ ] **Inventory :** Structure de données JS (Array fixe).
*   [ ] **Logique cultures :** Arroser → Pousser (Changement jour).
*   [ ] **Time System :** Cycle Jour/Nuit simulé (Changement luminosité).
*   [ ] **Modales :** Fenêtres HTML pour Inventaire/Shop.

### Phase 3 : Contenu & Polish (Semaine 3)
*   [ ] **Ville & PNJ :** Ecrans statiques avec interaction Shop.
*   [ ] **Mine :** Mini-jeu simple (Puzzle grille).
*   [ ] **Assets :** Remplacement carrés de couleur par Sprites 32px.
*   [ ] **Audio :** Intégration p5.sound.

## 🛠️ Architecture Technique

### UI : Le pattern "DOM Overlay"
Au lieu de dessiner du texte complexe dans le Canvas (lent/moche), on utilise des `<div>` HTML positionnés en absolu.

*   `sketch.js` gère le **Monde** (Grille, Perso, Particules).
*   `UIManager.js` manipule le **DOM** (Barres de vie, Inventaire, Dialogues).
*   Communication via Events ou appels directs (`UIManager.updateEnergy(val)`).

### Sauvegarde
Le jeu maintient un objet `State` global.
Au sommeil : `window.GameSystem.Save.save('elsass-farm', State)`.
Au chargement : `State = window.GameSystem.Save.load('elsass-farm')`.