# 11_migration_guide.md
Guide migration p5.js → q5.js + p5play
Objectif : transformer sketches p5.js en jeux p5play en 30 minutes max.

Étape 1 : Mise à jour index.html (2 min)
```xml
<!-- ❌ AVANT (p5.js) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js"></script>
<script src="snake.js"></script>

<!-- ✅ APRÈS (q5 + p5play) -->
<script src="https://unpkg.com/q5@3/q5.min.js"></script>
<script src="https://unpkg.com/p5play@3/build/p5play.min.js"></script>
<script>window.DyadGame = { id: 'snake-p5play', version: 'v1' };</script>
<script src="../../system/system.js"></script>
<script src="snake.js"></script>
```
Étape 2 : Remplacements globaux (5 min)
| Ancien (p5.js) | Nouveau (q5 + p5play) |
|---|---|
| `createCanvas(w, h)` | `new Canvas(w, h)` |
| `setup()` | `q5.setup = () => {}` |
| `draw()` | `q5.draw = () => {}` |
| `keyPressed()` | `q5.keyPress = () => {}` |
| `createVector(x, y)` | `vec2(x, y)` |
| `background(20)` | `clear()` |

Recherche/Remplacement global :

```text
createCanvas → new Canvas
setup() → q5.setup = () =>
draw() → q5.draw = () =>
keyPressed → q5.keyPress
createVector → vec2
background → clear
```
Étape 3 : Refactorisation Snake (15 min)
```javascript
// ❌ TON SNAKE ORIGINAL (150 lignes)
class Snake { pos, vel, tail, update(), death()... }

// ✅ SNAKE P5PLAY (25 lignes)
q5.setup = () => {
    new Canvas(windowWidth, windowHeight);
    frameRate(10);
    
    snake = sprite(width/2, height/2, scl);
    snake.color = color(255);
    snake.layer = 1;
    
    foodGroup = group();
    for(let i = 0; i < 25; i++) createFood();
    
    states.enable = true;
    states.load('game');
};

q5.draw = () => {
    clear();
    // PHYSIQUE/COLLISIONS 100% AUTO
    allSprites.draw();
};

q5.keyPress = () => {
    if(q5.key === 'left')  snake.vel.set(-scl, 0);
    if(q5.key === 'right') snake.vel.set(scl, 0);
    if(q5.key === 'up')    snake.vel.set(0, -scl);
    if(q5.key === 'down')  snake.vel.set(0, scl);
};

// COLLISION NOURRITURE
snake.overlaps(foodGroup, food => {
    food.remove();
    snake.life++;
    createFood();
});

// COLLISION MORT (GameSystem intact !)
snake.collides = () => {
    window.GameSystem.Score.submit(snake.life * 100);
    states.next('gameover');
};

function createFood() {
    let f = sprite(random(width), random(height), scl);
    f.color = color(255, 0, 100);
    f.layer = 0;
    foodGroup.add(f);
}
```
Étape 4 : Ajout états (5 min)
```javascript
states.add('menu', {
    draw: () => {
        clear();
        textAlign(CENTER);
        text('SNAKE v2 - ENTER pour jouer', width/2, height/2);
    },
    update: () => {
        if(q5.key === 'enter') states.next('game');
    }
});

states.add('gameover', {
    start: score => {
        // GameSystem déjà appelé dans collision
    },
    draw: () => {
        clear();
        text(`GAME OVER\nScore: ${snake.life * 100}\nR: Rejouer`, width/2, height/2);
    },
    update: () => {
        if(q5.key === 'r') states.restart();
    }
});
```
Étape 5 : Test & Debug (3 min)
```javascript
// Debug rapide (F1)
q5.keyPress = () => {
    if(q5.key === 'f1') {
        allSprites.debug = !allSprites.debug;
        camera.debug = !camera.debug;
    }
};
```
Checklist migration ✅
- [ ] `index.html` : q5 + p5play + system.js
- [ ] Remplacements globaux (`createCanvas` → `new Canvas`)
- [ ] `snake = sprite()` au lieu de `new Snake()`
- [ ] `snake.vel.set()` au lieu de `dir()`
- [ ] `snake.overlaps()` au lieu de `dist()`
- [ ] `snake.collides()` → `GameSystem.Score.submit()`
- [ ] `states.add()` pour menu/gameover
- [ ] Test : menu ☰ + scores + fullscreen