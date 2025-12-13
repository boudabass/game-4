# Plan d'Action : Mise à niveau Game Center

Ce document détaille les étapes techniques pour transformer le template de base en "Game Center" robuste, sécurisé et persistant.

## Étape 1 : Architecture de Données (LowDB)
**Objectif :** Adapter la structure JSON pour stocker les métadonnées des jeux et les scores.

1.  **Modifier `src/lib/database.ts`** :
    *   Définir l'interface `Game` :
        *   `id` (string)
        *   `title` (string)
        *   `description` (string)
        *   `path` (string) : chemin relatif vers le dossier du jeu (ex: `games/tetris/v1`)
        *   `thumbnail` (string)
        *   `version` (string)
        *   `createdAt` (string)
    *   Définir l'interface `Score` :
        *   `id` (string)
        *   `gameId` (string)
        *   `score` (number)
        *   `playerName` (string)
        *   `date` (string)
    *   Mettre à jour l'interface principale `DbSchema` pour remplacer `examples` par `games: Game[]` et `scores: Score[]`.
    *   Mettre à jour l'initialisation `new Low(...)` avec les valeurs par défaut `{ games: [], scores: [] }`.

## Étape 2 : Migration API & Nettoyage
**Objectif :** Supprimer l'ancien routeur et préparer les endpoints API modernes (App Router).

1.  **Suppression** :
    *   Supprimer le fichier `pages/api/examples.ts`.
    *   Supprimer le dossier `pages/` (s'il est vide après suppression).
2.  **Création Structure API** :
    *   Créer le dossier `src/app/api/games/`.
    *   Créer le fichier `src/app/api/games/route.ts` (squelette pour GET et POST).
    *   Créer le dossier `src/app/api/scores/`.
    *   Créer le fichier `src/app/api/scores/route.ts` (squelette pour GET et POST).

## Étape 3 : Persistance Docker (Stockage Jeux)
**Objectif :** Assurer que les fichiers de jeux uploadés survivent au redémarrage des conteneurs.

1.  **Modifier `docker-compose.yml`** :
    *   Ajouter un volume nommé `dyad_games_files` dans la section `volumes` (top-level).
    *   Mapper ce volume dans le service `web` :
        *   `dyad_games_files:/app/public/games`
    *   *Note :* Cela permet de séparer le code de l'application (statique/build) des données utilisateurs (jeux uploadés).

## Étape 4 : Sécurité & Authentification
**Objectif :** Protéger l'accès administrateur.

1.  **Configuration** :
    *   S'assurer que les variables d'environnement Supabase sont présentes.
2.  **Middleware Next.js** :
    *   Créer un fichier `src/middleware.ts` à la racine.
    *   Configurer le matcher pour cibler `/admin/:path*`.
    *   Implémenter la vérification de session Supabase :
        *   Si session valide ➔ `next()`
        *   Si session invalide ➔ Redirect vers `/login`