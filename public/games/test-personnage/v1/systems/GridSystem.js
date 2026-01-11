window.GridSystem = {
    grid: [],
    tileSize: 60,
    size: 20,
    offsetX: 0,
    offsetY: 0,

    init: function () {
        this.size = Config.GRID_SIZE;
        this.tileSize = Config.TILE_SIZE;
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(null));

        // Centrer la grille au milieu de l'écran par défaut
        // Sera ajusté dans sketch.js draw
    },

    // Coordonnées Grille [col, row] -> Monde [x, y] (Centre du rectangle)
    gridToWorld: function (col, row, w = 1, h = 1) {
        const startX = (col - this.size / 2) * this.tileSize;
        const startY = (row - this.size / 2) * this.tileSize;

        return {
            x: startX + (w * this.tileSize) / 2,
            y: startY + (h * this.tileSize) / 2
        };
    },

    // Coordonnées Monde [x, y] -> Grille [col, row] (Top-Left du bâtiment potentiel sous la souris)
    worldToGrid: function (x, y) {
        return {
            col: Math.floor((x + (this.size * this.tileSize / 2)) / this.tileSize),
            row: Math.floor((y + (this.size * this.tileSize / 2)) / this.tileSize)
        };
    },

    isOccupied: function (col, row, w = 1, h = 1) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                const c = col + i;
                const r = row + j;
                if (c < 0 || c >= this.size || r < 0 || r >= this.size) return true;
                if (this.grid[c][r] !== null) return true;
            }
        }
        return false;
    },

    place: function (col, row, buildingId, w = 1, h = 1) {
        if (!this.isOccupied(col, row, w, h)) {
            for (let i = 0; i < w; i++) {
                for (let j = 0; j < h; j++) {
                    this.grid[col + i][row + j] = buildingId;
                }
            }
            return true;
        }
        return false;
    },

    draw: function () {
        if (!Config.DEBUG_MODE) return;

        camera.on();
        stroke(255, 255, 255, 20);
        strokeWeight(1);
        noFill();

        const halfSize = (this.size * this.tileSize) / 2;

        for (let i = 0; i <= this.size; i++) {
            let pos = i * this.tileSize - halfSize;
            line(pos, -halfSize, pos, halfSize);
            line(-halfSize, pos, halfSize, pos);
        }
        camera.off();
    }
};
