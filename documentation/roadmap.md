# Roadmap & État du Projet : Game Center

## 🏁 État Actuel (v2.0 - Standardisation p5play & GameSystem)

L'architecture est désormais **standardisée** autour de la stack **p5.js + p5play v3** et du **GameSystem Hub**. L'approche "le jeu s'adapte au système" a été adoptée pour plus de robustesse et de simplicité de développement.

### 🏗️ Architecture Validée

1.  **Stack de Jeu :**
    *   **Moteur :** p5.js + p5play v3.
    *   **Communication :** `GameSystem Hub` (`system.js`) pour les scores, l'UI et le cycle de vie.

2.  **Données (Source Unique) :**
    *   **Moteur :** Lowdb (JSON pur).
    *   **Fichier :** `data/db.json` (Persistant via volume Docker).
    *   **Contenu :** Métadonnées des jeux (`games`) + Scores globaux (`scores`) liés aux utilisateurs Supabase.

3.  **Fichiers de Jeux (Statique) :**
    *   **Stockage :** Dossier physique `/public/games/{jeu}/{version}/`.
    *   **Accès :** Servis statiquement par Next.js.

### ✅ Fonctionnalités Implémentées

#### 1. Authentification & Admin
*   [x] Authentification complète des joueurs via Supabase.
*   [x] Page de Login (`/login`) & Protection `/admin`.
*   [x] Gestion complète du cycle de vie des jeux (Création, Versioning, Upload, Suppression).
*   [x] Mise à jour des métadonnées (Titre, Description, Résolution).
*   [x] **Nouveau :** L'admin panel ne fait plus d'injection "magique". Il crée des squelettes de jeux standards et attend des jeux conformes au `Developer Guide`.

#### 2. API & Scores
*   [x] **POST /api/scores** : Sauvegarde sécurisée dans Lowdb, liée à l'utilisateur authentifié.
*   [x] **GET /api/scores** : Récupération du Top 10 par jeu.
*   [x] **GET /api/my-scores** : API pour le profil utilisateur.

#### 3. Frontend Joueur
*   [x] **Dashboard (`/dashboard`)** : Hub central pour les joueurs connectés.
*   [x] **Catalogue de jeux (`/games`)** : Grille de jeux lisible.
*   [x] **Zone de Jeu (`/play/[id]`)** : Lecteur de jeu avec UI système (`GameSystem`) injectée automatiquement (Menu ☰, Plein écran).
*   [x] **Profil (`/profile`)** : Historique des scores personnels.
*   [x] **Classements (`/scores`)** : Temple de la renommée global.

#### 4. Stabilisation & Standardisation
*   [x] **Refactoring Complet :** Passage à une architecture de jeu standardisée avec p5play.
*   [x] **Documentation :** Création d'un guide développeur et de patterns de développement (`documentation/patterns/`).
*   [x] **Fiabilité TypeScript :** Typage strict sur tout le backend.

### 🐳 Infrastructure Docker
*   **Volumes :** `data` (JSON) et `games` (Fichiers) sont persistants.

---

## 📅 Prochaines Étapes (Backlog)

1.  **Amélioration UI Admin :**
    *   Ajouter un feedback visuel lors de l'upload de fichiers volumineux.
    *   Prévisualisation des jeux directement depuis l'admin panel.

2.  **Fonctionnalités Joueur :**
    *   Statistiques de jeu avancées sur la page de profil.
    *   Système de "favoris" pour les jeux.

3.  **Mode Hors-ligne (PWA) :**
    *   Rendre l'application installable sur tablette pour un accès rapide.