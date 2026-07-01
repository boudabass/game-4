// public/games/system/core/inputManager/base.js
// Initialisation de l'InputManager

(function () {
    console.log("🖱️ InputManager System Initializing...");

    window.InputManager = {
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        lastX: 0,
        lastY: 0,
        DRAG_THRESHOLD: 10,        // Desktop
        DRAG_THRESHOLD_TOUCH: 20,  // Mobile (plus tolérant pour les doigts)
        hasMoved: false,

        // Propriétés Mobile-First
        isTouchDevice: false,
        lastInputType: 'mouse',    // 'mouse' ou 'touch'
        currentTouchId: null,      // Pour le tracking du doigt principal

        init: function () {
            this.isDragging = false;
            this.hasMoved = false;
            this.currentTouchId = null;
            this.lastInputType = 'mouse';

            // Détection du type d'appareil
            this.isTouchDevice = ('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0);

            console.log("🖱️ InputManager initialized - Touch device:", this.isTouchDevice);
        },

        /**
         * Retourne le seuil de drag approprié selon le type d'input
         * @returns {number}
         */
        getDragThreshold: function () {
            return this.lastInputType === 'touch' ? this.DRAG_THRESHOLD_TOUCH : this.DRAG_THRESHOLD;
        }
    };
})();

