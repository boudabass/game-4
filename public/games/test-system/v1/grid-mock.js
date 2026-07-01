// public/games/test-system/grid-mock.js
// Mock minimal de GridSystem pour le test-system

window.GridSystem = {
    get GRID_SIZE() { return Config.GRID_SIZE || 40; },
    get TILE_SIZE() { return Config.TILE_SIZE || 32; },
    grid: [],

    init: function () {
        this.grid = Array(this.GRID_SIZE).fill().map(() => Array(this.GRID_SIZE).fill(null));
    },

    isTraversable: function (col, row) {
        if (col < 0 || col >= this.GRID_SIZE || row < 0 || row >= this.GRID_SIZE) return false;
        // Occupé par un bâtiment
        if (this.grid[col][row]) return false;
        return true;
    },

    isOccupied: function (col, row, w = 1, h = 1) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                const c = col + i;
                const r = row + j;
                if (c < 0 || c >= this.GRID_SIZE || r < 0 || r >= this.GRID_SIZE) return true;
                if (this.grid[c][r]) return true;
            }
        }
        return false;
    },

    place: function (col, row, id, w = 1, h = 1) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.grid[col + i][row + j] = id;
            }
        }
        return true;
    },

    clearArea: function (col, row, w = 1, h = 1) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.grid[col + i][row + j] = null;
            }
        }
    },

    gridToWorld: function (col, row, w = 1, h = 1) {
        return {
            x: (col - this.GRID_SIZE / 2 + (w / 2)) * this.TILE_SIZE,
            y: (row - this.GRID_SIZE / 2 + (h / 2)) * this.TILE_SIZE
        };
    },

    worldToGrid: function (x, y) {
        const col = Math.floor(x / this.TILE_SIZE + this.GRID_SIZE / 2);
        const row = Math.floor(y / this.TILE_SIZE + this.GRID_SIZE / 2);
        return { col, row };
    }
};
GridSystem.init();
console.log("🔲 Grid Mock Loaded");
