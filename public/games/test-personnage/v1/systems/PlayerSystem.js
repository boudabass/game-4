window.PlayerSystem = {
    player: null,

    init: function () {
        // Position de départ : LOIN du générateur pour tester le mouvement
        // On place le joueur en bas à droite du générateur
        this.player = new Player(23, 23);
        console.log("Player initialized at 23,23 (bottom-right road)");
    },

    update: function () {
        if (this.player) {
            this.player.update();
        }
    },

    // Appelé quand on clique sur la map pour se déplacer
    moveTo: function (targetCol, targetRow) {
        if (!this.player) return;

        // Calcul du chemin
        const startCol = this.player.gridCol;
        const startRow = this.player.gridRow;

        console.log(`Pathfinding request: [${startCol},${startRow}] -> [${targetCol},${targetRow}]`);

        const path = PathfindingSystem.findPath(startCol, startRow, targetCol, targetRow);

        if (path) {
            console.log("Path found:", path);
            this.player.setPath(path);
        } else {
            console.log("No path found (Must follow roads)");
            // Feedback visuel "Impossible" ?
        }
    }
};
