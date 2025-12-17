# 📘 Guide Développeur - Création de Jeux pour la Plateforme (Standard Q5/P5Play)

Bienvenue ! Ce guide explique comment rendre ton jeu compatible avec notre plateforme (Game Center).
Nous utilisons un système standardisé appelé **GameSystem** qui repose désormais sur **q5.js** et **p5play**.

## 1. Structure Requise

Chaque jeu doit être autonome dans son dossier. La structure minimale est :

```text
mon-jeu/v1/
├── index.html          (Point d'entrée obligatoire)
├── main.js             (Logique de ton jeu, utilisant q5/p5play)
├── thumbnail.png       (Image d'aperçu 400x300px)
├── description.md      (Description courte pour le menu)
└── assets/             (Tes images, sons, etc.)
```

## 2. Configuration (`index.html`) - CRITIQUE

Ton fichier `index.html` **doit** inclure le script de configuration ET les librairies **q5/p5play** avant tes propres scripts.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Mon Jeu</title>
    <style> body { margin: 0; overflow: hidden; background: #000; } </style>
    
    <!-- 1️⃣ CONFIGURATION OBLIGATOIRE -->
    <script>
        window.DyadGame = { 
            id: 'mon-jeu-v1',   // Doit être unique (minuscules, tirets)
            version: 'v1'       // Version du dossier
        };
    </script>

    <!-- 2️⃣ LIBRAIRIES : Q5.js et P5Play (Chemins CDN) -->
    <script src="https://unpkg.com/q5@3/q5.min.js"></script>
    <script src="https://unpkg.com/p5play@3/build/p5play.min.js"></script>

    <!-- 3️⃣ CHARGEMENT DU SYSTÈME (Ne pas modifier ce chemin) -->
    <script src="/system/system.js"></script>

    <!-- 4️⃣ TON JEU -->
    <script src="main.js"></script>
</head>
<body>
</html>
```

## 3. Mode de Rendu et Stabilité (Règle d'Or)

Pour garantir une compatibilité maximale et éviter les erreurs liées au matériel graphique (GPU), tous les jeux doivent :

1.  **Forcer q5.js en mode Canvas 2D.**
    Ajoutez cette ligne tout en haut de votre fichier de jeu principal (`main.js`).
    ```javascript
    // Force le mode de rendu 2D, compatible partout.
    q5.mode = '2d';
    ```

2.  **Limiter la cadence de rendu à 60 FPS.**
    Ajoutez cette ligne dans votre fonction `q5.setup`.
    ```javascript
    q5.setup = () => {
        new Canvas(windowWidth, windowHeight);
        frameRate(60); // Stabilise l'expérience sur tous les écrans.
        // ...
    };
    ```

## 4. L'API `GameSystem` et la Boucle de Jeu

Une fois le système chargé, tu as accès à l'objet global `window.GameSystem`.

### 🏆 Gestion des Scores

Utilise le module `GameSystem.Score` pour gérer la progression du joueur.

#### Envoyer un score
Appelle cette méthode quand le joueur perd ou termine une partie.

```javascript
// async submit(score: number, playerName?: string)
await window.GameSystem.Score.submit(1500); 

// Exemple dans un callback de collision p5play
player.collides(enemyGroup, () => {
    // Game Over
    window.GameSystem.Score.submit(player.score);
    player.remove();
    // Utiliser les états de jeu p5play pour passer à l'écran Game Over
});
```

#### Récupérer les meilleurs scores (Leaderboard)

```javascript
// async getLeaderboard() -> Array<{ playerName, score, date }>
const highScores = await window.GameSystem.Score.getLeaderboard();
console.log(highScores[0]); // Affiche le meilleur score
```

### 🖥️ Affichage & Outils

#### Mode Plein Écran
Permet de basculer le jeu en plein écran sans code complexe.

```javascript
window.GameSystem.Display.toggleFullscreen();