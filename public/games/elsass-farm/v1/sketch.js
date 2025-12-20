// Fonction utilitaire pour obtenir les données de la zone actuelle
function getCurrentZone() {
    const zoneId = window.ElsassFarm.state.currentZoneId;
    return Config.zones.find(z => z.id === zoneId);
}

// Fonction de changement de zone (Rendue globale)
window.changeZone = function(newZoneId, entryPoint) {
    const newZone = Config.zones.find(z => z.id === newZoneId);
    if (!newZone) {
        console.error(`Zone ID ${newZoneId} non trouvée.`);
        return;
    }
    
    console.log(`Transition de ${window.ElsassFarm.state.currentZoneId} vers ${newZoneId}`);
    window.ElsassFarm.state.currentZoneId = newZoneId;
    
    // Réinitialiser la position de la caméra dans la nouvelle zone
    if (entryPoint === 'N') camera.y = Config.zoneHeight - 100;
    else if (entryPoint === 'S') camera.y = 100;
    else if (entryPoint === 'W') camera.x = Config.zoneWidth - 100;
    else if (entryPoint === 'E') camera.x = 100;
    else {
        camera.x = Config.zoneWidth / 2;
        camera.y = Config.zoneHeight / 2;
    }
    
    redraw();
}

function setup() {
    new Canvas(windowWidth, windowHeight);
    
    world.gravity.y = 0; 
    
    camera.x = Config.zoneWidth / 2;
    camera.y = Config.zoneHeight / 2;
    camera.zoom = Config.zoom.start;
    
    if (window.GameSystem && window.GameSystem.Lifecycle) {
        window.GameSystem.Lifecycle.notifyReady();
    }
    
    InputManager.init();
}

function draw() {
    const currentZone = getCurrentZone();
    
    // 1. Fond de la zone
    background(currentZone.bgColor);
    
    // 2. Rendu Monde (Active la transformation de la caméra)
    camera.on();
    
    // Dessin du monde réel (la zone active)
    noFill();
    stroke(0);
    strokeWeight(2);
    rect(0, 0, Config.zoneWidth, Config.zoneHeight);
    
    if (Config.debug && Config.showGrid) {
        drawSimpleGrid();
    }
    
    allSprites.draw();
    camera.off(); // Désactive la transformation
    
    // 3. Mise à jour de la caméra (Déplacement et Contraintes)
    // Appel après camera.off() pour utiliser les coordonnées écran (mouseX, mouseY)
    InputManager.updateCamera(
        camera, 
        mouseIsPressed, 
        mouseX, 
        pmouseX, 
        mouseY, 
        pmouseY, 
        width, 
        height
    );
    
    // 4. Mise à jour des infos de debug dans le UIManager
    if (Config.debug && window.UIManager) {
        UIManager.updateDebugInfo({
            zoneId: currentZone.id,
            zoneName: currentZone.name,
            zoom: camera.zoom,
            camX: camera.x,
            camY: camera.y,
            worldX: camera.mouse.x,
            worldY: camera.mouse.y,
            mousePressed: mouseIsPressed,
            mouseY: mouseY
        });
    }
}

function mouseClicked() {
    if (mouseY < 60) return;
    
    const worldX = camera.mouse.x;
    const worldY = camera.mouse.y;
    
    console.log(`Clic Monde: ${Math.round(worldX)}, ${Math.round(worldY)}`);
}

function mouseWheel(event) {
    if (mouseY < 60) return true;

    let zoomAmount = event.delta * Config.zoom.sensitivity;
    camera.zoom -= zoomAmount;
    
    camera.zoom = constrain(camera.zoom, Config.zoom.min, Config.zoom.max);
}

function drawSimpleGrid() {
    stroke(Config.colors.gridLines);
    strokeWeight(1 / camera.zoom);
    
    for (let x = 0; x <= Config.zoneWidth; x += 64) {
        line(x, 0, x, Config.zoneHeight);
    }
    for (let y = 0; y <= Config.zoneHeight; y += 64) {
        line(0, y, Config.zoneWidth, y);
    }
}