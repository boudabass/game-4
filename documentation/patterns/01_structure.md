# 01_structure.md
Remplacement du "Scene Manager" manuel
Ancien paradigme p5.js : gestion manuelle des états via variables globales (state = 'menu') et conditions dans draw().

Nouveau paradigme q5.js + p5play : utilisation des États de Jeu (addState()) et Scènes (scenes) intégrés à p5play.

```javascript
// ❌ AVANT (p5.js manuel)
let state = 'menu';
function draw() {
    if(state === 'menu') drawMenu();
    else if(state === 'game') gameLoop();
    else if(state === 'gameover') drawGameOver();
}

// ✅ APRÈS (q5 + p5play)
states.add('menu', { 
    start: () => console.log('Menu chargé'),
    update: drawMenu,
    draw: drawMenu 
});
states.add('game', { 
    start: () => snake = new Snake(),
    update: gameLoop,
    draw: () => { clear(); snake.show(); }
});
states.add('gameover', { 
    start: () => GameSystem.Score.submit(snake.total),
    update: () => {
        if(keyIsPressed) states.next('menu');
    }
});
states.enable = true; // Active le système d'états
```
Remplacement des listes manuelles par Groupes de Sprites
Ancien : arrays manuels + boucles for.

Nouveau : group() de p5play avec itération automatique.

```javascript
// ❌ AVANT (Snake p5.js)
let food = [];
for(let i = 0; i < 25; i++) {
    food[i] = createVector(random(width), random(height));
}
for(let f of food) {
    rect(f.x, f.y, scl);
}

// ✅ APRÈS (p5play)
let foodGroup = group(); // Groupe automatique
for(let i = 0; i < 25; i++) {
    let f = sprite(random(width), random(height), scl);
    f.color = color(255, 0, 100);
    foodGroup.add(f); // Ajout auto au groupe
}

// Rendu et mise à jour AUTOMATIQUES
foodGroup.draw(); // Une ligne !

// Collision avec le serpent (auto)
if(snake.overlaps(foodGroup)) {
    let eaten = snake.overlapping(foodGroup);
    eaten.remove(); // Suppression auto
    // Nouveau food ajouté au groupe
}
```
Flux de structure recommandé
```text
q5.setup()
├── new Canvas(windowWidth, windowHeight)
├── states.add('menu', {...})
├── states.add('game', {...})
└── states.load('menu') // Démarre sur menu

q5.draw()
├── clear() // Fond propre
├── currentScene.draw() // Auto via states
└── allSprites.draw() // Tous sprites auto

q5.update() // Optionnel, physique auto
└── World.update() // Physique + collisions
```
Bonnes pratiques vérifiées (doc officielle)
Ordre des scripts (index.html) :

```xml
<script src="https://unpkg.com/q5@3/q5.min.js"></script>
<script src="https://unpkg.com/p5play@3/build/p5play.min.js"></script>
<script>window.DyadGame = { id: 'snake-v2' };</script>
<script src="../../system/system.js"></script>
<script src="snake.js"></script>
```
Activation des systèmes :

```javascript
q5.setup = () => {
    new Canvas(800, 600);
    states.enable = true;     // États activés
    allSprites.layer = 0;     // Calque par défaut
    World.gravity.y = 0;      // Pas de gravité (Snake)
};
```
Intégration GameSystem (inchangée) :

```javascript
states.gameover = {
    start: () => {
        if(window.GameSystem) {
            window.GameSystem.Score.submit(snake.life * 100);
        }
    }
};