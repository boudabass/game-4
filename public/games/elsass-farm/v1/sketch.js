// Fonction utilitaire pour obtenir les données de la zone actuelle
function getCurrentZone() {
    const zoneId = window.ElsassFarm.state.currentZoneId;
    return Config.zones.find(z => z.id === zoneId);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Config Physique
    world.gravity.y = 0; 
    
    // Init Caméra au centre de la zone
    camera.x = Config.zoneWidth / 2;
    camera.y = Config.zoneHeight / 2;
    camera.zoom = Config.zoom.start;
    
    if (window.GameSystem && window.GameSystem.Lifecycle) {
        window.GameSystem.Lifecycle.notifyReady();
    }
}

function draw() {
    const currentZone = getCurrentZone();
    
    // 1. Fond de la zone
    background(currentZone.bgColor);
    
    // 2. Déplacement Caméra (Drag & Pan)
    if (mouseIsPressed && mouseY > 60) {
        camera.x -= (mouseX - pmouseX) / camera.zoom;
        camera.y -= (mouseY - pmouseY) / camera.zoom;
    }
    
    // 3. Contraintes Caméra (Limitation au bord de la zone + 100px de vide)
    const margin = 100;
    
    // Limites X
    const minX = (width / 2) / camera.zoom - margin;
    const maxX = Config.zoneWidth + margin - (width / 2) / camera.zoom;
    
    // Limites Y
    const minY = (height / 2) / camera.zoom - margin;
    const maxY = Config.zoneHeight + margin - (height / 2) / camera.zoom;

    // Appliquer les contraintes
    camera.x = constrain(camera.x, minX, maxX);
    camera.y = constrain(camera.y, minY, maxY);

    // 4. Rendu Monde
    camera.on();
    
    // Dessin du monde réel (la zone active)
    noFill();
    stroke(255);
    strokeWeight(2);
    rect(0, 0, Config.zoneWidth, Config.zoneHeight);
    
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
        text(`Zone: ${currentZone.name} (${currentZone.id}) | Zoom: ${camera.zoom.toFixed(2)}`, 10, height - 10);
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
    
    // La grille est dessinée sur la taille de la zone
    for (let x = 0; x <= Config.zoneWidth; x += 64) {
        line(x, 0, x, Config.zoneHeight);
    }
    for (let y = 0; y <= Config.zoneHeight; y += 64) {
        line(0, y, Config.zoneWidth, y);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}