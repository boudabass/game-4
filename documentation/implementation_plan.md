# Plan d'Implémentation - GameSystem Standard (v2 - Q5/P5Play)

## 📌 Changement de Philosophie
**Migration Critique :** Abandon de l'approche **p5.js** au profit de **Q5.js + P5Play**.
**Nouvelle Approche :** "Le Jeu s'adapte au Système P5Play".
Chaque jeu intégré doit respecter **strictement** le standard `GameSystem` et utiliser les librairies Q5/P5Play.

## 🏗️ Architecture Standardisée

### 1. Le "Cœur" : `public/games/system/system.js`
Script unique, stable, chargé par tous les jeux.

```javascript
window.GameSystem = {
    // Info du jeu
    config: { id, version, env: 'dev'|'prod' },

    // Gestion du Score
    Score: {
        // Envoie le score au serveur (Return Promise<bool>)
        submit(value, playerName?), 
        
        // Récupère le Top 10 (Return Promise<Array>)
        getLeaderboard()
    },

    // Gestion de l'Affichage
    Display: {
        // Demande le plein écran (natif JS API)
        requestFullscreen(),
        exitFullscreen()
    },

    // Cycle de vie (Hooks pour le wrapper React)
    Lifecycle: {
        ready(), // Appelé quand le jeu a fini de charger ses assets
        pause(), // Appelé par le wrapper quand le joueur met pause
        resume()
    }
};
```

### 2. Le Contrat "Fichier Index" (`index.html`) - NOUVEAU STANDARD
Chaque jeu **DOIT** avoir cette structure minimale dans son `index.html` :

```html
<!-- 1. Configuration (Générée ou Hardcodée en Dev) -->
<script>
  window.DyadGame = { id: 'mon-jeu-v1', version: '1.0' };
</script>

<!-- 2. Chargement des Librairies (CRITIQUE) -->
<script src="https://unpkg.com/q5@3/q5.min.js"></script>
<script src="https://unpkg.com/p5play@3/build/p5play.min.js"></script>

<!-- 3. Chargement du Système (Chemin Relatif Standard) -->
<script src="../../system/system.js"></script>

<!-- 4. Jeu -->
<script src="main.js"></script>
```

## 📝 Plan d'Action

### Phase 1 : Documentation & Standard (Terminé)
*   [x] Mettre à jour `documentation/Developer_Guide.md` pour Q5/P5Play.
*   [x] Mettre à jour tous les fichiers `documentation/patterns/*.md` pour Q5/P5Play.
*   [x] Mettre à jour les analyses pédagogiques pour marquer l'architecture p5.js comme "Legacy".

### Phase 2 : Nettoyage Backend
*   **`game-manager.ts`** :
    *   Supprimer la fonction `generateIndexHtml` complexe (celle qui parse et injecte).
    *   La remplacer par une création de fichier simple (pour les nouveaux jeux) qui écrit le template standard ci-dessus (incluant Q5/P5Play).
    *   Lors de l'upload de fichier : Ne plus rien modifier. On suppose que le dév a suivi le guide.

### Phase 3 : Implémentation `system.js`
*   Coder le namespace `GameSystem` propre, en s'assurant qu'il est compatible avec l'environnement `q5.js`.
*   Ajouter des logs verbeux pour aider au débogage (`[GameSystem] Score submitted...`).

### Phase 4 : Mise à niveau des Jeux (Preuve de concept)
*   **Test-Hub** : Mettre à jour pour valider la V2.
*   **Snake** : Remplacer le jeu existant par la version Q5/P5Play pour validation.

## ✅ Critères de Succès
*   Un développeur peut lire le guide et adapter un jeu en < 10 minutes.
*   Le jeu `Snake` (version P5Play) sauvegarde son score dans `db.json`.
*   Le code backend est simplifié et maintenable.