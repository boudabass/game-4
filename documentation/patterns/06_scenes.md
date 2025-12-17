# 06_scenes.md
Remplacement du "Scene Manager" manuel
Ancien paradigme p5.js : variables globales `let state = 'menu'` + conditions dans `draw()`.

Nouveau paradigme p5play : système `states.add()` + `scenes.load()` intégré.

```javascript
// ❌ AVANT (p5.js manuel)
let state = 'menu';
function draw() {
    if(state === 'menu') menuDraw();
    else if(state === 'game') gameDraw();
    else if(state === 'gameover') gameoverDraw();
}

// ✅ APRÈS (p5play states - 3 lignes de config)
states.add('menu', {
    start: () => console.log('Menu chargé'),
    update: menuUpdate,
    draw: menuDraw
});
states.add('game', {
    start: () => { snake = new Snake(); score = 0; },
    update: gameUpdate,
    draw: gameDraw
});
states.add('gameover', {
    start: () => window.GameSystem.Score.submit(score),
    update: () => { if(q5.keyIsDown('enter')) states.next('menu'); }
});
states.enable = true;  // Active le système
states.load('menu');   // Démarre sur menu
```
Structure d'une scène complète
```javascript
states.add('game', {
    // Exécuté UNE FOIS au chargement
    start: () => {
        snake = sprite(width/2, height/2, scl);
        foodGroup.clear();  // Nettoie anciens sprites
        createFood(25);
    },
    
    // Exécuté CHAQUE FRAME (60fps)
    update: () => {
        // Logique de jeu
        checkCollisions();
        updateUI();
    },
    
    // Exécuté CHAQUE FRAME (rendu)
    draw: () => {
        clear();
        allSprites.draw();
        drawScore();
    }
});
```
Transitions entre scènes
```javascript
// Navigation simple
states.next('gameover');     // Suivant dans l'ordre
states.previous('menu');     // Précédent
states.load('game');         // Charge directe

// Conditions typiques
if(snake.collides(tailGroup)) {
    states.next('gameover'); // Auto via callback collision
}

// Restart rapide
if(q5.key === 'r') states.restart();  // Relance même scène
```
Scènes avec sous-états (Game Over menu)
```javascript
states.add('gameover', {
    props: { finalScore: 0 },  // Données partagées
    
    start: (score) => {
        states.gameover.finalScore = score;
        window.GameSystem.Score.submit(score);
    },
    
    draw: () => {
        clear();
        textAlign(CENTER);
        text(`Game Over! Score: ${states.gameover.finalScore}`, width/2, height/2);
        text('ENTER: Menu  R: Restart', width/2, height/2 + 40);
    },
    
    update: () => {
        if(q5.key === 'enter') states.load('menu');
        if(q5.key === 'r') states.restart();
    }
});
```
Flux automatique des scènes
```javascript
q5.setup = () => {
    new Canvas(windowWidth, windowHeight);
    // États configurés ici
    states.enable = true;
    states.load('menu');
};

q5.draw = () => {
    // 100% AUTOMATIQUE
    // currentScene.update() → currentScene.draw()
    // Pas de conditions manuelles !
};
```
Bonnes pratiques vérifiées (doc p5play)
Ordre de chargement :

```javascript
states.add('menu', {...});     // 1er = menu par défaut
states.add('game', {...});
states.add('gameover', {...});
states.load('menu');
```
Nettoyage automatique :

```javascript
states.game.start = () => {
    allSprites.clear();  // Supprime TOUS sprites anciens
    // Crée nouveaux sprites
};
```
Props partagées (scores globaux) :

```javascript
states.add('menu', {
    props: { highScore: 0 },  // Persiste entre scènes
    draw: () => text(`Best: ${states.menu.highScore}`)
});
```
Intégration GameSystem :

```javascript
states.gameover.start = (score) => {
    window.GameSystem.Score.submit(score);
    states.gameover.finalScore = score;
};
```
Debug scènes
```javascript
// Toggle debug states
q5.keyPress = () => {
    if(q5.key === 'f1') {
        console.log('Current:', states.current.name);
        console.log('Next:', states.next.name);
    }
};