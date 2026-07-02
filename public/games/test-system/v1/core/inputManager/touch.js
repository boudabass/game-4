// public/games/system/core/inputManager/touch.js
// Module de gestion des événements tactiles (Mobile-First)

(function () {
    if (!window.InputManager) return;

    console.log("📱 InputManager Touch Module Loading...");

    /**
     * Récupère les coordonnées normalisées d'un événement touch
     * @param {Touch} touch - L'objet touch de l'événement
     * @param {HTMLCanvasElement} canvas - Le canvas p5.js (optionnel)
     * @returns {{x: number, y: number}}
     */
    window.InputManager.getTouchCoords = function (touch, canvas) {
        if (!touch) return { x: 0, y: 0 };

        // Si on a un canvas, on calcule les coordonnées relatives
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        }

        // Sinon on retourne les coordonnées client
        return {
            x: touch.clientX,
            y: touch.clientY
        };
    };

    /**
     * Démarre une interaction tactile
     * @param {TouchList} touches - Liste des touches actives
     */
    window.InputManager.handleTouchStart = function (touches) {
        if (touches.length === 1) {
            const touch = touches[0];
            this.currentTouchId = touch.identifier;
            this.startDrag(touch.clientX, touch.clientY, 'touch');
        }
    };

    /**
     * Gère le mouvement tactile
     * @param {TouchList} touches - Liste des touches actives
     * @param {Object} camera - Caméra p5play
     */
    window.InputManager.handleTouchMove = function (touches, camera) {
        if (touches.length === 1 && this.currentTouchId !== null) {
            // Trouver le touch correspondant à notre ID tracké
            for (let i = 0; i < touches.length; i++) {
                if (touches[i].identifier === this.currentTouchId) {
                    this.moveDrag(touches[i].clientX, touches[i].clientY, camera);
                    break;
                }
            }
        }
    };

    /**
     * Termine une interaction tactile
     * @returns {boolean} true si c'était un tap, false si c'était un drag
     */
    window.InputManager.handleTouchEnd = function () {
        this.currentTouchId = null;
        return this.endDrag();
    };

    /**
     * Vérifie si le point touché est sur un élément UI interactif
     * @param {number} x - Coordonnée X
     * @param {number} y - Coordonnée Y
     * @returns {boolean}
     */
    window.InputManager.isTouchOnUI = function (x, y) {
        const element = document.elementFromPoint(x, y);
        if (!element) return false;

        // Vérifier si c'est un élément UI interactif
        const interactiveSelectors = [
            'button',
            '.action-btn-circle',
            '.tab-btn',
            '.hud-btn',
            '.speed-btn',
            '.sys-btn',
            '.build-item-container',
            '.close-btn',
            '.res-item'
        ];

        for (const selector of interactiveSelectors) {
            if (element.matches(selector) || element.closest(selector)) {
                return true;
            }
        }

        // Vérifier les containers UI
        const uiContainers = [
            '.top-hud-container',
            '.bottom-bar',
            '.build-shelf.visible',
            '.people-shelf.visible',
            '.tech-shelf.visible',
            '.detail-panel.visible',
            '.action-modal.visible'
        ];

        for (const selector of uiContainers) {
            if (element.closest(selector)) {
                return true;
            }
        }

        return false;
    };

    console.log("📱 InputManager Touch Module Loaded");
})();
