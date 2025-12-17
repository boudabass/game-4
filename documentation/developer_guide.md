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

**ATTENTION : Nous n'utilisons PLUS p5.js seul. Utilisez q5.js et p5play.**

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
    <script src="../../system/system.js"></script>

    <!-- 4️⃣ TON JEU -->
    <script src="main.js"></script>
</body>
</html>
```

## 3. L'API `GameSystem` et la Boucle de Jeu

Une fois le système chargé, tu as accès à l'objet global `window.GameSystem`.

### Boucle de Jeu (q5.js)
La boucle de jeu est désormais définie par `q5.setup` et `q5.draw`.

```javascript
// main.js
q5.setup = () => {
    // Crée la zone de dessin (Canvas)
    new Canvas(windowWidth, windowHeight); 
    // Initialisation des sprites et groupes
    // ...
};

q5.draw = () => {
    clear(); // Nettoie l'écran
    // La logique de p5play (mouvement, collisions) est gérée automatiquement
};
```

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
```

---

## ⚠️ Règles Importantes
1.  **Librairies :** Utiliser **q5.js** et **p5play**. Oubliez l'utilisation de `p5.js` seul.
2.  **Pas de Backend Custom :** Ton jeu doit être 100% statique (JS/HTML/CSS).
3.  **Chemins Relatifs :** Utilise toujours `./assets/image.png`, jamais `/games/mon-jeu/...`.
4.  **Propreté :** N'utilise pas `localStorage` pour les données critiques. Utilise `GameSystem.Score`.