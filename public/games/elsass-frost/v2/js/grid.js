/*
 * grid.js — Grille d'occupation + placement + connexité des routes.
 * La grille est reconstruite depuis EFState.buildings/roads (jamais
 * sérialisée elle-même : une seule source de vérité).
 */
window.EFGrid = {
    cells: null,     // GRID_SIZE x GRID_SIZE : null | {kind:"b", idx} | {kind:"r"}
    connected: null, // Set d'index de bâtiments reliés au générateur par la route

    rebuild: function () {
        const C = window.EFConfig, S = window.EFState;
        const N = C.GRID_SIZE;
        this.cells = new Array(N);
        for (let i = 0; i < N; i++) this.cells[i] = new Array(N).fill(null);

        S.buildings.forEach((b, idx) => {
            const def = C.BUILDINGS[b.type];
            for (let dx = 0; dx < def.w; dx++)
                for (let dy = 0; dy < def.h; dy++)
                    if (this.inBounds(b.x + dx, b.y + dy))
                        this.cells[b.x + dx][b.y + dy] = { kind: "b", idx: idx };
        });
        for (const r of S.roads) {
            if (this.inBounds(r.x, r.y) && !this.cells[r.x][r.y])
                this.cells[r.x][r.y] = { kind: "r" };
        }
        this.computeConnectivity();
    },

    inBounds: function (x, y) {
        const N = window.EFConfig.GRID_SIZE;
        return x >= 0 && y >= 0 && x < N && y < N;
    },

    isFree: function (x, y) {
        return this.inBounds(x, y) && this.cells[x][y] === null;
    },

    // Une zone w*h est-elle libre ?
    canPlace: function (x, y, w, h) {
        for (let dx = 0; dx < w; dx++)
            for (let dy = 0; dy < h; dy++)
                if (!this.isFree(x + dx, y + dy)) return false;
        return true;
    },

    buildingAt: function (x, y) {
        if (!this.inBounds(x, y)) return -1;
        const c = this.cells[x][y];
        return c && c.kind === "b" ? c.idx : -1;
    },

    roadAt: function (x, y) {
        if (!this.inBounds(x, y)) return false;
        const c = this.cells[x][y];
        return !!(c && c.kind === "r");
    },

    // BFS depuis les routes adjacentes au générateur ; marque les bâtiments
    // touchés par une route connectée. Bonus de production (ROAD_BONUS).
    computeConnectivity: function () {
        const S = window.EFState, C = window.EFConfig;
        this.connected = new Set();
        const gen = S.buildings.find(b => b.type === "generator");
        if (!gen) return;
        const def = C.BUILDINGS.generator;

        const visited = new Set();
        const queue = [];
        // Routes qui touchent le pourtour du générateur
        for (let dx = -1; dx <= def.w; dx++) {
            for (let dy = -1; dy <= def.h; dy++) {
                const x = gen.x + dx, y = gen.y + dy;
                if (this.roadAt(x, y) && !visited.has(x + "," + y)) {
                    visited.add(x + "," + y);
                    queue.push([x, y]);
                }
            }
        }
        const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        while (queue.length) {
            const [x, y] = queue.pop();
            for (const [ddx, ddy] of DIRS) {
                const nx = x + ddx, ny = y + ddy;
                if (this.roadAt(nx, ny) && !visited.has(nx + "," + ny)) {
                    visited.add(nx + "," + ny);
                    queue.push([nx, ny]);
                } else {
                    const bi = this.buildingAt(nx, ny);
                    if (bi >= 0) this.connected.add(bi);
                }
            }
        }
    },

    isConnected: function (buildingIdx) {
        return this.connected && this.connected.has(buildingIdx);
    },

    // Distance (en cases) entre le centre d'un bâtiment et une source de chaleur
    distTiles: function (b1, def1, b2, def2) {
        const cx1 = b1.x + def1.w / 2, cy1 = b1.y + def1.h / 2;
        const cx2 = b2.x + def2.w / 2, cy2 = b2.y + def2.h / 2;
        return Math.hypot(cx1 - cx2, cy1 - cy2);
    }
};
