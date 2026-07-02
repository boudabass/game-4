// public/games/system/core/ui/hud/bottom.js
// Gestion du HUD Inférieur (Actions, Jauges)

(function () {
    const UI = window.UIManager;
    if (!UI) return;

    UI.HUD = UI.HUD || {};
    UI.HUD.Bottom = {
        init: function () {
            console.log("⬇️ Bottom HUD Initialized");
        },

        toggleBuildMenu: function () {
            const shelf = document.getElementById('build-shelf');
            const btn = document.getElementById('btn-build');
            if (shelf && btn) {
                const isVisible = shelf.classList.toggle('visible');
                btn.classList.toggle('active', isVisible);

                if (isVisible) {
                    // Si le module BuildPanel existe
                    if (UI.Panels && UI.Panels.Build) {
                        UI.Panels.Build.render('all'); // Default to all
                    }
                } else {
                    if (window.BuildingSystem) {
                        BuildingSystem.cancelPlacement();
                        if (BuildingSystem.isDemolishing) BuildingSystem.toggleDemolishMode();
                    }
                    // Désélectionner
                    if (UI.Panels && UI.Panels.Build) {
                        UI.Panels.Build.updateSelection(null);
                    }
                }
            }
        },

        updateGauges: function () {
            // A appeler quand l'espoir/mécontentement change
            const hopeEl = document.getElementById('fill-hope');
            const discontentEl = document.getElementById('fill-discontent');

            if (window.GameState && hopeEl && discontentEl) {
                // Supposons que GameState a hope/discontent sur 100
                hopeEl.style.width = `${GameState.hope || 50}%`;
                discontentEl.style.width = `${GameState.discontent || 10}%`;
            }
        },

        // Placeholders pour Tech et Lois
        toggleTech: function () { alert("Arbre Technologique : Bientôt disponible !"); },
        toggleLaws: function () { alert("Livre des Lois : Bientôt disponible !"); }
    };

    // Raccourcis globaux
    window.toggleBuildMenu = () => UI.HUD.Bottom.toggleBuildMenu();
    window.toggleTech = () => UI.HUD.Bottom.toggleTech();
    window.toggleLaws = () => UI.HUD.Bottom.toggleLaws();
    window.toggleMenu = () => alert("Menu: Bientôt disponible");

})();
