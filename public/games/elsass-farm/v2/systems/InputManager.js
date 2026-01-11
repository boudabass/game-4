// systems/InputManager.js
// Gère les interactions de la souris/touch pour le mouvement de la caméra.

window.InputManager = {
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    lastX: 0,
    lastY: 0,
    DRAG_THRESHOLD: 15, // Seuil de pixels pour considérer un mouvement comme un drag

    init: function () {
        console.log("InputManager initialized.");
        this.isDragging = false;
    },

    // Démarre le drag (appelé par mousedown/touchstart)
    startDrag: function (x, y) {
        this.dragStartX = x;
        this.dragStartY = y;
        this.lastX = x;
        this.lastY = y;
        this.isDragging = true;
        this.hasMoved = false;
    },

    // Gère le mouvement (appelé par mousemove/touchmove)
    moveDrag: function (x, y, camera) {
        if (!this.isDragging) return;

        const deltaX = x - this.lastX;
        const deltaY = y - this.lastY;

        // Vérifier si le mouvement total dépasse le seuil
        const totalDeltaX = Math.abs(x - this.dragStartX);
        const totalDeltaY = Math.abs(y - this.dragStartY);

        if (totalDeltaX > this.DRAG_THRESHOLD || totalDeltaY > this.DRAG_THRESHOLD) {
            this.hasMoved = true;
        }

        if (this.hasMoved) {
            // Appliquer le déplacement (divisé par le zoom pour rester cohérent)
            camera.x -= deltaX / camera.zoom;
            camera.y -= deltaY / camera.zoom;
        }

        this.lastX = x;
        this.lastY = y;
    },

    // Vérifie si l'événement est un clic pur (appelé par mouseup/touchend)
    isClick: function () {
        const wasClick = !this.hasMoved;
        return wasClick;
    },

    // Termine le drag (appelé par mouseup/touchend)
    endDrag: function () {
        this.isDragging = false;
        const wasClick = !this.hasMoved;
        this.hasMoved = false;
        return wasClick;
    },

    // Contraintes Caméra (Doit être appelé dans draw() pour être exécuté à chaque frame)
    constrainCamera: function (camera, width, height) {
        const margin = Config.worldMargin;
        const zoneWidth = Config.zoneWidth;
        const zoneHeight = Config.zoneHeight;

        const halfWidth = zoneWidth / 2;
        const halfHeight = zoneHeight / 2;

        const minX = -halfWidth - margin + (width / 2) / camera.zoom;
        const maxX = halfWidth + margin - (width / 2) / camera.zoom;
        const minY = -halfHeight - margin + (height / 2) / camera.zoom;
        const maxY = halfHeight + margin - (height / 2) / camera.zoom;

        // Si la zone est plus petite que l'écran (zoom arrière trop fort), on bloque au centre
        if (minX > maxX) camera.x = 0;
        else camera.x = constrain(camera.x, minX, maxX);

        if (minY > maxY) camera.y = 0;
        else camera.y = constrain(camera.y, minY, maxY);
    }
};