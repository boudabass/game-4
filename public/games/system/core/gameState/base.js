// public/games/system/core/gameState/base.js
// Initialisation de l'objet global GameState

(function () {
    console.log("🎮 GameState Base System Initializing...");

    window.GameState = {
        // Objets pour stocker les composants étendus sil y en a besoin
        modules: {},

        // Méthode de réinitialisation de base
        reset: function () {
            console.log("🔄 Resetting GameState to defaults...");
            if (this.data && typeof this.data.reset === 'function') {
                this.data.reset();
            }
        }
    };
})();
