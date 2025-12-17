let playerX;
let playerY;
const playerSize = 40;
const playerSpeed = 5;

function setup() {
    createCanvas(800, 600);
    noStroke();
    
    // Position initiale du joueur au centre
    playerX = width / 2;
    playerY = height / 2;
}

function draw() {
    background(50); // Fond gris foncé

    // --- Logique de mouvement (Clavier) ---
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Gauche ou A
        playerX -= playerSpeed;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Droite ou D
        playerX += playerSpeed;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { // Haut ou W
        playerY -= playerSpeed;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { // Bas ou S
        playerY += playerSpeed;
    }
    
    // Limites de l'écran
    playerX = constrain(playerX, playerSize / 2, width - playerSize / 2);
    playerY = constrain(playerY, playerSize / 2, height - playerSize / 2);
    // --------------------------------------

    // Affichage du joueur (cercle bleu)
    fill(0, 100, 255);
    ellipse(playerX, playerY, playerSize);
}