# 💾 Save System — Elsass Farm
Stockage de l'état de la simulation.

## 1. Modèle de Données (JSON Unifié v2)

```javascript
const GameSave = {
  meta: {
    version: "1.1",
    timestamp: 1715620000
  },
  // État Global
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
  // Stocks UNIFIÉS
  inventory: {
    // Les clés sont les IDs uniques (potato, carrot...)
    // Plus de distinction seeds/produce.
    plants: { 
        "potato": 5, // Sert à planter ET à vendre
        "carrot": 0,
        "corn": 12
    },
    // Matériaux de construction / Mine
    resources: { 
        "wood": 50, 
        "stone": 20 
    },
    // Outils (avec niveau)
    tools: {
        "hoe": 1,
        "watering_can": 2
    }
  },
  // Le Monde (Grille)
  world: {
    // Key = "col_row" (ex: "10_15")
    tiles: {
      "10_15": { 
          state: "growing", 
          plantId: "potato", // ID référence l'inventaire
          growth: 4, 
          watered: true 
      }
    }
  },
  unlocks: {
    zones: ["start_zone", "forest_entry"]
  }
};