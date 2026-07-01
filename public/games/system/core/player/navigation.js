// public/games/system/core/player/navigation.js
// Logique de déplacement du joueur

(function () {
    if (!window.PlayerSystem) return;

    window.PlayerSystem.moveTo = function (targetCol, targetRow) {
        if (!this.player) return;

        console.log(`🎯 Pathfinding vers (${targetCol},${targetRow})`);

        const path = PathfindingSystem.findPath(
            this.player.gridCol,
            this.player.gridRow,
            targetCol,
            targetRow
        );

        if (path) {
            // Optionnel : s'arrêter une case avant (comme dans Farm)
            // if (path.length > 0) path.pop(); 
            this.player.setPath(path);
        }
    };

    console.log("🚀 Player Navigation Module Loaded");
})();
