# 🎬 Patterns : Gestion des Scènes

## Remplacement du "Scene Manager" manuel
Ancien paradigme p5.js pur : variables globales `let state = 'menu'` + conditions dans `draw()`.

Nouveau paradigme p5play v3 : système `states.add()` + `states.load()` intégré.

```javascript
// ❌ AVANT (p5.js manuel)
let state = 'menu';
function draw() {
    if(state === 'menu') menuDraw();
    else if(state === 'game') gameDraw();
}

// ✅ APRÈS (p5play v3 - 3 lignes de config)
states.add('menu', {
    start: () => console.log('Menu chargé'),
    update: menuUpdate,
    draw: menuDraw
});
states.add('game', {
    start: () => { snake = new Sprite(width/2, height/2); score = 0; },
    update: gameUpdate,
    draw: () => { background(20); allSprites.draw(); }
});
states.enable = true;
states.load('menu');
```

## Structure d'une scène complète
```javascript
states.add('game', {
    // UNE FOIS au chargement
    start: () => {
        snake = new Sprite(width/2, height/2, scl);
        foodGroup.clear();  // Nettoie anciens sprites
        createFood(25);
    },
    
    // CHAQUE FRAME (60fps)
    update: () => {
        checkCollisions();
        updateUI();
    },
    
    // CHAQUE FRAME (rendu)
    draw: () => {
        background(20);
        allSprites.draw();
        drawScore();
    }
});
```

## Transitions entre scènes
```javascript
// Navigation simple
states.next('gameover');     // Suivant
states.previous('menu');     // Précédent
states.load('game');         // Direct

// Conditions typiques
if(snake.collides(tailGroup)) {
    states.next('gameover');
}

// Restart
if(key === 'r') states.restart();
```

## Scènes avec sous-états (Game Over menu)
```javascript
states.add('gameover', {
    props: { finalScore: 0 },
    
    start: (score) => {
        states.gameover.finalScore = score;
        window.GameSystem.Score.submit(score);
    },
    
    draw: () => {
        background(0);
        textAlign(CENTER);
        text(`Game Over! Score: ${states.gameover.finalScore}`, width/2, height/2);
        text('ENTER: Menu  R: Restart', width/2, height/2 + 40);
    },
    
    update: () => {
        if(key === 'Enter') states.load('menu');
        if(key === 'r') states.restart();
    }
});
```

## Flux automatique des scènes
```javascript
function setup() {
    createCanvas(windowWidth, windowHeight);
    states.add('menu', {...});
    states.add('game', {...});
    states.enable = true;
    states.load('menu');
}

function draw() {
    // 100% AUTOMATIQUE
    // currentScene.update() → currentScene.draw()
};
```

## Bonnes pratiques vérifiées (p5play v3)
**Ordre de chargement :**

```javascript
states.add('menu', {...});    // 1er = défaut
states.add('game', {...});
states.load('menu');
```

**Nettoyage automatique :**

```javascript
states.game.start = () => {
    allSprites.clear();  // Supprime TOUS sprites
};
```

**Props partagées :**

```javascript
states.menu.props = { highScore: 0 };
```

**Intégration GameSystem :**

```javascript
states.gameover.start = (score) => {
    window.GameSystem.Score.submit(score);
};
```

**Debug scènes**
```javascript
function keyPressed() {
    if(key === 'f1') {
        console.log('Scene:', states.current.name);
    }
};