# 💾 Save System — Elsass Farm (Hybride Synchronisé)

Architecture de persistance robuste conçue pour la performance en jeu et la portabilité entre appareils.

## 1. Philosophie "Hybride"
Le système utilise le **LocalStorage** pour la réactivité immédiate et la **Base de Données (DB)** pour la sécurité et le cross-device.

### 🔄 Cycle de Vie des Données

#### A. Démarrage (`load`)
Au lancement du jeu, l'algorithme suivant est exécuté :

1.  **Vérification Locale** : Le jeu regarde si une sauvegarde existe dans le navigateur (`localStorage`).
    *   *Si OUI* : On l'utilise immédiatement (Chargement rapide).
    *   *Si NON* (Nouveau navigateur/Cache vidé) : On interroge l'API `/api/storage`.
2.  **Synchronisation Cloud** :
    *   Si le serveur renvoie une sauvegarde, on l'écrit immédiatement dans le `localStorage` pour recréer le cache local.
3.  **Cas "Nouveau Joueur"** :
    *   Si aucune sauvegarde n'est trouvée (ni Local, ni Cloud), le jeu initialise les valeurs par défaut.
    *   Il force immédiatement une sauvegarde (`save()` + `saveToCloud()`) pour créer l'entrée utilisateur en base de données.

#### B. En Jeu (`save`)
Toutes les actions de gameplay (dormir, changer de zone) déclenchent une sauvegarde **uniquement en LocalStorage**.
*   **Fréquence** : Haute.
*   **Latence** : Zéro (Synchrone).
*   **Réseau** : Aucun appel API.

#### C. Fermeture (`quitGame` -> `saveToCloud`)
Lorsque le joueur quitte proprement via le menu :
1.  Le jeu prend l'état actuel du `localStorage`.
2.  Il envoie ce paquet JSON vers l'API `/api/storage`.
3.  La Base de Données est mise à jour.

---

## 2. Modèle de Données (JSON Unifié v1.2)

```javascript
const GameSave = {
  // Métadonnées système
  version: "1.2",
  savedAt: "2023-10-27T10:00:00.000Z",

  // État Joueur
  energy: 85,
  gold: 450,

  // Temps Universel
  day: 5,
  hour: 14,
  minute: 30,
  season: "SPRING", // SPRING, SUMMER, AUTUMN, WINTER

  // Position
  currentZoneId: "C_C", // ID de la zone active

  // Inventaire Unifié (Inventory.js)
  inventory: {
    // Les plantes servent de graines ET de récoltes
    seeds: {
        "SPRING": [
            { "id": "potato", "qty": 12 },
            { "id": "leek", "qty": 5 }
            // ... 16 slots fixes
        ],
        // ... autres saisons
    },
    // Outils avec niveaux
    tools: [
        { "id": "watering_can", "level": 1 }
        // ...
    ],
    // Ressources brutes (Bois, Pierre...)
    loot: {
        "WOOD": [ ... ],
        "STONE": [ ... ]
    }
  },

  // Monde Persistant (GridSystem.js)
  grids: {
    // Clé = ID de zone (ex: "C_C", "N_W")
    "C_C": [
      {
        "id": 0,           // Index 0-99
        "col": 0, "row": 0,
        "state": "GROWING", // EMPTY, PLANTED, GROWING, READY
        "seedType": "potato",
        "growthStage": 4,   // Jours passés (Max 10)
        "watered": true,    // Arrosé aujourd'hui ?
        "season": "SPRING"
      }
      // ... 100 tuiles
    ]
  }
};
```

---

## 3. Sécurité & Robustesse

*   **Initialisation** : Le `SaveManager` est chargé avant le jeu via `index.html` pour garantir sa disponibilité.
*   **Fallback** : Si le réseau échoue lors du chargement Cloud, le jeu ne plante pas (il démarre une nouvelle partie ou utilise le local si dispo).
*   **Protection** : `save()` est synchrone pour garantir que les données sont écrites sur le disque avant que le navigateur ne ferme le processus.