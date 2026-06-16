// public/games/system/core/grid/GridSystem.js
// Système de grille unifié - Version modulaire pour Frost/Farm

window.GridSystem = {
    // === CONFIGURATION ===
    GRID_SIZE: 41,
    TILE_SIZE: 32,
    GROWTH_DURATION: 10,

    // === TYPES DE CELLULES ===
    CELL_TYPES: {
        EMPTY: 'empty',
        ROAD: 'road',
        BUILDING: 'building',
        NATURAL_ZONE: 'natural', // Zone fixe (terre cultivable) 4x4
        MANUAL_ZONE: 'manual',   // Zone placée (Hothouse) 4x4
        WOOD_WALL: 'wood_wall', // Mur de bois (Gisement mural de bois) 5x5
        WOOD_STACK: 'wood_stack', // Tas de bois (quantité limitée) 2x2
        COAL_WALL: 'coal_wall', // Mur de charbon (Gisement mural de charbon) 5x5
        COAL_STACK: 'coal_stack', // Tas de charbon (quantité limitée) 2x2
        PLANTED: 'planted',
        GROWING: 'growing',
        READY: 'ready',
        PORTAL: 'portal'
    },

    grid: [],
    farmingData: {}, // { "col_row": { seedType, growthStage, watered } }

    init: function () {
        console.log(`🌍 GridSystem Initializing (${this.GRID_SIZE}x${this.GRID_SIZE})...`);
        this.GRID_SIZE = Config.GRID_SIZE || 41;
        this.TILE_SIZE = Config.TILE_SIZE || 32;

        // Créer la grille 2D
        this.grid = [];
        for (let col = 0; col < this.GRID_SIZE; col++) {
            this.grid[col] = [];
            for (let row = 0; row < this.GRID_SIZE; row++) {
                this.grid[col][row] = this.CELL_TYPES.EMPTY;
            }
        }
        this.farmingData = {};
        this.mapElements = {};
    },

    // === CONVERSION COORDONNÉES ===
    gridToWorld: function (col, row, w = 1, h = 1) {
        const half = (this.GRID_SIZE * this.TILE_SIZE) / 2;
        return {
            x: (col * this.TILE_SIZE) - half + (w * this.TILE_SIZE) / 2,
            y: (row * this.TILE_SIZE) - half + (h * this.TILE_SIZE) / 2
        };
    },

    worldToGrid: function (x, y) {
        const half = (this.GRID_SIZE * this.TILE_SIZE) / 2;
        const col = Math.floor((x + half) / this.TILE_SIZE);
        const row = Math.floor((y + half) / this.TILE_SIZE);
        return { col, row };
    },

    // === GESTION DE LA GRILLE ===
    isOccupied: function (col, row, w = 1, h = 1) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                const c = col + i;
                const r = row + j;
                if (c < 0 || c >= this.GRID_SIZE || r < 0 || r >= this.GRID_SIZE) return true;
                if (this.grid[c][r] !== this.CELL_TYPES.EMPTY &&
                    this.grid[c][r] !== this.CELL_TYPES.NATURAL_ZONE &&
                    this.grid[c][r] !== this.CELL_TYPES.WOOD_WALL &&
                    this.grid[c][r] !== this.CELL_TYPES.WOOD_STACK &&
                    this.grid[c][r] !== this.CELL_TYPES.COAL_WALL &&
                    this.grid[c][r] !== this.CELL_TYPES.COAL_STACK &&
                    this.grid[c][r] !== this.CELL_TYPES.MANUAL_ZONE) return true;
            }
        }
        return false;
    },

    isTraversable: function (col, row) {
        if (col < 0 || col >= this.GRID_SIZE || row < 0 || row >= this.GRID_SIZE) return false;
        const cell = this.grid[col][row];
        // On peut marcher sur le vide ou sur les routes
        return cell === this.CELL_TYPES.EMPTY || cell === this.CELL_TYPES.ROAD;
    },

    // Vérifie si une zone de 4x4 contient un type spécifique
    checkZoneType: function (col, row, w, h, requiredType) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                const c = col + i;
                const r = row + j;
                if (this.grid[c][r] !== requiredType) return false;
            }
        }
        return true;
    },

    place: function (col, row, type, w = 1, h = 1) {
        // Enregistrement dans la grille logique
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.grid[col + i][row + j] = type;
            }
        }
        return true;
    },

    remove: function (col, row, w = 1, h = 1) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.grid[col + i][row + j] = this.CELL_TYPES.EMPTY;
            }
        }
        return true;
    },

    clearArea: function (col, row, w, h) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                const c = col + i;
                const r = row + j;
                const key = `${c},${r}`;

                // Vérifier si un élément de carte existe à cet endroit
                if (this.mapElements && this.mapElements[key]) {
                    const el = this.mapElements[key];
                    // On ne restaure que si c'est une ressource avec (amount > 0)
                    if (el.amount !== undefined && el.amount > 0) {
                        this.grid[c][r] = el.id; // Restaurer l'ID (ex: 'coal_stack')
                        continue;
                    }
                }

                // Sinon, vider
                this.grid[c][r] = this.CELL_TYPES.EMPTY;
            }
        }
        return true;
    },

    mapElements: {}, // Stocke les références aux éléments de carte par coordonnées "col,row"

    registerMapElement: function (col, row, w, h, element) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.mapElements[`${col + i},${row + j}`] = element;
            }
        }
    },

    // BFS pour vérifier la connexion au générateur (via routes ou directement)
    checkNetworkConnection: function (startCol, startRow) {
        // Liste des cases à explorer (Open Set) - On démarre par les cloisons adjacentes
        // Note: Cette fonction suppose qu'on a déjà trouvé une case adjacente 'road' ou 'generator'
        // Mais pour faire propre, on devrait lancer le BFS depuis la case 'road' adjacente.

        // Optim: Un bâtiment 3x3 touche bcp de routes. On test chaque route adjacente?
        // NON: On part du bâtiment. Si une de ses cloisons touche le générateur => OK.
        // Sinon, si elle touche une route, on doit vérifier si CETTE route mène au générateur.

        let visited = new Set();
        let queue = [];
        let key = (c, r) => `${c},${r}`;

        // 1. Ajouter la case de départ (la route adjacente identifiée)
        if (this.grid[startCol][startRow] === 'generator') return true;
        queue.push({ c: startCol, r: startRow });
        visited.add(key(startCol, startRow));

        while (queue.length > 0) {
            let current = queue.shift();

            // Check voisins
            const neighbors = [
                { c: current.c + 1, r: current.r },
                { c: current.c - 1, r: current.r },
                { c: current.c, r: current.r + 1 },
                { c: current.c, r: current.r - 1 }
            ];

            for (let n of neighbors) {
                // Hors limites
                if (n.c < 0 || n.c >= this.GRID_SIZE || n.r < 0 || n.r >= this.GRID_SIZE) continue;

                // Déjà visité
                if (visited.has(key(n.c, n.r))) continue;

                const cell = this.grid[n.c][n.r];

                if (cell === 'generator') return true; // TROUVÉ !

                if (cell === 'road') {
                    visited.add(key(n.c, n.r));
                    queue.push(n);
                }
            }
        }
        return false;
    }
};
