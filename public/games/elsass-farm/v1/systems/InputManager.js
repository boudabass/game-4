// systems/InputManager.js
// Gère les interactions de la souris/touch pour le mouvement de la caméra.

window.InputManager = {
    lastMouseX: null,
    lastMouseY: null,
    isDragging: false,
    touchStartTime: null,
    touchStartX: null,
    touchStartY: null,
    hasMoved: false,
    DRAG_THRESHOLD: 15, // Seuil de pixels pour considérer un mouvement comme un drag

    init: function () {
        console.log("InputManager initialized.");
        this.lastMouseX = null;
        this.lastMouseY = null;
        this.isDragging = false;
        this.touchStartTime = null;
        this.touchStartX = null;
        this.touchStartY = null;
        this.hasMoved = false;
    },

    // Fonction appelée à chaque frame par sketch.js
    updateCamera: function (camera, mouseIsPressed, mouseX, pmouseX, mouseY, pmouseY, width, height) {
        // 1. Détection de Drag (Desktop)
        if (mouseIsPressed && !this.isDragging && mouseY > 60) {
            // Démarre le drag sur desktop
            this.isDragging = true;
            this.lastMouseX = mouseX;
            this.lastMouseY = mouseY;
            this.hasMoved = false; // Réinitialiser au début du clic
        }

        // 2. Déplacement Caméra (Drag & Pan)
        if (this.isDragging && mouseY > 60) {
            // Vérifier si le mouvement est suffisant pour être considéré comme un drag
            const deltaX = mouseX - this.lastMouseX;
            const deltaY = mouseY - this.lastMouseY;

            if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
                // Si on a bougé plus que le seuil initial (pour le mobile)
                if (this.touchStartX !== null) {
                    const totalDeltaX = Math.abs(mouseX - this.touchStartX);
                    const totalDeltaY = Math.abs(mouseY - this.touchStartY);
                    if (totalDeltaX > this.DRAG_THRESHOLD || totalDeltaY > this.DRAG_THRESHOLD) {
                        this.hasMoved = true;
                    }
                } else {
                    // Desktop: tout mouvement est un drag
                    this.hasMoved = true;
                }
            }

            if (this.hasMoved) {
                // Appliquer le déplacement
                camera.x -= deltaX / camera.zoom;
                camera.y -= deltaY / camera.zoom;
            }

            // Sauvegarder les positions pour le prochain frame
            this.lastMouseX = mouseX;
            this.lastMouseY = mouseY;
        }

        // 3. Fin du Drag (Desktop)
        if (!mouseIsPressed && this.isDragging) {
            this.isDragging = false;
            this.lastMouseX = null;
            this.lastMouseY = null;
        }

        // 4. Contraintes Caméra (Limitation du mouvement)
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