# 🎥 Patterns : Caméra & Monde

## Caméra follow automatique (plateformeur, monde ouvert)
### Configuration caméra de base (p5play v3) :

```javascript
function setup() {
    createCanvas(windowWidth, windowHeight);
    player = new Sprite(100, 100);
    
    // Caméra suit joueur (smooth)
    camera.follow(player, 0.1);  // 0.1 = lissage
    // camera.follow(player, 0);   // Suivi instantané
}

// Caméra bouge AUTOMATIQUEMENT chaque frame
function draw() {
    background(20);
    allSprites.draw();  // Caméra appliquée auto
}
```

## Zoom et scaling caméra
```javascript
// Zoom fluide
camera.zoomTo(2, 2);     // x2 en 2s
camera.zoomTo(1);        // Reset normal

// Zoom bounds (évite zoom excessif)
camera.minZoom = 0.5;
camera.maxZoom = 3;

// Shake caméra (explosions, hits)
camera.shake(10, 0.5);   // Intensité 10, durée 0.5s
```

## Bounds caméra (murs invisibles)
```javascript
// Monde fini (scroll limité)
camera.bounds = { 
    left: 0, 
    right: 2000, 
    top: 0, 
    bottom: 1200 
};
camera.scrollEase = 0.1;   // Lissage scroll

// Bounds World (tous sprites dedans)
allSprites.bounds = { left: 0, right: 4000, top: 0, bottom: 3000 };
camera.bounds = allSprites.bounds;
```

## Caméra avancée (split-screen, cinématique)
```javascript
// Split-screen 2 joueurs
camera.mode = 'horizontal';  // ou 'vertical'
camera2 = new Camera();
camera2.follow(player2);
camera2.pos.x = width * 0.5;

// Cinématique (pause caméra)
camera.follow(null);         // Caméra fixe
camera.moveTo(500, 300, 2);  // Déplace en 2s
camera.follow(player);
```

## Effets caméra (parallaxe, transitions)
```javascript
// Parallaxe layers
background.layer = -5;       // Caméra x0.5
decor.layer = 0;             // Caméra x1
player.layer = 5;            // Caméra x1.5

// Transition scène
states.gameover.start = () => {
    camera.shake(20);
    camera.zoomTo(0.5, 1);
};
```

## Flux caméra automatique complet
```javascript
function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // World bounds
    allSprites.bounds = { left: 0, right: 4000, top: 0, bottom: 3000 };
    camera.bounds = allSprites.bounds;
    
    // Suivi + lissage
    camera.follow(player, 0.08);
    camera.minZoom = 0.8;
    camera.maxZoom = 2;
}

function draw() {
    background(20);
    
    // CAMÉRA 100% AUTOMATIQUE
    allSprites.draw();
}
```

## Debug caméra
```javascript
// Debug visible (dev)
camera.debug = true;         // Zone caméra + bounds
camera.grid = 32;            // Grille 32px

// Toggle GameSystem
window.GameSystem.debugCamera = () => {
    camera.debug = !camera.debug;
    allSprites.debug = !allSprites.debug;
};
```

## Bonnes pratiques caméra vérifiées
### Performance (un seul camera actif) :

```javascript
if(player1.life > 0) camera.follow(player1);
else camera.follow(player2);
```

### Responsive caméra :

```javascript
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    camera.viewSize = { width: windowWidth, height: windowHeight };
}
```

### Intégration GameSystem :

```javascript
window.GameSystem.pauseGame = () => {
    camera.follow(null);  // Pause caméra
    allSprites.paused = true;
};