// public/games/system/core/inputManager/drag.js
// Logique de Drag et Pan (Mobile-First)

(function () {
    if (!window.InputManager) return;

    /**
     * Démarre un drag/pan
     * @param {number} x - Coordonnée X de départ
     * @param {number} y - Coordonnée Y de départ
     * @param {string} inputType - 'mouse' ou 'touch'
     */
    window.InputManager.startDrag = function (x, y, inputType = 'mouse') {
        this.lastInputType = inputType;
        this.dragStartX = x;
        this.dragStartY = y;
        this.lastX = x;
        this.lastY = y;
        this.isDragging = true;
        this.hasMoved = false;
    };

    /**
     * Met à jour le drag/pan en cours
     * @param {number} x - Coordonnée X actuelle
     * @param {number} y - Coordonnée Y actuelle
     * @param {Object} camera - Caméra p5play
     */
    window.InputManager.moveDrag = function (x, y, camera) {
        if (!this.isDragging) return;

        const deltaX = x - this.lastX;
        const deltaY = y - this.lastY;

        const totalDeltaX = Math.abs(x - this.dragStartX);
        const totalDeltaY = Math.abs(y - this.dragStartY);

        // Utiliser le seuil adaptatif selon le type d'input
        const threshold = this.getDragThreshold();

        if (totalDeltaX > threshold || totalDeltaY > threshold) {
            this.hasMoved = true;
        }

        if (this.hasMoved && camera) {
            camera.x -= deltaX / camera.zoom;
            camera.y -= deltaY / camera.zoom;
        }

        this.lastX = x;
        this.lastY = y;
    };

    /**
     * Termine le drag/pan
     * @returns {boolean} true si c'était un clic/tap, false si c'était un drag
     */
    window.InputManager.endDrag = function () {
        const wasClick = !this.hasMoved;
        this.isDragging = false;
        this.hasMoved = false;
        return wasClick;
    };

    console.log("🖐️ InputManager Drag Module Loaded (Mobile-First)");
})();

