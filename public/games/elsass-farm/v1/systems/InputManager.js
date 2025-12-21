// systems/InputManager.js
// Gère les interactions de la souris/touch pour le mouvement de la caméra.

window.InputManager = {
    init: function () {
        console.log("InputManager initialized.");
    },

    // Fonction appelée à chaque frame par sketch.js
    updateCamera: function (camera, mouseIsPressed, mouseX, pmouseX, mouseY, pmouseY, width, height) {
        // 1. Déplacement Caméra (Drag & Pan)
        // Si mouseIsPressed est TRUE et que la souris est en dessous du HUD (60px)
        if (mouseIsPressed && mouseY > 60) {
            camera.x -= (mouseX - pmouseX) / camera.zoom;
            camera.y -= (mouseY - pmouseY) / camera.zoom;
        }

        // 2. Contraintes Caméra (Limitation du mouvement)
        const margin = Config.worldMargin;
        const zoneWidth = Config.zoneWidth;
        const zoneHeight = Config.zoneHeight;

        const minX = (width / 2) / camera.zoom - margin;
        const maxX = zoneWidth + margin - (width / 2) / camera.zoom;
        const minY = (height / 2) / camera.zoom - margin;
        const maxY = zoneHeight + margin - (height / 2) / camera.zoom;

        camera.x = constrain(camera.x, minX, maxX);
        camera.y = constrain(camera.y, minY, maxY);
    }
};