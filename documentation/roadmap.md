# Roadmap & État du Projet : Game Center Seniors

## 🏁 État Actuel (v1.4 - Automatisation & Robustesse)

L'architecture est **hybride, robuste et flexible**. L'interface d'administration permet une gestion complète du cycle de vie des jeux. L'importation est désormais intelligente et préserve l'intégrité des jeux originaux.

### 🏗️ Architecture Validée

1.  **Données (Source Unique) :**
    *   **Moteur :** Lowdb (JSON pur).
    *   **Fichier :** `data/db.json` (Persistant via volume Docker).
    *   **Contenu :** Métadonnées des jeux (`games` avec résolution) + Scores globaux (`scores`).

2.  **Fichiers de Jeux (Statique) :**
    *   **Stockage :** Dossier physique `/public/games/{jeu}/{version}/`.
    *   **Accès :** Servis statiquement par Next.js.

### ✅ Fonctionnalités Implémentées

#### 1. Authentification & Admin
*   [x] Page de Login (`/login`) & Protection `/admin`.
*   [x] Détection, Création, Versioning et Upload de jeux.
*   [x] Gestion complète via l'onglet "Gérer" (Liste, Suppression, Édition).
*   [x] Upload de Thumbnails et mise à jour des Métadonnées (Titre/Description).
*   [x] **Nouveau :** Ajout et gestion de la **résolution native (largeur/hauteur)** pour chaque version de jeu.
*   [x] **Nouveau :** Injection intelligente de l'API dans les `index.html` existants lors de l'import.

#### 2. API & Scores
*   [x] **POST /api/scores** : Sauvegarde dans Lowdb.
*   [x] **GET /api/scores** : Récupération du Top 10.

#### 3. Frontend Public ("Senior First")
*   [x] **Accueil (`/`)** : Grille de jeux lisible, affichage des meilleurs scores et des images de couverture.
*   [x] **Zone de Jeu (`/play/[id]`)** : Lecteur dynamique avec scaling intelligent et gestion robuste du chargement (timeout de sécurité).

#### 4. Stabilisation & Corrections
*   [x] **Correction Critique :** Fiabilisation de la sauvegarde des métadonnées.
*   [x] **Correction Affichage :** Scaling pixel-perfect et gestion des bordures.
*   [x] **Correction Import :** Support des chemins relatifs pour les jeux à structure plate (ex: Forest).
*   [x] **Fiabilité TypeScript :** Refactoring complet du backend.

### 🐳 Infrastructure Docker
*   **Volumes :** `data` (JSON) et `games` (Fichiers) sont persistants.

---

## 📅 Prochaines Étapes (Backlog)

1.  **Amélioration UI (Mineur) :**
    *   Ajouter un feedback visuel lors du chargement des fichiers volumineux.

2.  **Mode Hors-ligne (PWA) :**
    *   Rendre l'application installable sur tablette.