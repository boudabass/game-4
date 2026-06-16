// public/games/system/core/ui/base.js
// Gestionnaire d'UI de base

(function () {
    console.log("🖥️ UI System Initializing...");

    window.UIManager = {
        isAnyModalOpen: false,
        activeModals: [],

        // Configuration des menus (shelves)
        shelves: {
            'build-shelf': { btnId: 'btn-build' },
            'people-shelf': { btnId: 'btn-people' },
            'tech-shelf': { btnId: 'btn-tech' }
        },

        hideDetailPanel: function () {
            if (this.Panels.Detail) this.Panels.Detail.hide();
        },

        // Gère l'affichage exclusif d'un menu
        toggleShelf: function (shelfId) {
            const shelfCfg = this.shelves[shelfId];
            if (!shelfCfg) return;

            const element = document.getElementById(shelfId);
            if (!element) return;

            const isCurrentlyVisible = element.classList.contains('visible');

            // 1. On ferme TOUT d'abord
            this.hideAllShelves();

            // 2. Si on n'était pas déjà ouvert, on ouvre celui-là
            if (!isCurrentlyVisible) {
                element.classList.add('visible');
                const btn = document.getElementById(shelfCfg.btnId);
                if (btn) btn.classList.add('active');

                // Notifier le panel spécifique pour qu'il se rafraîchisse
                if (shelfId === 'build-shelf' && this.Panels.Build) this.Panels.Build.onShow();
                if (shelfId === 'people-shelf' && this.Panels.People) this.Panels.People.onShow();
                if (shelfId === 'tech-shelf' && this.Panels.Tech) this.Panels.Tech.onShow();
            } else {
                // On notifie qu'on a fermé
                if (shelfId === 'build-shelf' && this.Panels.Build) this.Panels.Build.onHide();
                if (shelfId === 'people-shelf' && this.Panels.People) this.Panels.People.onHide();
                if (shelfId === 'tech-shelf' && this.Panels.Tech) this.Panels.Tech.onHide();
            }
        },

        hideAllShelves: function () {
            for (const id in this.shelves) {
                const el = document.getElementById(id);
                if (el && el.classList.contains('visible')) {
                    el.classList.remove('visible');
                    // Appeler onHide uniquement si l'élément était visible
                    if (id === 'build-shelf' && this.Panels.Build) this.Panels.Build.onHide();
                    if (id === 'people-shelf' && this.Panels.People) this.Panels.People.onHide();
                    if (id === 'tech-shelf' && this.Panels.Tech) this.Panels.Tech.onHide();
                }

                const cfg = this.shelves[id];
                const btn = document.getElementById(cfg.btnId);
                if (btn) btn.classList.remove('active');

                // Sécurité pour l'état interne
                if (id === 'build-shelf' && this.Panels.Build) this.Panels.Build.isVisible = false;
                if (id === 'people-shelf' && this.Panels.People) this.Panels.People.isVisible = false;
                if (id === 'tech-shelf' && this.Panels.Tech) this.Panels.Tech.isVisible = false;
            }
        },

        init: function () {
            this.activeModals = [];
            this.isAnyModalOpen = false;
        },

        // Vérifie si le clic doit être bloqué par l'UI
        isClickBlocked: function () {
            // 1. Bloquer si une modale est ouverte
            if (this.isAnyModalOpen) return true;

            // 2. Bloquer si la souris/touch est sur un élément interactif
            // Utiliser les dernières coordonnées connues (touch ou mouse)
            const lastX = window.InputManager ? InputManager.lastX : window.mouseX;
            const lastY = window.InputManager ? InputManager.lastY : window.mouseY;
            const hoverEl = document.elementFromPoint(lastX, lastY);
            if (!hoverEl) return false;

            // Bloquer si c'est un bouton ou un fils de #ui-layer qui capture les événements
            if (hoverEl.tagName === 'BUTTON' || hoverEl.closest('.build-shelf') || hoverEl.closest('.bottom-bar') || hoverEl.closest('.top-hud-container')) {
                return true;
            }

            const blockedClasses = ['slot', 'modal-content', 'dyad-btn', 'dyad-menu-item', 'controls', 'action-btn-circle', 'res-item'];
            const isInteractive = blockedClasses.some(cls => hoverEl.classList.contains(cls)) ||
                blockedClasses.some(cls => hoverEl.closest('.' + cls));

            return isInteractive;
        }
    };
    window.toggleTechPanel = () => {
        if (window.UIManager) window.UIManager.toggleShelf('tech-shelf');
    };

})();
