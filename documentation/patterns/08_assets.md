# 08_assets.md
Chargement asynchrone d'images et sons
Méthode officielle p5play : callbacks loadImg() + loadSound().

```javascript
// ❌ AVANT (p5.js synchrone - bloque setup)
let img = loadImage('player.png');  // Bloque jusqu'au chargement

// ✅ APRÈS (p5play asynchrone)
loadImg('player.png', img => {
    let player = sprite(100, 100);
    player.img = img;              // Assignation post-chargement
    player.anis.frameSize = 64;
    player.ani.play('idle');
    states.next('game');           // Démarre jeu après assets
});

// Sons
loadSound('jump.mp3', sound => {
    jumpSound = sound;
});
```
Chargement JSON (niveaux, configs)
```javascript
// Niveaux depuis JSON
loadJSON('levels.json', data => {
    data.levels.forEach(level => {
        let enemy = sprite(level.x, level.y);
        enemy.type = level.type;
        enemiesGroup.add(enemy);
    });
});

// Config jeu
loadJSON('config.json', config => {
    World.gravity = vec2(0, config.gravity);
    allSprites.tileSize = config.tileSize;
});
```
Sprites responsive (échelles automatiques)
```javascript
// Responsive auto
let player = sprite(width/2, height/2);
player.img = 'player.png';
player.scale = min(width/800, height/600);  // Garde ratio

// Sprite sheet responsive
player.anis.frameSize = 64 * player.scale;
```
Assets optimisés (pré-chargement)
```javascript
q5.preload = () => {
    // Pré-charge TOUS les assets AVANT setup
    loadImg('player.png');
    loadImg('enemy.png');
    loadSound('music.mp3');
    loadJSON('levels.json');
};

q5.setup = () => {
    // Assets DISPONIBLES immédiatement
    player.img = images.player;
    music = sounds.music;
    music.loop();
};
```
Gestion des assets manquants
```javascript
// Fallback couleur si image manquante
loadImg('player.png', img => {
    if(img) player.img = img;
    else {
        player.color = color(255, 0, 100);  // Rose par défaut
        console.warn('player.png manquant');
    }
});

// Assets groupés
let assets = {
    player: 'player.png',
    enemy: 'enemy.png',
    bg: 'background.jpg'
};

Object.entries(assets).forEach(([key, path]) => {
    loadImg(path, img => images[key] = img);
});
```
Flux assets complet (jeu production)
```javascript
q5.preload = () => {
    loadImg('snake.png');
    loadImg('food.png');
    loadJSON('snake-levels.json');
};

q5.setup = () => {
    new Canvas(windowWidth, windowHeight);
    
    // Assets prêts
    snake.img = images.snake;
    foodGroup.forEach(f => f.img = images.food);
    
    states.load('menu');
};

// Utilisation dans scène
states.game.start = () => {
    snake.ani.play('move');  // Animation prête
};
```
Bonnes pratiques assets vérifiées
Organisation dossiers :

```text
public/games/snake/
├── index.html
├── snake.js
├── assets/
│   ├── snake.png
│   ├── food.png
│   └── levels.json
```
Cache assets (évite re-téléchargements) :

```javascript
// q5 cache automatiquement
loadImg('snake.png');  // 1er appel = télécharge
loadImg('snake.png');  // 2e appel = cache
```
Intégration GameSystem :

```javascript
// Assets → leaderboard avec icônes
states.gameover.draw = () => {
    let scores = await window.GameSystem.Score.getLeaderboard();
    scores.forEach((s, i) => {
        image(images.trophy, 50, 50 + i*30);  // Icône
        text(s.score, 100, 50 + i*30);
    });
};
```
Performance WebGL (q5) :

```javascript
// q5 optimise textures auto
new Canvas(windowWidth, windowHeight, 'webgl');  // GPU acceleration