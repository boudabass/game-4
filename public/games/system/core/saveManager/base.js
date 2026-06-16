// public/games/system/core/saveManager/base.js
// Point d'entrée window.SaveManager

(function () {
    console.log("💾 SaveManager System Initializing...");

    window.SaveManager = {
        SAVE_KEY: 'dyad-game-save',

        init: function (config) {
            if (config && config.id) {
                this.SAVE_KEY = `${config.id}-save`;
            }
            console.log(`💾 SaveManager initialized with key: ${this.SAVE_KEY}`);
        }
    };
})();
