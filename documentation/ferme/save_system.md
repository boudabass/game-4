# 💾 Save System — Elsass Farm
Ce module gère la persistance via le pont `window.GameSystem`.
Le jeu ne connaît PAS le backend, ni l'API REST, ni le localStorage. Il délègue tout au Hub.

## 1. Modèle de Données (JSON)
L'objet `GameSave` est un snapshot complet de l'état du jeu.

```javascript
const GameSave = {
  meta: {
    version: "1.0",
    timestamp: 1715620000
  },
  player: {
    gold: 500,
    energy: 100,
    maxEnergy: 100,
    position: "farm_nord" // ID de la scène
  },
  time: {
    day: 1,
    season: "spring", // spring, summer, autumn, winter
    year: 1,
    hour: 6
  },
  inventory: {
    seeds: [ {id: "potato", qty: 5}, null, ... ], // 16 slots fixes
    tools: [ {id: "hoe", level: 1}, ... ],
    loot:  [ {id: "wood", qty: 12}, ... ]
  },
  farm_nord: {
    // Tableau plat de 100 cases (10x10)
    // state: 0 (vide), 1 (planté), 2 (pousse), 3 (prêt)
    tiles: [
      { id: 0, state: 1, crop: "potato", watered: true },
      // ... 99 autres
    ]
  },
  flags: {
    tutorial_done: true,
    met_marcel: false
  }
};
```

## 2. Intégration GameSystem (Spec)
Le jeu s'attend à ce que `system.js` expose les méthodes suivantes.
*(Si elles n'existent pas encore dans system.js, elles devront être ajoutées)*.

### Sauvegarder (Fin de journée)
```javascript
function saveGame() {
    // 1. Construire l'objet
    const data = buildSaveObject();
    
    // 2. Envoyer au Hub
    if (window.GameSystem && window.GameSystem.Save) {
        window.GameSystem.Save.write(data)
            .then(() => UIManager.showNotif("Sauvegarde OK"))
            .catch(err => UIManager.showNotif("Erreur Save"));
    } else {
        console.warn("GameSystem Save module not found");
        // Fallback dev local uniquement
        localStorage.setItem('elsass_farm_dev', JSON.stringify(data));
    }
}
```

### Charger (Démarrage)
```javascript
async function loadGame() {
    if (window.GameSystem && window.GameSystem.Save) {
        const data = await window.GameSystem.Save.read();
        if (data) {
            applySaveObject(data);
            return true;
        }
    }
    // Si pas de save ou erreur, nouvelle partie
    initNewGame();
    return false;
}
```

## 3. Moments de Sauvegarde
1.  **Dormir (Lit) :** Sauvegarde complète OBLIGATOIRE.
2.  **Quitter (Menu) :** Sauvegarde contextuelle (optionnelle, v1.1).
3.  **Auto-save (Dev) :** Peut être activé en mode debug toutes les minutes.

## 4. Règles de Sécurité
*   Le jeu ne valide pas le checksum (c'est le rôle du Hub).
*   Le jeu doit être robuste aux données manquantes (si une version ajoute un champ, le load doit mettre une valeur par défaut).