// Dimensions du canvas p5.js (doit correspondre à la taille du jeu)
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 800;

// Position de la grille Ferme Nord (centrée)
const GRID_SIZE = Config.farm.gridSize;
const TILE_SIZE = Config.farm.tileSize;
const GRID_WIDTH = GRID_SIZE * TILE_SIZE;
const GRID_HEIGHT = GRID_SIZE * TILE_SIZE;
const GRID_X = (GAME_WIDTH - GRID_WIDTH) / 2;
const GRID_Y = (GAME_HEIGHT - GRID_HEIGHT) / 2;

function setup() {
    // Le canvas doit être créé à la taille définie dans la DB
    createCanvas(GAME_WIDTH, GAME_HEIGHT);
    
    // Configuration p5.play (même si on ne l'utilise pas encore beaucoup)
    world.gravity.y = 0; // Pas de gravité pour un jeu top-down
    
    if(window.GameSystem) {
        window.GameSystem.Lifecycle.notifyReady();
    }
}

function draw() {
    background(Config.colors.background);
    
    // Dessin de la grille Ferme Nord (10x10)
    drawFermeNord();
    
    // Affichage du temps (pour debug)
    drawDebugTime();
}

function drawFermeNord() {
    push();
    translate(GRID_X, GRID_Y);
    
    // Cadre
    noFill();
    stroke(Config.colors.platform);
    strokeWeight(4);
    rect(0, 0, GRID_WIDTH, GRID_HEIGHT);
    
    // Grille 10x10
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            // Dessin de la tile (terre vide)
            fill(50 + (i + j) * 2); // Variation de couleur pour la terre
            noStroke();
            rect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            
            // Lignes de grille
            stroke(Config.colors.platform);
            strokeWeight(1);
            line(i * TILE_SIZE, 0, i * TILE_SIZE, GRID_HEIGHT);
            line(0, j * TILE_SIZE, GRID_WIDTH, j * TILE_SIZE);
        }
    }
    
    pop();
}

function drawDebugTime() {
    fill(Config.colors.text);
    textSize(16);
    textAlign(LEFT, TOP);
    text(`Game ID: ${window.DyadGame.id}`, 10, 10);
    text(`Time: 06:00 (Day 1)`, 10, 30);
    text(`Energy: 100`, 10, 50);
}

function windowResized() {
    // Pas de redimensionnement pour l'instant, on garde la taille fixe
}