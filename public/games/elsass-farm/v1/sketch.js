function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Config Physique
    world.gravity.y = 0; 
    
    // Init Caméra
    camera.x = Config.worldWidth / 2;
    camera.y = Config.worldHeight / 2;
    camera.zoom = Config.zoom.start;
    
    if (window.GameSystem && window.GameSystem.Lifecycle) {
        window.GameSystem.Lifecycle.notifyReady();
    }
}

function draw() {
    background(Config.colors.background);
    
    // 1. Déplacement Caméra (Drag & Pan)
    if (mouseIsPressed && mouseY > 60) {
        camera.x -= (mouseX - pmouseX) / camera.zoom;
        camera.y -= (mouseY - pmouseY) / camera.zoom;
    }
    
    // 2. Contraintes Caméra (Limitation du mouvement)
    
    // Calcul des limites du monde avec la marge
    const minX = (width / 2) / camera.zoom - Config.worldMargin;
    const maxX = Config.worldWidth + Config.worldMargin - (width / 2) / camera.zoom;
    const minY = (height / 2) / camera.zoom - Config.worldMargin;
    const maxY = Config.worldHeight + Config.worldMargin - (height / 2) / camera.zoom;

    // Appliquer les contraintes
    camera.x = constrain(camera.x, minX, maxX);
    camera.y = constrain(camera.y, minY, maxY);

    // 3. Rendu Monde
    camera.on();
    
    // Dessin du monde (y compris la marge de vide)
    noFill();
    stroke(255);
    strokeWeight(2);
    
    // Dessiner le rectangle du monde réel (sans la marge)
    rect(0, 0, Config.worldWidth, Config.worldHeight);
    
    if (Config.debug) {
        drawSimpleGrid();
    }
    
    allSprites.draw();
    camera.off();
    
    // Debug Info
    if (Config.debug) {
        fill(255);
        noStroke();
        textSize(12);
        textAlign(LEFT, BOTTOM);
        text(`Zoom: ${camera.zoom.toFixed(2)} | Cam: ${Math.round(camera.x)},${Math.round(camera.y)}`, 10, height - 10);
    }
}

function mouseWheel(event) {
    if (mouseY < 60) return true;

    let zoomAmount = event.delta * Config.zoom.sensitivity;
    camera.zoom -= zoomAmount;
    
    camera.zoom = constrain(camera.zoom, Config.zoom.min, Config.zoom.max);
    
    return false;
}

function drawSimpleGrid() {
    stroke(Config.colors.gridLines);
    strokeWeight(1 / camera.zoom);
    
    for (let x = 0; x <= Config.worldWidth; x += 64) {
        line(x, 0, x, Config.worldHeight);
    }
    for (let y = 0; y <= Config.worldHeight; y += 64) {
        line(0, y, Config.worldWidth, y);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}