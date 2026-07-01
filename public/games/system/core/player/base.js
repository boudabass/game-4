// public/games/system/core/player/base.js
// Gestionnaire global du joueur

(function () {
    console.log("👤 Player System Initializing...");

    window.PlayerSystem = {
        player: null,

        init: function (config) {
            const startCol = config.col || 5;
            const startRow = config.row || 5;

            this.player = new Player(startCol, startRow);
            console.log("👤 Player created via PlayerSystem");
        },

        update: function () {
            if (this.player) this.player.update();
        }
    };
})();
