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
    coins.collider = 'static'; // Static pour ne pas tomber, mais on utilisera overlap
    coins.color = COIN_COLOR;
    
    // --- CRÉATION DU NIVEAU ---
    // Sol
    new platforms.Sprite(WORLD_WIDTH / 2, WORLD_HEIGHT - 20, WORLD_WIDTH, 40);
    
    // Plateforme de départ
    new platforms.Sprite(400, 500, 200, 20); 
    
    // Génération procédurale de plateformes et pièces
    for(let i = 0; i < 20; i++) {
        let w = random(150, 300);
        let x = random(100, WORLD_WIDTH - 100);
        let y = random(200, WORLD_HEIGHT - 150);
        
        // Créer une plateforme
        new platforms.Sprite(x, y, w, 20);
        
        // Ajouter une pièce au dessus (1 chance sur 2)
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
    
    // 1. Mouvement
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
    
    // Interaction Pièces
    player.overlaps(coins, collectCoin);
    
    // 2. Caméra Follow
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
    
    // 3. Rendu Monde
    camera.on(); 
    allSprites.draw();
    camera.off(); 
    
    // 4. Rendu HUD
    drawHUD();
}

function collectCoin(player, coin) {
    coin.remove();
    score += 10;
}

function drawHUD() {
    push(); // Isole les changements de style
    rectMode(CORNER); // Force le mode coin pour le HUD
    
    // Fond semi-transparent (x, y, w, h, radius)
    fill(0, 150); 
    noStroke();
    rect(10, 10, 200, 70, 10); 
    
    // Texte Score
    fill(255);
    textSize(20);
    textAlign(LEFT, TOP);
    text(`Score: ${score}`, 30, 25);
    
    // Vies (Coeurs)
    fill(255, 50, 50);
    noStroke();
    for(let i = 0; i < lives; i++) {
        let x = 30 + i * 30;
        let y = 60;
        ellipse(x, y, 15);
    }
    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}