// systems/InputManager.js
// Gère les interactions de la souris/touch pour le mouvement de la caméra et les clics.
// Adapté de Elsass Farm pour Elsass Frost

window.InputManager = {
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    lastX: 0,
    lastY: 0,
    DRAG_THRESHOLD: 10, // Seuil de pixels pour considérer un mouvement comme un drag
    hasMoved: false,

    init: function () {
        console.log("InputManager initialized.");
        this.isDragging = false;
        this.hasMoved = false;
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
        // Mettre à jour la pos de la souris pour les systèmes qui en ont besoin (ghost building)
        // Note: p5play met à jour mouse.x/y automatiquement, mais ici on gère le pan

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
            // Appliquer le déplacement
            // On divise par le zoom pour que le mouvement de la souris corresponde au mouvement du monde
            camera.x -= deltaX / camera.zoom;
            camera.y -= deltaY / camera.zoom;
        }

        this.lastX = x;
        this.lastY = y;
    },

    // Termine le drag (appelé par mouseup/touchend)
    // Retourne true si c'était un clic, false si c'était un drag
    endDrag: function () {
        this.isDragging = false;
        const wasClick = !this.hasMoved;
        this.hasMoved = false;
        return wasClick;
    },

    // Contraintes Caméra pour ne pas sortir de la carte
    constrainCamera: function (camera) {
        // Adapter selon la taille de la map définie dans Config
        // Config.GRID_SIZE * Config.TILE_SIZE
        const worldSize = Config.GRID_SIZE * Config.TILE_SIZE;
        const halfWorld = worldSize / 2;

        // Marge arbitraire
        const margin = 500;

        // Limites simples
        // camera.x = constrain(camera.x, -halfWorld - margin, halfWorld + margin);
        // camera.y = constrain(camera.y, -halfWorld - margin, halfWorld + margin);
    }
};
