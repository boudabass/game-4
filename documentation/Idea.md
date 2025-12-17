# Cahier des Charges - Game Center Seniors (Architecture Standardisée)

## 🎯 Objectif
Plateforme ludique pour seniors avec une architecture centralisée et standardisée.
**Règle d'Or : TOUTES les données (Métadonnées des jeux + Scores des joueurs) sont stockées EXCLUSIVEMENT dans Lowdb (`data/db.json`).**

## 🏗️ Architecture Technique

### Stack de Jeu
*   **Moteur de rendu :** p5.js
*   **Moteur physique & sprites :** p5play v3
*   **Communication :** GameSystem Hub (`system.js`)

### Stockage (Source de Vérité Unique)
*   **Base de données :** Lowdb (JSON local).
*   **Fichier :** `data/db.json` (Persistant via Docker Volume).
*   **Contenu :**
    *   `games`: Liste des jeux (releases) installés, versions, chemins, descriptions.
    *   `scores`: Historique complet des scores de tous les joueurs, lié à un `userId` Supabase.

### Flux de Données (Le "Pont")
1.  **Jeu (Client/Iframe)** : Le jeu p5.js + p5play tourne dans le navigateur.
2.  **Pont (window.GameSystem)** : `index.html` charge `system.js` qui expose l'API `GameSystem`.
3.  **Logique du jeu** : Appelle `window.GameSystem.Score.submit(score)`.
4.  **Transport** : `system.js` fait un `fetch('/api/scores')` sécurisé (avec cookie d'authentification) vers le serveur Next.js.
5.  **Serveur (API)** : Next.js reçoit la requête, valide l'utilisateur via Supabase, ouvre Lowdb, et écrit dans `data/db.json`.

**Il n'y a PAS de LocalStorage pour les données persistantes.**

## 📂 Structure des Fichiers Standard

Le serveur sert les fichiers, la DB gère les données.

```text
public/games/tetris/v1/
├── index.html     ← Fichier standard qui charge p5play et system.js.
├── main.js        ← Logique du jeu (p5play). Appelle GameSystem.Score.submit().
└── assets/        ← (Optionnel) images, sons.
```

## 🔐 Fonctionnalités & Routes

### / (Public)
*   Landing page. Redirige vers `/dashboard` si connecté.

### /dashboard (Privé)
*   Affiche la grille des jeux disponibles depuis **Lowdb**.
*   Affiche le "Meilleur Score Global" pour chaque jeu (depuis **Lowdb**).

### /play/[id] (Joueur)
*   Charge l'iframe du jeu.
*   Le jeu charge `system.js` qui injecte le menu ☰ et gère les scores.
*   À la fin de la partie, le score est envoyé dans **Lowdb** via `GameSystem`.

### /admin (Privé - Rôle Admin)
*   **Création** : Créer un dossier physique ET une entrée dans **Lowdb** (`games`).
*   **Upload** : Ajoute les fichiers `.js`, assets, etc. dans le dossier.
*   **Génération** : Peut créer un `index.html` standard pour démarrer un nouveau projet.