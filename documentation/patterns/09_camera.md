# 09_camera.md
Caméra follow automatique (plateformeur, monde ouvert)
Configuration caméra de base (doc p5play) :

```javascript
q5.setup = () => {
    new Canvas(windowWidth, windowHeight);
    player = sprite(100, 100);
    
    // Caméra suit joueur (smooth)
    camera.follow(player, 0.1);  // 0.1 = lissage
    // camera.follow(player, 0);  // Suivi instantané (pas de décalage)
};

// Caméra bouge AUTOMATIQUEMENT chaque frame
q5.draw = () => {
    clear();
    allSprites.draw();  // Caméra appliquée auto
};
```
Zoom et scaling caméra
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
Bounds caméra (murs invisibles)
```javascript
// Monde fini (scroll limité)
camera.bounds = rect(0, 0, 2000, 1200);  // Largeur 2000px, hauteur 1200px
camera.scrollEase = 0.1;                 // Lissage scroll

// Ou bounds World (tous sprites dedans)
World.bounds = rect(0, 0, 4000, 3000);
camera.bounds = World.bounds;
```
Caméra avancée (split-screen, cinématique)
```javascript
// Split-screen 2 joueurs
camera.mode = 'horizontal';  // ou 'vertical'
camera2 = new Camera();
camera2.follow(player2);
camera2.pos.x = width * 0.5;  // Droite écran

// Cinématique (pause caméra)
camera.follow(null);         // Caméra fixe
camera.moveTo(x, y, 2);      // Déplace en 2s
camera.follow(player);       // Reprend suivi
```
Effets caméra (parallaxe, transitions)
```javascript
// Parallaxe layers (fond lent, avant rapide)
background.layer = -5;       // Caméra x0.5
decor.layer = 0;             // Caméra x1
player.layer = 5;            // Caméra x1.5

// Transition scène avec caméra
states.gameover.start = () => {
    camera.shake(20);
    camera.zoomTo(0.5, 1);   // Zoom arrière gameover
};
```
Flux caméra automatique complet
```javascript
q5.setup = () => {
    new Canvas(windowWidth, windowHeight);
    
    // World bounds (monde jeu)
    World.bounds = rect(0, 0, 4000, 3000);
    camera.bounds = World.bounds;
    
    // Suivi joueur + lissage
    camera.follow(player, 0.08);
    camera.minZoom = 0.8;
    camera.maxZoom = 2;
};

q5.draw = () => {
    clear();
    
    // CAMÉRA 100% AUTOMATIQUE :
    // - Suivi joueur
    // - Bounds respectés
    // - Zoom bounds
    // - Layers parallaxe
    
    allSprites.draw();
};
```
Debug caméra
```javascript
// Debug visible (dev)
camera.debug = true;         // Zone caméra + bounds
camera.grid = 32;           // Grille 32px

// Toggle GameSystem
window.GameSystem.debugCamera = () => {
    camera.debug = !camera.debug;
    World.debug = !World.debug;
};
```
Bonnes pratiques caméra vérifiées
Performance (un seul camera active) :

```javascript
// Éviter multiple cameras simultanées
if(player1.life > 0) camera.follow(player1);
else camera.follow(player2);
```
Responsive caméra :

```javascript
window.onresize = () => {
    camera.viewSize = rect(0, 0, windowWidth, windowHeight);
};
```
Intégration GameSystem (pause caméra) :

```javascript
// Menu ☰ pause → caméra fixe
window.GameSystem.pauseGame = () => {
    camera.follow(null);
    World.paused = true;
};