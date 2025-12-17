let playerX;
let playerY;
const playerSize = 40;
const playerSpeed = 5;

let targetX;
let targetY;
const targetSize = 20;
let score = 0;

function setup() {
    createCanvas(800, 600);
    noStroke();
    
    // Position initiale du joueur au centre
    playerX = width / 2;
    playerY = height / 2;
    
    respawnTarget();
}

function respawnTarget() {
    // Position aléatoire pour la cible, en évitant les bords
    targetX = random(targetSize, width - targetSize);
    targetY = random(targetSize, height - targetSize);
}

function draw() {
    background(50); // Fond gris foncé

    // --- Logique de mouvement (Clavier) ---
    // Gauche : LEFT_ARROW (37) ou A (65) ou Q (81)
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65) || keyIsDown(81)) { 
        playerX -= playerSpeed;
    }
    // Droite : RIGHT_ARROW (39) ou D (68)
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { 
        playerX += playerSpeed;
    }
    // Haut : UP_ARROW (38) ou W (87) ou Z (90)
    if (playerY > playerSize / 2 && (keyIsDown(UP_ARROW) || keyIsDown(87) || keyIsDown(90))) { 
        playerY -= playerSpeed;
    }
    // Bas : DOWN_ARROW (40) ou S (83)
    if (playerY < height - playerSize / 2 && (keyIsDown(DOWN_ARROW) || keyIsDown(83))) { 
        playerY += playerSpeed;
    }
    
    // Limites de l'écran (déjà gérées par les conditions ci-dessus, mais on garde le constrain pour la sécurité)
    playerX = constrain(playerX, playerSize / 2, width - playerSize / 2);
    playerY = constrain(playerY, playerSize / 2, height - playerSize / 2);
    // --------------------------------------

    // --- Affichage du joueur (cercle bleu) ---
    fill(0, 100, 255);
    ellipse(playerX, playerY, playerSize);
    
    // --- Affichage de la cible (cercle jaune) ---
    fill(255, 200, 0);
    ellipse(targetX, targetY, targetSize);
    
    // --- Affichage du score ---
    fill(255);
    textSize(24);
    textAlign(LEFT, TOP);
    text("Score: " + score, 20, 20);
}

function checkCollection(px, py) {
    // Vérifie si la position donnée (px, py) est proche de la cible
    const d = dist(px, py, targetX, targetY);
    
    // Si la distance est inférieure à la somme des rayons (collision)
    if (d < playerSize / 2 + targetSize / 2) {
        score++;
        respawnTarget();
    }
}

function mousePressed() {
    // 1. Clic souris = collision + score++
    checkCollection(mouseX, mouseY);
}

function keyPressed() {
    // 2. Espace = collision + score++
    if (key === ' ') {
        checkCollection(playerX, playerY);
    }
}