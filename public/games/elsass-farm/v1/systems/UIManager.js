// systems/UIManager.js
// Contrôleur principal gérant les modales et les mises à jour du HUD.

window.UIManager = {
    lastCloseTime: 0,

    // Vérifie si une modale est ouverte.
    isAnyModalOpen: function () {
        const isOpen = document.querySelectorAll('.modal-overlay.active').length > 0;
        const justClosed = (Date.now() - this.lastCloseTime) < 150;
        return isOpen || justClosed;
    },

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

    toggleMenu: function () {
        this._closeAllModals('menu-modal');
        const el = document.getElementById('menu-modal');
        if (!el) return;
        const becomingInactive = el.classList.contains('active');
        el.classList.toggle('active');
        if (becomingInactive) this.lastCloseTime = Date.now();
    },

    toggleMap: function () {
        this._closeAllModals('map-modal');
        const el = document.getElementById('map-modal');
        if (!el) return;
        const becomingInactive = el.classList.contains('active');
        el.classList.toggle('active');
        if (becomingInactive) this.lastCloseTime = Date.now();

        if (el.classList.contains('active') && window.MinimapRenderer) {
            MinimapRenderer.render(this.toggleMap.bind(this));
        }
    },

    toggleDebug: function () {
        this._closeAllModals('debug-modal');
        const el = document.getElementById('debug-modal');
        if (!el) return;
        const becomingInactive = el.classList.contains('active');
        el.classList.toggle('active');
        if (becomingInactive) this.lastCloseTime = Date.now();

        if (el.classList.contains('active') && window.DebugManager) {
            DebugManager.updateGridButton();
        }
    },

    toggleInventory: function () {
        this._closeAllModals('inventory-modal');
        const el = document.getElementById('inventory-modal');
        if (!el) return;
        const becomingInactive = el.classList.contains('active');
        el.classList.toggle('active');
        if (becomingInactive) this.lastCloseTime = Date.now();

        if (el.classList.contains('active')) {
            if (typeof switchInvTab === 'function') {
                switchInvTab('seeds');
            }
        }
    },

    toggleFullscreen: function () {
        if (window.GameSystem && window.GameSystem.Display) {
            window.GameSystem.Display.toggleFullscreen();
        }
        this.toggleMenu();
    },

    toggleGrid: function () {
        if (typeof Config !== 'undefined') {
            Config.showGrid = !Config.showGrid;
            if (window.DebugManager) DebugManager.updateGridButton();
            if (window.redraw) window.redraw();
        }
    },

    // --- Fonctions de mise à jour (Sécurisées) ---

    updateHUD: function (data) {
        // Sécurité : Vérifier si les éléments existent avant d'écrire
        const elEnergy = document.getElementById('val-energy');
        const elGold = document.getElementById('val-gold');
        const elDay = document.getElementById('val-day');
        const elTime = document.getElementById('val-time');

        if (elEnergy) elEnergy.innerText = data.energy !== undefined ? data.energy : 0;
        if (elGold) elGold.innerText = data.gold !== undefined ? data.gold : 0;
        if (elDay) elDay.innerText = data.day !== undefined ? data.day : 1;
        if (elTime) elTime.innerText = data.time || '6:00';
    },

    updateDebugInfo: function (info) {
        if (window.DebugManager) {
            DebugManager.updateInfo(info);
        }
    }
};