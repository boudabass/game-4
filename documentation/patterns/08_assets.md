# 🖼️ Patterns : Gestion des Assets

## Chargement d’images et de sons
p5.js gère le chargement via `preload()`, p5play réutilise ces assets pour les sprites.

```javascript
let imgPlayer, sndJump;

function preload() {
    imgPlayer = loadImage('assets/player.png');
    sndJump = loadSound('assets/jump.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    player = new Sprite(width/2, height/2, 40);
    player.img = imgPlayer;          // image assignée au sprite
}

function keyPressed() {
    if (key === ' ') {
        sndJump.play();              // son joué à l’action
    }
}
```

## Chargement JSON (niveaux, configs)
```javascript
let levelData;

function preload() {
    levelData = loadJSON('assets/levels.json');
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    enemies = new Group();
    levelData.enemies.forEach(e => {
        let enemy = new Sprite(e.x, e.y, e.size);
        enemy.color = color(255, 0, 0);
        enemies.add(enemy);
    });
}
```

## Organisation des assets
Arborescence recommandée pour chaque jeu :

```text
public/games/[slug-jeu]/v1/
├── index.html
├── main.js
└── assets/
    ├── player.png
    ├── enemy.png
    ├── tileset.png
    ├── jump.mp3
    └── levels.json
```

### Chemins dans le code :

```javascript
function preload() {
    imgPlayer = loadImage('assets/player.png');
    levelData = loadJSON('assets/levels.json');
}
```

## Optimisation et réutilisation
Placer les gros assets « globaux » dans un dossier partagé (ex. `public/games/shared/assets/`) si plusieurs jeux les utilisent.

Laisser p5 gérer le cache : un `loadImage` sur la même URL ne re-télécharge pas le fichier.

Pour les jeux simples (comme Snake), privilégier des sprites procéduraux (`color`, `width`, `height`) plutôt que des PNG si l’asset n’apporte pas grand-chose visuellement.

## Intégration avec GameSystem
Les assets servent à enrichir l’UI des écrans de menu / game over, les scores restent gérés par `system.js` :

```javascript
let trophyImg;

function preload() {
    trophyImg = loadImage('assets/trophy.png');
}

states.add('gameover', {
    draw: () => {
        background(0);
        image(trophyImg, width/2 - 32, 40, 64, 64);

        textAlign(CENTER);
        text(`Score: ${finalScore}`, width/2, 140);
    }
});