// systems/UIManager.js
// Contrôleur principal gérant les modales et les mises à jour du HUD.

window.UIManager = {
    lastCloseTime: 0,

    // Vérifie si une modale est ouverte.
    // Avec display: none/flex, les modales fermées ne bloquent plus les clics.
    isAnyModalOpen: function () {
        const isOpen = document.querySelectorAll('.modal-overlay.active').length > 0;
        const justClosed = (Date.now() - this.lastCloseTime) < 150; // Protection anti-clic double
        return isOpen || justClosed;
    },

    // --- Gestion de l'Exclusivité ---
    _closeAllModals: function (exceptId) {
        const modals = ['menu-modal', 'map-modal', 'debug-modal', 'inventory-modal'];
        modals.forEach(id => {
            if (id !== exceptId) {
                const el = document.getElementById(id);
                if (el && el.classList.contains('active')) {
                    el.classList.remove('active');
                    this.lastCloseTime = Date.now();
                }
            }
        });
    },

    // --- Fonctions de bascule de Modale ---

    toggleMenu: function () {
        this._closeAllModals('menu-modal');
        const el = document.getElementById('menu-modal');
        const becomingInactive = el.classList.contains('active');
        el.classList.toggle('active');
        if (becomingInactive) this.lastCloseTime = Date.now();
    },

    toggleMap: function () {
        this._closeAllModals('map-modal');
        const el = document.getElementById('map-modal');
        const becomingInactive = el.classList.contains('active');
        el.classList.toggle('active');
        if (becomingInactive) this.lastCloseTime = Date.now();

        if (el.classList.contains('active')) {
            // Délégation du rendu à MinimapRenderer
            MinimapRenderer.render(this.toggleMap.bind(this));
        }
    },

    toggleDebug: function () {
        this._closeAllModals('debug-modal');
        const el = document.getElementById('debug-modal');
        const becomingInactive = el.classList.contains('active');
        el.classList.toggle('active');
        if (becomingInactive) this.lastCloseTime = Date.now();

        if (el.classList.contains('active')) {
            DebugManager.updateGridButton(); // Initialiser le texte du bouton
        }
    },

    toggleInventory: function () {
        this._closeAllModals('inventory-modal');
        const el = document.getElementById('inventory-modal');
        const becomingInactive = el.classList.contains('active');
        el.classList.toggle('active');
        if (becomingInactive) this.lastCloseTime = Date.now();

        if (el.classList.contains('active')) {
            if (typeof switchInvTab === 'function') {
                switchInvTab('seeds'); // Afficher l'onglet par défaut via la fonction globale d'index.html
            }
        }
    },

    toggleFullscreen: function () {
        if (window.GameSystem && window.GameSystem.Display) {
            window.GameSystem.Display.toggleFullscreen();
        }
        this.toggleMenu();
    },

    // --- Fonctions d'action ---

    toggleGrid: function () {
        Config.showGrid = !Config.showGrid;
        DebugManager.updateGridButton();

        // Forcer le moteur p5.js à redessiner
        if (window.redraw) window.redraw();
    },

    // --- Fonctions de mise à jour ---

    updateHUD: function (data) {
        document.getElementById('val-energy').innerText = data.energy || 0;
        document.getElementById('val-gold').innerText = data.gold || 0;
        document.getElementById('val-day').innerText = data.day || 1;
        document.getElementById('val-time').innerText = data.time || '6:00';
    },

    updateDebugInfo: function (info) {
        DebugManager.updateInfo(info);
    }
};