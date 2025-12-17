# 🎛️ Patterns : Entrées, Audio & Intégration (Standard Q5/P5Play)

Ce guide couvre les interactions avec le joueur et le système central (Hub) en utilisant les méthodes standardisées de Q5/P5Play.

## 1. Gestion des Entrées (Inputs)

P5Play simplifie la gestion des inputs en les intégrant directement aux sprites ou en utilisant les fonctions de `q5.js`.

### Clavier & Souris (q5.js)
Utilisez les fonctions de rappel de `q5.js` pour les événements globaux.

```javascript
// Déclenchement unique à l'appui
q5.keyPress = () => {
    if (q5.key === ' ') player.fire();
};

// Déclenchement continu (pour le mouvement)
q5.draw = () => {
    if (q5.keyIsDown('up')) player.vel.y = -5;
    // ...
};
```

### Inputs intégrés aux Sprites (P5Play)
P5Play permet de vérifier l'état des touches directement sur le sprite.

```javascript
// Dans q5.draw()
if (kb.pressing('left')) {
    player.move(5, 'left');
}
```

## 2. Audio

L'intégration audio doit utiliser les méthodes de chargement asynchrone de Q5.js ou des librairies externes si nécessaire.

```javascript
// Exemple de chargement audio (méthode Q5/P5Play)
let jumpSound;

q5.preload = () => {
    jumpSound = loadSound('assets/jump.mp3');
}

function jump() {
    if (jumpSound) {
        jumpSound.play();
    }
}
```

## 3. Intégration Système (Hub)

Tous nos jeux doivent communiquer avec `window.GameSystem`.

### Configuration (index.html)
C'est le contrat d'entrée.

```html
<script>
    window.DyadGame = { id: 'mon-jeu-v1', version: '1.0' };
</script>
<script src="https://unpkg.com/q5@3/q5.min.js"></script>
<script src="https://unpkg.com/p5play@3/build/p5play.min.js"></script>
<script src="../../system/system.js"></script>
```

### Sauvegarde du Score
Dès la fin de partie, envoyez le score.

```javascript
function gameOver() {
    // Utiliser les états de jeu P5Play pour gérer la fin de partie
    // ...
    
    // Sauvegarde en arrière-plan
    if (window.GameSystem) {
        window.GameSystem.Score.submit(score);
    }
}
```

### Récupérer les meilleurs scores (Leaderboard)

```javascript
// async getLeaderboard() -> Array<{ playerName, score, date }>
const highScores = await window.GameSystem.Score.getLeaderboard();
console.log(highScores[0]); // Affiche le meilleur score