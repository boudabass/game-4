# Roadmap & État du Projet : Game Center Seniors

## 🏁 État Actuel (v1.1 - Frontend Public)

L'architecture est **hybride et robuste**. La plateforme est désormais jouable avec une interface dédiée aux seniors.

### 🏗️ Architecture Validée

1.  **Données (Source Unique) :**
    *   **Moteur :** Lowdb (JSON pur).
    *   **Fichier :** `data/db.json` (Persistant via volume Docker).
    *   **Contenu :** Métadonnées des jeux (`games`) + Scores globaux (`scores`).

2.  **Fichiers de Jeux (Statique) :**
    *   **Stockage :** Dossier physique `/public/games/{jeu}/{version}/`.
    *   **Accès :** Servis statiquement par Next.js.

3.  **Le "Pont" (GameAPI) :**
    *   **Injection :** `index.html` généré par l'admin contient `window.GameAPI`.
    *   **Fonctionnement :** Appels `fetch` vers l'API Next.js `/api/scores`.

### ✅ Fonctionnalités Implémentées

#### 1. Authentification & Admin
*   [x] Page de Login (`/login`) & Protection `/admin`.
*   [x] Détection, Création, Versioning et Upload de jeux.
*   [x] Génération du fichier `index.html` (injection du pont API).

#### 2. API & Scores
*   [x] **POST /api/scores** : Sauvegarde dans Lowdb.
*   [x] **GET /api/scores** : Récupération du Top 10.

#### 3. Frontend Public ("Senior First")
*   [x] **Accueil (`/`)** : Grille de jeux lisible, affichage des meilleurs scores.
*   [x] **Zone de Jeu (`/play/[id]`)** : Mode plein écran immersif (iframe) avec bouton de sortie sécurisé.

### 🐳 Infrastructure Docker

*   **Volumes :** `data` (JSON) et `games` (Fichiers) sont persistants.

---

## 📅 Prochaines Étapes (Backlog)

1.  **Gestion des Images (Prioritaire) :**
    *   Ajouter une zone d'upload spécifique pour le Thumbnail (`thumbnail.png`) dans l'Admin.
    *   Redimensionner ou optimiser les images si nécessaire.

2.  **Améliorations Admin :**
    *   Pouvoir supprimer un jeu ou une version.
    *   Éditer le "Joli Nom" et la description d'un jeu sans recréer une version.

3.  **Mode Hors-ligne (PWA) :**
    *   Rendre l'application installable sur tablette.