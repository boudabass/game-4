let player;
let platforms;

// Dimensions du monde (plus grand que le canvas 800x600)
const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1200;

const PLATFORM_COLOR = 'gray';
const PLAYER_COLOR = 'blue';

function setup() {
    // On garde le canvas à 800x600 pour la fenêtre d'affichage
    createCanvas(800, 600);
    world.gravity.y = 25;
    
    // Définir les limites du monde pour p5.play
    allSprites.bounds = { 
        left: 0, 
        right: WORLD_WIDTH, 
        top: 0, 
        bottom: WORLD_HEIGHT 
    };
    
    // Initialisation des groupes
    platforms = new Group();
    platforms.collider = 'static';
    platforms.color = PLATFORM_COLOR;
    
    // --- CRÉATION DU NIVEAU ÉTENDU ---
    // Sol étendu
    new platforms.Sprite(WORLD_WIDTH / 2, WORLD_HEIGHT - 20, WORLD_WIDTH, 40);
    
    // Plateformes sur toute la largeur
    for(let i = 0; i < 10; i++) {
        let w = random(150, 300);
        let x = random(100, WORLD_WIDTH - 100);
        let y = WORLD_HEIGHT - 100 - (i * 100);
        new platforms.Sprite(x, y, w, 20);
    }
    
    // Création du joueur (démarre au centre du monde)
    player = new Sprite(WORLD_WIDTH / 2, WORLD_HEIGHT - 100, 30, 30);
    player.color = PLAYER_COLOR;
    player.collider = 'dynamic';
    player.rotationLock = true; 
    player.bounciness = 0;
    player.friction = 0;
    
    // --- CONFIGURATION CAMÉRA ---
    // La caméra suit le joueur avec un léger lissage (0.1)
    camera.follow(player, 0.1);
    // La caméra ne doit pas sortir des limites du monde
    camera.bounds = allSprites.bounds;
    
    if(window.GameSystem) {
        window.GameSystem.Lifecycle.notifyReady();
    }
}

function draw() {
    background(50);
    
    // 1. Mouvement du joueur
    let isGrounded = player.colliding(platforms);
    let targetSpeed = 0;
    if (kb.pressing('left')) targetSpeed = -5;
    if (kb.pressing('right')) targetSpeed = 5;

    if (isGrounded) {
        player.vel.x = lerp(player.vel.x, targetSpeed, 0.2);
        if (kb.presses('space') || kb.presses('up')) {
            player.vel.y = -12;
        }
    } else {
        player.vel.x = lerp(player.vel.x, targetSpeed, 0.05);
    }
    
    // 2. Rendu
    allSprites.draw();
    
    // 3. Debug (pour voir les limites du monde)
    // fill(255);
    // text(`Cam X: ${camera.x.toFixed(0)}`, 20, 20);
}

function windowResized() {
    // Redimensionner le canvas si la fenêtre change
    resizeCanvas(windowWidth, windowHeight);
}