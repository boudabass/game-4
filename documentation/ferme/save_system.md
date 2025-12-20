# 💾 Save System — Elsass Farm
Stockage de l'état de la simulation.

## 1. Modèle de Données (JSON)

```javascript
const GameSave = {
  meta: {
    version: "1.0",
    timestamp: 1715620000
  },
  // État Global Joueur (Gestionnaire)
  manager: {
    gold: 500,
    energy: 100,
    xp: 0,
    level: 1
  },
  // Temps
  time: {
    day: 1,
    season: "spring",
    year: 1
  },
  // Stocks
  inventory: {
    seeds: { "potato": 5, "carrot": 0 },
    produce: { "potato_crop": 10 }
  },
  // Le Monde (Grille)
  // On ne sauvegarde QUE les tuiles modifiées pour économiser la place
  world: {
    // Key = "x_y" (ex: "10_15")
    tiles: {
      "10_15": { type: "soil", state: "watered", crop: "potato", growth: 1 },
      "10_16": { type: "soil", state: "dry", crop: null },
      "45_12": { type: "building", id: "barn_01" }
    }
  },
  unlocks: {
    zones: ["start_zone", "forest_entry"]
  }
};
```

## 2. Optimisation
*   La grille peut être immense (3000px).
*   On ne sauvegarde pas le tableau 2D entier.
*   On utilise une `Map` ou un Objet indexé par coordonnées `"col_row"` pour ne stocker que ce qui n'est pas de l'herbe par défaut.