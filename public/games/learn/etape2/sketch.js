let x;
let y;
let speedX;
let speedY;
const size = 50;
let score = 0;
let gameState = "playing"; // Nouvel état de jeu

function setup() {
    createCanvas(800, 600);
    noStroke();
    
    resetGame();
}

function resetGame() {
    // Réinitialisation des variables de position et vitesse
    x = width / 2;
    y = height / 2;
    speedX = 3;
    speedY = 2;
    
    // Réinitialisation du score et de l'état
    score = 0;
    gameState = "playing";
}

function draw() {
    background(50); // Rafraîchissement du fond

    if (gameState === "playing") {
        // 1. Mise à jour de la position
        x += speedX;
        y += speedY;

        // 2. Détection et rebond des bords
        if (x > width - size / 2 || x < size / 2) {
            speedX *= -1;
        }
        if (y > height - size / 2 || y < size / 2) {
            speedY *= -1;
        }
        
        // 3. Zone mortelle (centre 200x200)
        const centerW = 200;
        const centerH = 200;
        const centerRectX = width / 2;
        const centerRectY = height / 2;
        
        // Affichage de la zone mortelle
        fill(150, 0, 0, 150); // Rouge transparent
        rect(centerRectX, centerRectY, centerW, centerH);
        
        // Détection de collision (carré vs zone mortelle)
        if (x + size / 2 > centerRectX - centerW / 2 &&
            x - size / 2 < centerRectX + centerW / 2 &&
            y + size / 2 > centerRectY - centerH / 2 &&
            y - size / 2 < centerRectY + centerH / 2) {
            
            gameState = "gameOver";
        }

        // 4. Affichage du carré
        fill(255, 100, 0); // Orange
        rectMode(CENTER);
        rect(x, y, size, size);
        
        // 5. Affichage du score
        score = floor(frameCount / 60);
        fill(255);
        textSize(24);
        textAlign(LEFT, TOP);
        text("Score: " + score, 20, 20);

    } else if (gameState === "gameOver") {
        // Écran Game Over
        fill(255, 0, 0);
        textSize(60);
        textAlign(CENTER, CENTER);
        text("PERDU!", width / 2, height / 2 - 40);
        
        fill(255);
        textSize(30);
        text("Score Final: " + score, width / 2, height / 2 + 20);
        textSize(20);
        text("Appuyez sur R pour recommencer", width / 2, height / 2 + 60);
    }
}

function keyPressed() {
    // Logique de redémarrage
    if (key === 'r' || key === 'R') {
        if (gameState === "gameOver") {
            // Réinitialiser frameCount pour que le score reparte de zéro
            frameCount = 0; 
            resetGame();
        }
    }
}