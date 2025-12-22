# 💾 Save System — Elsass Farm (Hybride Synchronisé)

Architecture de persistance robuste conçue pour la performance en jeu et la portabilité entre appareils.

## 1. Philosophie "Hybride"
Le système utilise le **LocalStorage** pour la réactivité immédiate et la **Base de Données (DB)** pour la sécurité et le cross-device.

### 🔄 Cycle de Vie des Données

#### A. Démarrage (`load`) - Synchronisation Robuste
Au lancement du jeu, l'algorithme suivant est exécuté pour garantir que la version la plus récente est toujours chargée :

1.  **Vérification Locale** : Le jeu récupère la sauvegarde du navigateur (`localStorage`).
2.  **Synchronisation Cloud** : Le jeu interroge l'API `/api/storage` pour obtenir la sauvegarde Cloud.
3.  **Comparaison par Horodatage** : Les champs `savedAt` (Local) et `updatedAt` (Cloud) sont comparés.
    *   **Priorité** : La sauvegarde avec l'horodatage le plus récent est chargée.
    *   **Mise en Cache** : Si la version Cloud est plus récente, elle écrase la version locale dans le `localStorage` pour maintenir le cache à jour.
4.  **Initialisation** : Si aucune sauvegarde n'est trouvée, le jeu initialise les valeurs par défaut et force une première sauvegarde Cloud.

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

## 2. UX de Chargement (LoadingManager)

Le processus de chargement est désormais explicite et visuel, géré par le `LoadingManager` (50 étapes).

### 🎨 Interface
*   **Historique :** Une liste scrollable affiche chaque étape de chargement réussie (`[X/50] Message...`).
*   **Barre de Progression :** Une barre de progression visuelle (50 pas) est affichée sous l'historique.
*   **Démarrage :** Le jeu p5.js ne démarre pas tant que l'utilisateur n'a pas cliqué sur le bouton **JOUER** (affiché après la fin du chargement).

### ⚙️ Séquence de Chargement (50 Pas)
Le `LoadingManager` est appelé à chaque étape clé, garantissant que l'utilisateur suit la progression réelle :

| Étape | Description (Exemple) |
| :--- | :--- |
| 1-7 | Initialisation des Managers (GameState, TimeManager, GridSystem, etc.) |
| 8 | Vérification du cache local... |
| 9 | Interrogation de la sauvegarde Cloud... |
| 10 | Analyse des données de persistance... |
| 11 | Application des données de la source [LOCAL/CLOUD]... |
| 12-49 | Finalisation des systèmes, préparation du rendu, chargement des assets (marge pour futur contenu). |
| 50 | Chargement terminé. Prêt à jouer. |

---

## 3. Modèle de Données (JSON Unifié v1.3)

```javascript
const GameSave = {
  // Métadonnées système
  version: "1.3", // Version de la structure de sauvegarde
  savedAt: "2023-10-27T10:00:00.000Z", // Horodatage pour la comparaison (Local/Cloud)

  // État Joueur
  energy: 85,
  gold: 450,
  // ... (Temps, Position)

  // Inventaire Unifié (Inventory.js)
  inventory: {
    // ... (seeds, tools, loot)
  },

  // Monde Persistant (GridSystem.js)
  grids: {
    // ... (grilles par zone)
  }
};