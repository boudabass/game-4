# 🚀 Patterns : Sprites Avancés & Effets

## Animations sprite sheets (walk cycles, explosions)
### Configuration animation (p5play v3) :

```javascript
// Chargement sprite sheet
preload = () => {
    loadImage('player.png');
};

function setup() {
    let player = new Sprite(100, 100);
    player.img = 'player.png';
    
    // Définition frames (colonne x ligne)
    player.frameSize = 64;  // 64x64 par frame
    player.addAni('idle', [0, 1, 2], 0.2);
    player.addAni('run', [3, 4, 5, 6], 0.1);
    player.ani = 'idle';  // Démarre animation
}

// Contrôle
function draw() {
    if(keyIsDown(RIGHT_ARROW)) {
        player.ani = 'run';
        player.mirrorX = false;
    }
}
```

## Debug et hitbox visuelle
```javascript
// Debug activable
player.debug = true;           // Hitbox + vecteurs
player.width = 15;             // Hitbox personnalisée
camera.debug = true;           // Zone caméra

// Toggle GameSystem
window.GameSystem.debugSprites = () => {
    allSprites.debug = !allSprites.debug;
};
```

## Système de layers (ordre rendu)
```javascript
// Layers hiérarchiques
background.layer = -10;    // Fond
enemies.layer = 0;         // Ennemis
player.layer = 1;          // Joueur
ui.layer = 10;             // Interface

// Dynamique
explosion.layer = 5;
```

## Friction et physique fine
```javascript
// Propriétés physiques
player.friction = 0.85;    // Ralentissement
player.bounce = 0.3;       // Rebond
player.mass = 2;           // Poids

// Forces
player.force(0, -5);       // Saut
```

## Sprites avancés (particules, effets)
```javascript
// Générateur particules
function explosion(x, y) {
    for(let i = 0; i < 20; i++) {
        let p = new Sprite(x, y);
        p.life = 60;               // Mort auto 1s
        p.vx = random(-5,5);
        p.vy = random(-5,5);
        p.friction = 0.95;
        p.color = color(random(255), random(255), 0);
        p.scale = random(0.5, 1.5);
    }
}

// Sprite text (score pop-up)
let scorePop = new Sprite(x, y);
scorePop.text = '+100';
scorePop.life = 90;
scorePop.vy = -2;
scorePop.color = '#ffff00';
```

## Configuration sprite complète (plateformeur)
```javascript
let player = new Sprite(100, 100, 'dynamic');
player.img = 'player.png';
player.frameSize = 32;
player.addAni('idle', [0,1], 0.3);
player.addAni('run', [2,3,4], 0.1);
player.layer = 1;
player.debug = false;
player.maxSpeed = 5;
player.friction = 0.8;
player.collider = 'dynamic';
```

## Bonnes pratiques sprites avancés
### Performance layers :

```javascript
let uiGroup = new Group();
uiGroup.layer = 10;
```

### Pool de sprites :

```javascript
let bulletPool = new Group(50);  // Pré-créé
function shoot() {
    let bullet = bulletPool.getFirstAlive();
    bullet.life = 120;
}
```

### Intégration GameSystem :

```javascript
player.collides(enemies, function(enemy) {
    explosion(player.x, player.y);
    window.GameSystem.Score.submit(-100);
});