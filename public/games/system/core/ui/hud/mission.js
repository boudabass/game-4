// public/games/system/core/ui/hud/mission.js
// Gestion du Panneau de Mission

(function () {
    const UI = window.UIManager;
    if (!UI) return;

    UI.HUD = UI.HUD || {};
    UI.HUD.Mission = {
        update: function (missions) {
            // Logique pour mettre à jour la liste des missions
            // Pour l'instant, statique dans le HTML, mais prêt pour le dynamique
            const container = document.getElementById('mission-list');
            if (!container || !missions) return;

            // TODO: Générer le HTML depuis la liste des missions
        }
    };
})();
