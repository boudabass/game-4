function setup() {
    createCanvas(Config.canvasWidth, Config.canvasHeight);
    
    // Configuration p5.play
    world.gravity.y = 0; // Pas de gravité (Top-down)
    
    // Signal au Hub que le jeu est prêt
    if (window.GameSystem && window.GameSystem.Lifecycle) {
        window.GameSystem.Lifecycle.notifyReady();
        console.log("✅ Elsass Farm: Ready Signal Sent");
    }
}

function draw() {
    background(Config.bgColor);
    
    // 1. Logique (Update)
    // TODO: Update Systems
    
    // 2. Rendu (Draw)
    
    // Tri de profondeur pour l'isométrique (Y-Sort)
    // Les objets plus bas (Y plus grand) sont dessinés après (devant)
    allSprites.sort((a, b) => a.y - b.y);
    
    allSprites.draw();
    
    // Debug Grille (si activé)
    if (Config.debug) {
        drawDebugGrid();
    }
}

function drawDebugGrid() {
    // Dessin simple de la grille isométrique pour repère
    stroke(255, 50);
    noFill();
    
    const cols = Config.grid.cols;
    const rows = Config.grid.rows;
    const size = Config.grid.tileSize;
    const originX = Config.grid.originX;
    const originY = Config.grid.originY;
    
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            // Conversion Iso
            // ScreenX = (x - y) * width / 2
            // ScreenY = (x + y) * height / 2
            
            // Note: p5.play gère les sprites, ici c'est juste du dessin ligne pour visualiser
            let isoX = originX + (x - y) * size;
            let isoY = originY + (x + y) * (size / 2);
            
            // Dessin d'un losange
            beginShape();
            vertex(isoX, isoY);
            vertex(isoX + size, isoY + size/2);
            vertex(isoX, isoY + size);
            vertex(isoX - size, isoY + size/2);
            endShape(CLOSE);
        }
    }
}

function touchStarted() {
    // TODO: Gestionnaire de Tap global
    // Convertir Screen X/Y -> Grid X/Y
}