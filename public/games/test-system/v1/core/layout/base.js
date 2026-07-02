// public/games/system/core/layout/base.js
// Gestionnaire de la structure DOM et des profondeurs

(function () {
    console.log("🏗️ Layout System Initializing...");

    window.Layout = {
        containers: {},

        init: function () {
            // S'assurer que les couches de base existent
            this.createLayer('game-layer', UILayers.GAME);
            this.createLayer('ui-layer', UILayers.HUD);
            this.createLayer('system-layer', UILayers.SYSTEM_BAR);
        },

        createLayer: function (id, zIndex) {
            let el = document.getElementById(id);
            if (!el) {
                el = document.createElement('div');
                el.id = id;
                document.getElementById('app-wrapper')?.appendChild(el);
            }

            // On force les styles système
            el.style.position = 'absolute';
            el.style.inset = '0';
            el.style.zIndex = zIndex;

            // Seul l'UI et le System-layer sont transparents aux clics par défaut (leurs enfants non)
            if (id === 'ui-layer' || id === 'system-layer') {
                el.style.pointerEvents = 'none';
            } else {
                el.style.pointerEvents = 'auto';
            }

            this.containers[id] = el;
            return el;
        }
    };
})();
