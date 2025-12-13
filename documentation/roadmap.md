# Roadmap & État du Projet : Game Center Seniors

## 🏁 État Actuel (v1.0 - Stable)

L'architecture est **hybride et robuste**, conçue pour fonctionner sur un serveur auto-hébergé avec Docker.

### 🏗️ Architecture Validée

1.  **Données (Source Unique) :**
    *   **Moteur :** Lowdb (JSON pur).
    *   **Fichier :** `data/db.json` (Persistant via volume Docker).
    *   **Contenu :** Métadonnées des jeux (`games`) + Scores globaux (`scores`).

2.  **Fichiers de Jeux (Statique) :**
    *   **Stockage :** Dossier physique `/public/games/{jeu}/{version}/`.
    *   **Accès :** Servis statiquement par Next.js (ou Nginx en front).
    *   **Structure :** Chaque version est isolée pour éviter les conflits de cache.

3.  **Le "Pont" (GameAPI) :**
    *   **Problème résolu :** Comment un jeu statique (iframe) parle à la base de données serveur ?
    *   **Solution :** Le fichier `index.html` est **généré dynamiquement** par l'Admin.
    *   **Injection :** Il contient un script invisible `window.GameAPI` qui expose `saveScore()` et `getHighScores()`.
    *   **Fonctionnement :** Ce script fait des appels `fetch` vers l'API Next.js `/api/scores`. Le développeur du jeu n'a pas à gérer le réseau, juste appeler la fonction JS.

### ✅ Fonctionnalités Implémentées

#### 1. Authentification
*   [x] Page de Login (`/login`) via Supabase Auth.
*   [x] Protection de la route `/admin` via Middleware.

#### 2. Administration & Import
*   [x] **Détection Automatique :** Scanne le disque pour trouver les dossiers copiés manuellement.
*   [x] **Feedback Visuel :** Distingue les jeux déjà en base (✅) des nouveaux dossiers détectés (🆕).
*   [x] **Import Idempotent :** "Créer un jeu" sur un dossier existant ne l'écrase pas, mais l'enregistre en DB.
*   [x] **Gestion des Versions :** Supporte `v1`, `v2`, etc. Trié par date de modification.

#### 3. Génération & Upload
*   [x] **Upload Fichier par Fichier :** Permet de compléter un dossier manquant via l'interface web.
*   [x] **Générateur Intelligent :** Le bouton "Générer index.html" :
    1.  Scanne tous les `.js` du dossier.
    2.  Les trie (data -> libs -> hud -> sketch).
    3.  Injecte la configuration (`gameId`) et le pont `GameAPI`.
    4.  Crée le fichier `index.html` final.

#### 4. API & Scores
*   [x] **POST /api/scores :** Reçoit `{gameId, score, playerName}` et écrit dans Lowdb.
*   [x] **GET /api/scores :** Renvoie le Top 10 pour un jeu donné.

### 🐳 Infrastructure Docker

*   **Volumes :**
    *   `/mnt/share1/apps/gamesenior/data` -> `/app/data` (Base de données).
    *   `/mnt/share1/apps/gamesenior/games` -> `/app/public/games` (Fichiers statiques).
*   **Persistance :** Les données survivent au redémarrage et à la reconstruction du conteneur.

---

## 📅 Prochaines Étapes (Backlog)

1.  **Frontend Public (`/`) :**
    *   Créer la grille des jeux pour les seniors (Grosses cartes, images).
    *   Lire `db.json` pour afficher la liste.
    *   Afficher le "Meilleur Score" sur la carte du jeu.

2.  **Page de Jeu (`/play/[gameId]`) :**
    *   Afficher l'iframe en plein écran.
    *   Gérer le bouton "Retour" (Gros bouton rouge).

3.  **Améliorations Admin :**
    *   Pouvoir supprimer un jeu (Physique + DB).
    *   Éditer le "Joli Nom" et la description d'un jeu.
    *   Uploader une image miniature pour le menu.