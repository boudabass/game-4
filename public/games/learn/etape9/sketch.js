let player;
let platforms;
let coins;

// Dimensions du monde
const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1200;

const PLATFORM_COLOR = 'gray';
const PLAYER_COLOR = 'blue';
const COIN_COLOR = 'gold';

// Variables de jeu
let score = 0;
let lives = 3;

// Variables pour la fluidité des contrôles
let groundTimer = 0; // Coyote Time
let jumpTimer = 0;   // Jump Buffer

function setup() {
    createCanvas(800, 600);
    world.gravity.y = 25;
    
    // Limites du monde
    allSprites.bounds = { 
        left: 0, 
        right: WORLD_WIDTH, 
        top: 0, 
        bottom: WORLD_HEIGHT 
    };
    
    // Groupes
    platforms = new Group();
    platforms.collider = 'static';
    platforms.color = PLATFORM_COLOR;
    
    coins = new Group();
    coins.collider = 'static'; 
    coins.color = COIN_COLOR;
    
    // --- CRÉATION DU NIVEAU ---
    // Sol
    new platforms.Sprite(WORLD_WIDTH / 2, WORLD_HEIGHT - 20, WORLD_WIDTH, 40);
    
    // Plateforme de départ
    new platforms.Sprite(400, 500, 200, 20); 
    
    // Génération procédurale
    for(let i = 0; i < 20; i++) {
        let w = random(150, 300);
        let x = random(100, WORLD_WIDTH - 100);
        let y = random(200, WORLD_HEIGHT - 150);
        
        new platforms.Sprite(x, y, w, 20);
        
        if (random() > 0.5) {
            let coin = new coins.Sprite(x, y - 40, 20, 20);
            coin.shape = 'circle';
        }
    }
    
    // --- JOUEUR ---
    player = new Sprite(400, 400, 30, 30);
    player.color = PLAYER_COLOR;
    player.collider = 'dynamic';
    player.rotationLock = true; 
    player.bounciness = 0;
    player.friction = 0;
    
    // --- CAMÉRA INITIALE ---
    camera.x = player.x;
    camera.y = player.y;
    camera.zoom = 1;
    
    if(window.GameSystem) {
        window.GameSystem.Lifecycle.notifyReady();
    }
}

function draw() {
    background(50);
    
    // --- GESTION AVANCÉE DES SAUTS (Fluidité) ---
    
    // 1. Mise à jour des Timers
    // Si on touche le sol, on remplit le timer de "sol"
    if (player.colliding(platforms)) {
        groundTimer = 6; // Le joueur est considéré "au sol" pendant 6 frames après l'avoir quitté
    }
    // Si on appuie sur saut, on remplit le timer de "saut"
    if (kb.presses('space') || kb.presses('up')) {
        jumpTimer = 8; // La demande de saut reste valide 8 frames
    }
    
    // Décrémentation des timers
    if (groundTimer > 0) groundTimer--;
    if (jumpTimer > 0) jumpTimer--;
    
    // 2. Exécution du Saut
    // Si on a demandé un saut RÉCEMMENT et qu'on était au sol RÉCEMMENT
    if (jumpTimer > 0 && groundTimer > 0) {
        player.vel.y = -12;
        jumpTimer = 0;   // On consomme le saut
        groundTimer = 0; // On n'est plus au sol
    }

    // --- DÉPLACEMENTS ---
    
    let targetSpeed = 0;
    if (kb.pressing('left')) targetSpeed = -5;
    if (kb.pressing('right')) targetSpeed = 5;

    // On utilise groundTimer au lieu de la collision directe pour la friction aussi
    // Cela rend le mouvement plus agréable juste après un saut
    if (groundTimer > 0) {
        player.vel.x = lerp(player.vel.x, targetSpeed, 0.2);
    } else {
        player.vel.x = lerp(player.vel.x, targetSpeed, 0.05);
    }
    
    // --- RESPAWN ---
    if (player.y > WORLD_HEIGHT + 100) {
        resetPlayer();
    }
    
    // Interaction Pièces
    player.overlaps(coins, collectCoin);
    
    // --- CAMÉRA ---
    let targetCamX = player.x;
    let targetCamY = player.y;
    
    let camMinX = width / 2;
    let camMaxX = WORLD_WIDTH - width / 2;
    let camMinY = height / 2;
    let camMaxY = WORLD_HEIGHT - height / 2;
    
    targetCamX = constrain(targetCamX, camMinX, camMaxX);
    targetCamY = constrain(targetCamY, camMinY, camMaxY);
    
    camera.x = lerp(camera.x, targetCamX, 0.1);
    camera.y = lerp(camera.y, targetCamY, 0.1);
    
    // --- RENDU ---
    camera.on(); 
    allSprites.draw();
    camera.off(); 
    
    drawHUD();
}

function collectCoin(player, coin) {
    coin.remove();
    score += 10;
}

function drawHUD() {
    push(); 
    rectMode(CORNER); 
    
    fill(0, 150); 
    noStroke();
    rect(10, 10, 200, 70, 10); 
    
    fill(255);
    textSize(20);
    textAlign(LEFT, TOP);
    text(`Score: ${score}`, 30, 25);
    
    fill(255, 50, 50);
    noStroke();
    for(let i = 0; i < lives; i++) {
        let x = 30 + i * 30;
        let y = 60;
        ellipse(x, y, 15);
    }
    pop();
}

function resetPlayer() {
    lives--;
    player.x = 400;
    player.y = 400;
    player.vel.x = 0;
    player.vel.y = 0;
    
    // Si Game Over (plus de vies), on remet tout à zéro
    if (lives <= 0) {
        lives = 3;
        score = 0;
        // On pourrait recharger le niveau ici pour faire réapparaître les pièces
        // Pour l'instant on garde le niveau tel quel
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}