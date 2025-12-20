// Fonction utilitaire pour obtenir les données de la zone actuelle
function getCurrentZone() {
    const zoneId = window.ElsassFarm.state.currentZoneId;
    return Config.zones.find(z => z.id === zoneId);
}

// Fonction de changement de zone
function changeZone(newZoneId, entryPoint) {
    const newZone = Config.zones.find(z => z.id === newZoneId);
    if (!newZone) {
        console.error(`Zone ID ${newZoneId} non trouvée.`);
        return;
    }
    
    console.log(`Transition de ${window.ElsassFarm.state.currentZoneId} vers ${newZoneId}`);
    window.ElsassFarm.state.currentZoneId = newZoneId;
    
    // Réinitialiser la position de la caméra dans la nouvelle zone
    // Si on vient du Nord, on spawn au Sud, etc.
    if (entryPoint === 'N') camera.y = Config.zoneHeight - 100;
    else if (entryPoint === 'S') camera.y = 100;
    else if (entryPoint === 'W') camera.x = Config.zoneWidth - 100;
    else if (entryPoint === 'E') camera.x = 100;
    else {
        // Spawn par défaut au centre
        camera.x = Config.zoneWidth / 2;
        camera.y = Config.zoneHeight / 2;
    }
    
    // Forcer un redraw pour la nouvelle couleur de fond
    redraw();
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Config Physique
    world.gravity.y = 0; 
    
    // Init Caméra au centre de la zone 3000x3000
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
    
    // 3. Contraintes Caméra (Limitation au bord de la zone 3000x3000 + 100px de vide)
    const margin = Config.worldMargin;
    
    const minX = (width / 2) / camera.zoom - margin;
    const maxX = Config.zoneWidth + margin - (width / 2) / camera.zoom;
    const minY = (height / 2) / camera.zoom - margin;
    const maxY = Config.zoneHeight + margin - (height / 2) / camera.zoom;

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
        drawPortals(currentZone); // Dessin des zones cliquables
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

// Dessine les zones de transition cliquables
function drawPortals(zone) {
    const { zoneWidth, zoneHeight, portal } = Config;
    const { size, margin, color } = portal;
    
    fill(color);
    noStroke();
    
    // Nord (Y=0)
    if (zone.neighbors.N) {
        rect(zoneWidth / 2 - size / 2, 0, size, margin);
        fill(255);
        textSize(20);
        textAlign(CENTER, CENTER);
        text(Config.zones.find(z => z.id === zone.neighbors.N).name, zoneWidth / 2, margin / 2);
        fill(color); // Rétablir la couleur de fond
    }
    
    // Sud (Y=zoneHeight)
    if (zone.neighbors.S) {
        rect(zoneWidth / 2 - size / 2, zoneHeight - margin, size, margin);
        fill(255);
        textSize(20);
        textAlign(CENTER, CENTER);
        text(Config.zones.find(z => z.id === zone.neighbors.S).name, zoneWidth / 2, zoneHeight - margin / 2);
        fill(color);
    }
    
    // Ouest (X=0)
    if (zone.neighbors.W) {
        rect(0, zoneHeight / 2 - size / 2, margin, size);
        fill(255);
        textSize(20);
        textAlign(CENTER, CENTER);
        text(Config.zones.find(z => z.id === zone.neighbors.W).name, margin / 2, zoneHeight / 2);
        fill(color);
    }
    
    // Est (X=zoneWidth)
    if (zone.neighbors.E) {
        rect(zoneWidth - margin, zoneHeight / 2 - size / 2, margin, size);
        fill(255);
        textSize(20);
        textAlign(CENTER, CENTER);
        text(Config.zones.find(z => z.id === zone.neighbors.E).name, zoneWidth - margin / 2, zoneHeight / 2);
        fill(color);
    }
}

// Gestion du clic pour la transition
function mouseClicked() {
    // Ignorer les clics sur le HUD
    if (mouseY < 60) return;
    
    // Convertir les coordonnées écran en coordonnées monde
    const worldX = camera.mouse.x;
    const worldY = camera.mouse.y;
    
    const zone = getCurrentZone();
    const { zoneWidth, zoneHeight, portal } = Config;
    const { size, margin } = portal;
    
    // Vérification des portails
    
    // Nord
    if (zone.neighbors.N && worldX > zoneWidth / 2 - size / 2 && worldX < zoneWidth / 2 + size / 2 && worldY < margin) {
        changeZone(zone.neighbors.N, 'S'); // Entrée par le Sud
        return;
    }
    
    // Sud
    if (zone.neighbors.S && worldX > zoneWidth / 2 - size / 2 && worldX < zoneWidth / 2 + size / 2 && worldY > zoneHeight - margin) {
        changeZone(zone.neighbors.S, 'N'); // Entrée par le Nord
        return;
    }
    
    // Ouest
    if (zone.neighbors.W && worldY > zoneHeight / 2 - size / 2 && worldY < zoneHeight / 2 + size / 2 && worldX < margin) {
        changeZone(zone.neighbors.W, 'E'); // Entrée par l'Est
        return;
    }
    
    // Est
    if (zone.neighbors.E && worldY > zoneHeight / 2 - size / 2 && worldY < zoneHeight / 2 + size / 2 && worldX > zoneWidth - margin) {
        changeZone(zone.neighbors.E, 'W'); // Entrée par l'Ouest
        return;
    }
    
    // Si ce n'est pas un portail, c'est une interaction de jeu (à implémenter plus tard)
    console.log(`Clic Monde: ${Math.round(worldX)}, ${Math.round(worldY)}`);
}

function mouseWheel(event) {
    if (mouseY < 60) return true;

    let zoomAmount = event.delta * Config.zoom.sensitivity;
    camera.zoom -= zoomAmount;
    
    camera.zoom = constrain(camera.zoom, Config.zoom.min, Config.zoom.max);
    
    return false;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}