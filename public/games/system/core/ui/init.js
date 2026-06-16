// public/games/system/core/ui/init.js
// Point d'entrée principal de l'UI Core Modularisé

(function () {
    console.log("🚀 Initializing Core UI System...");

    window.UIManager = window.UIManager || {};

    // Méthode Init Principale
    window.UIManager.init = function () {
        console.log("🖥️ Core UI: Init Start");

        // 1. Init Sub-Modules
        if (this.HUD && this.HUD.Top) this.HUD.Top.init();
        if (this.HUD && this.HUD.Bottom) this.HUD.Bottom.init();
        if (this.Panels && this.Panels.Build) this.Panels.Build.init();

        // 2. Gestion Resize
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        // 3. Init Tooltips (Legacy)
        if (this.initTooltips) this.initTooltips();

        console.log("✅ Core UI: Init Complete");
    };

    // Gestion du Scaling Global (Inspiré de Frost)
    window.UIManager.handleResize = function () {
        const referenceWidth = 1920;
        const scale = (window.innerWidth / referenceWidth) * 1.5;

        // Top HUD
        const topHud = document.getElementById('top-hud-container');
        if (topHud) {
            topHud.style.transform = `scale(${scale})`;
            topHud.style.width = `${100 / scale}%`;
            topHud.style.transformOrigin = 'top left';
        }

        // Elements Principaux
        const uiElements = [
            { sel: '#mission-panel', origin: 'bottom left' },
            { sel: '.bottom-ui-container', origin: 'bottom left', width: true },
            { sel: '#detail-panel', origin: 'top right' },
            { sel: '#debug-panel', origin: 'center center' }, // Debug center
            { sel: '#action-modal', origin: 'center left' }
        ];

        uiElements.forEach(def => {
            const els = document.querySelectorAll(def.sel);
            els.forEach(el => {
                el.style.transform = `scale(${scale})`;
                el.style.transformOrigin = def.origin;
                if (def.width) el.style.width = `${100 / scale}%`;
            });
        });
    };

    // Fonction Utilitaires Globales
    window.UIManager.isClickBlocked = function () {
        // Simple logic: hover interactive elements
        const hover = document.querySelectorAll(':hover');
        for (let el of hover) {
            if (el.closest('.top-hud-container') ||
                el.closest('.bottom-ui-container') ||
                el.closest('.detail-panel') ||
                el.closest('.action-modal') ||
                el.closest('.mission-panel')) {
                return true;
            }
        }
        return false;
    };

})();
