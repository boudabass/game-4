// public/games/system/core/ui/hud/top.js
// Gestion du HUD Supérieur (Ressources, Temps, Météo)

(function () {
    const UI = window.UIManager;
    if (!UI) return;

    UI.HUD = UI.HUD || {};
    UI.HUD.Top = {
        init: function () {
            console.log("⬆️ Top HUD Initialized");
            // Ecouteurs pour le temps sont souvent globaux, mais on peut les attacher ici si besoin
        },

        updateResources: function () {
            if (!window.GameState) return;

            const mapping = {
                'coal': 'val-coal',
                'wood': 'val-wood',
                'iron': 'val-iron',
                'steamCores': 'val-steamCores',
                'rawFood': 'val-rawFood',
                'foodRations': 'val-foodRations',
                'prostheses': 'val-prostheses'
            };

            for (const [resKey, domId] of Object.entries(mapping)) {
                const el = document.getElementById(domId);
                if (el) {
                    el.innerText = Math.floor(GameState[resKey] || 0);
                }
            }
        },

        updateTime: function () {
            // Mettre à jour l'horloge et le compteur de jour si nécessaire
            // Souvent géré par TimeManager, mais l'UI doit refléter l'état
        },

        setSpeed: function (speed) {
            if (window.GameState) {
                GameState.gameSpeed = speed;
                GameState.isPaused = (speed === 0);
            }

            document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(`speed-${speed}`);
            if (activeBtn) activeBtn.classList.add('active');

            console.log(`⏱️ Speed set to ${speed}x`);
        }
    };

    // Raccourci global pour setSpeed
    window.setSpeed = (s) => UI.HUD.Top.setSpeed(s);

})();
