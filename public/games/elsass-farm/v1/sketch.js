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
    // Désactivé si clic sur UI (mouseY < 60)
    if (mouseIsPressed && mouseY > 60) {
        // On divise par le zoom pour garder une vitesse de drag constante visuellement
        camera.x -= (mouseX - pmouseX) / camera.zoom;
        camera.y -= (mouseY - pmouseY) / camera.zoom;
    }

    // 2. Rendu Monde
    camera.on();
    
    // Limites Monde
    noFill();
    stroke(255);
    strokeWeight(2);
    rect(0, 0, Config.worldWidth, Config.worldHeight);
    
    if (Config.debug) {
        drawSimpleGrid();
    }
    
    allSprites.draw();
    camera.off();
    
    // Debug Info (Temporaire)
    if (Config.debug) {
        fill(255);
        noStroke();
        textSize(12);
        textAlign(LEFT, BOTTOM);
        text(`Zoom: ${camera.zoom.toFixed(2)} | Cam: ${Math.round(camera.x)},${Math.round(camera.y)}`, 10, height - 10);
    }
}

// Gestion du Zoom (Molette)
function mouseWheel(event) {
    // Empêche le zoom si souris sur HUD
    if (mouseY < 60) return true;

    // event.delta est positif (bas) ou négatif (haut)
    let zoomAmount = event.delta * Config.zoom.sensitivity;
    
    // On inverse : molette haut = zoom in
    camera.zoom -= zoomAmount;
    
    // Contraintes (Clamp)
    if (camera.zoom < Config.zoom.min) camera.zoom = Config.zoom.min;
    if (camera.zoom > Config.zoom.max) camera.zoom = Config.zoom.max;
    
    // Bloquer le scroll natif de la page
    return false;
}

function drawSimpleGrid() {
    stroke(Config.colors.gridLines);
    strokeWeight(1 / camera.zoom); // Garder les lignes fines même en zoomant
    
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