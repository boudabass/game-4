// systems/PlayerSystem.js
// Gestionnaire global du joueur
// Adapté depuis test-personnage/v1

window.PlayerSystem = {
    player: null,

    init: function () {
        // Position de départ (depuis GameState chargé, sinon Config, sinon par défaut)
        const startPos = {
            col: GameState.playerCol !== undefined ? GameState.playerCol : (Config.playerStartPos ? Config.playerStartPos.col : 5),
            row: GameState.playerRow !== undefined ? GameState.playerRow : (Config.playerStartPos ? Config.playerStartPos.row : 5)
        };

        // Vérifier que la position de départ est valide et traversable
        if (!GridSystem.isTraversable(startPos.col, startPos.row)) {
            console.warn(`⚠️ Position de départ (${startPos.col},${startPos.row}) non traversable, recherche d'une position valide...`);

            // Chercher une case traversable proche
            let found = false;
            for (let radius = 1; radius < 5 && !found; radius++) {
                for (let dc = -radius; dc <= radius && !found; dc++) {
                    for (let dr = -radius; dr <= radius && !found; dr++) {
                        const testCol = startPos.col + dc;
                        const testRow = startPos.row + dr;
                        if (GridSystem.isTraversable(testCol, testRow)) {
                            startPos.col = testCol;
                            startPos.row = testRow;
                            found = true;
                            console.log(`✅ Position valide trouvée: (${testCol},${testRow})`);
                        }
                    }
                }
            }
        }

        this.player = new Player(startPos.col, startPos.row);
        console.log(`✅ PlayerSystem initialisé`);
    },

    update: function () {
        if (this.player) {
            this.player.update();
        }
    },

    moveTo: function (targetCol, targetRow) {
        if (!this.player) {
            console.warn("⚠️ PlayerSystem: player non initialisé");
            return;
        }

        // Vérifier que la destination est valide
        if (targetCol < 0 || targetCol >= GridSystem.GRID_SIZE ||
            targetRow < 0 || targetRow >= GridSystem.GRID_SIZE) {
            console.warn(`⚠️ Destination (${targetCol},${targetRow}) hors limites`);
            return;
        }

        console.log(`🎯 Calcul du chemin de (${this.player.gridCol},${this.player.gridRow}) vers (${targetCol},${targetRow})`);

        const path = PathfindingSystem.findPath(
            this.player.gridCol,
            this.player.gridRow,
            targetCol,
            targetRow
        );

        if (path) {
            // Tronquer le chemin pour s'arrêter une case avant la cible (visuellement plus clair)
            if (path.length > 0) {
                path.pop();
            }
            this.player.setPath(path);
        } else {
            console.log("❌ Aucun chemin trouvé");
        }
    },

    // Repositionne le joueur selon les données actuelles de GameState (utile après chargement de sauvegarde)
    repositionFromGameState: function () {
        if (!this.player) return;

        const col = GameState.playerCol !== undefined ? GameState.playerCol : (Config.playerStartPos ? Config.playerStartPos.col : 5);
        const row = GameState.playerRow !== undefined ? GameState.playerRow : (Config.playerStartPos ? Config.playerStartPos.row : 5);

        const worldPos = GridSystem.gridToWorld(col, row);
        this.player.sprite.x = worldPos.x;
        this.player.sprite.y = worldPos.y;
        this.player.gridCol = col;
        this.player.gridRow = row;
        this.player.targetWorldX = worldPos.x;
        this.player.targetWorldY = worldPos.y;
        this.player.isMoving = false;
        this.player.path = [];

        // Centrer la caméra
        if (window.camera) {
            camera.x = worldPos.x;
            camera.y = worldPos.y;
        }

        console.log(`👤 Joueur repositionné à (${col}, ${row}) suite au chargement.`);
    }
};

console.log("✅ PlayerSystem.js chargé");
