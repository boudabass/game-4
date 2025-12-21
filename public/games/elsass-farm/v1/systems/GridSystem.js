// systems/GridSystem.js
// Système de grille pour le farming - Gestion des tuiles et cultures

window.GridSystem = {
    // Constantes
    GRID_SIZE: 10,           // 10x10 = 100 tuiles
    TILE_SIZE: 64,           // Taille en pixels
    GROWTH_DURATION: 10,     // 10 Jours pour maturité

    // États possibles d'une tuile
    STATES: {
        EMPTY: 'EMPTY',           // Terre vide
        PLANTED: 'PLANTED',       // Graine plantée (J0)
        GROWING: 'GROWING',       // En croissance (J1-9)
        READY: 'READY',           // Prêt à récolter (J10)
        HARVESTED: 'HARVESTED'    // Récolté (reset immédiat)
    },

    // Grilles par zone (stockées dans GameState pour persistance)
    grids: {},

    // Initialise une grille vide pour une zone
    initGrid: function (zoneId) {
        if (this.grids[zoneId]) {
            console.log(`Grille ${zoneId} déjà initialisée`);
            return this.grids[zoneId];
        }

        const grid = [];
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                grid.push({
                    id: row * this.GRID_SIZE + col,
                    row: row,
                    col: col,
                    state: this.STATES.EMPTY,
                    watered: false,
                    seedType: null,
                    growthStage: 0, // NEW: Compteur précis (0 à 10)
                    season: null
                });
            }
        }

        this.grids[zoneId] = grid;
        console.log(`✅ Grille ${zoneId} initialisée (${grid.length} tuiles)`);
        return grid;
    },

    // Récupère la grille active (zone courante)
    getActiveGrid: function () {
        const zoneId = GameState.currentZoneId;
        if (!this.grids[zoneId]) {
            this.initGrid(zoneId);
        }
        return this.grids[zoneId];
    },

    // Récupère une tuile par position grille
    getTile: function (col, row) {
        const grid = this.getActiveGrid();
        const index = row * this.GRID_SIZE + col;
        return grid[index] || null;
    },

    // Convertit coordonnées monde → grille
    worldToGrid: function (worldX, worldY) {
        // Offset pour centrer la grille dans la zone
        const offsetX = (Config.zoneWidth - this.GRID_SIZE * this.TILE_SIZE) / 2;
        const offsetY = (Config.zoneHeight - this.GRID_SIZE * this.TILE_SIZE) / 2;

        const col = Math.floor((worldX - offsetX) / this.TILE_SIZE);
        const row = Math.floor((worldY - offsetY) / this.TILE_SIZE);

        // Vérifier les limites
        if (col >= 0 && col < this.GRID_SIZE && row >= 0 && row < this.GRID_SIZE) {
            return { col, row, valid: true };
        }
        return { col: -1, row: -1, valid: false };
    },

    // Convertit coordonnées grille → monde (centre de la tuile)
    gridToWorld: function (col, row) {
        const offsetX = (Config.zoneWidth - this.GRID_SIZE * this.TILE_SIZE) / 2;
        const offsetY = (Config.zoneHeight - this.GRID_SIZE * this.TILE_SIZE) / 2;

        return {
            x: offsetX + col * this.TILE_SIZE + this.TILE_SIZE / 2,
            y: offsetY + row * this.TILE_SIZE + this.TILE_SIZE / 2
        };
    },

    // --- Actions sur les tuiles ---

    // Planter une graine
    plant: function (col, row, seedType) {
        const tile = this.getTile(col, row);
        if (!tile) return { success: false, message: "Tuile invalide" };

        if (tile.state !== this.STATES.EMPTY) {
            return { success: false, message: "Cette tuile n'est pas vide" };
        }

        // Vérifier Compatibilité Saison
        // On cherche la graine dans l'inventaire pour vérifier sa saison
        let seedSeason = null;
        if (window.Inventory && Inventory.player && Inventory.player.seeds) {
            for (let s in Inventory.player.seeds) {
                const found = Inventory.player.seeds[s].find(seed => seed.id === seedType);
                if (found) {
                    seedSeason = s;
                    break;
                }
            }
        }

        // Si la graine a une saison définie et qu'elle ne correspond pas à la saison actuelle
        if (seedSeason && seedSeason !== GameState.season) {
            return { success: false, message: "Mauvaise saison !" };
        }

        // Vérifier l'énergie
        const energyCost = 4;
        if (!GameState.spendEnergy(energyCost)) {
            return { success: false, message: "Pas assez d'énergie" };
        }

        tile.state = this.STATES.PLANTED;
        tile.seedType = seedType;
        tile.growthStage = 0; // J0
        tile.season = GameState.season;
        tile.watered = false;

        if (window.refreshHUD) window.refreshHUD();
        console.log(`🌱 Planté ${seedType} à (${col}, ${row})`);

        return { success: true, message: "Plante plantée ! (-1 Stock)" };
    },

    // Arroser une tuile
    water: function (col, row) {
        const tile = this.getTile(col, row);
        if (!tile) return { success: false, message: "Tuile invalide" };

        if (tile.state === this.STATES.EMPTY || tile.state === this.STATES.HARVESTED) {
            return { success: false, message: "Rien à arroser ici" };
        }

        if (tile.watered) {
            return { success: false, message: "Déjà arrosée aujourd'hui" };
        }

        // Vérifier l'énergie
        const energyCost = 2;
        if (!GameState.spendEnergy(energyCost)) {
            return { success: false, message: "Pas assez d'énergie" };
        }

        tile.watered = true;

        if (window.refreshHUD) window.refreshHUD();
        console.log(`💧 Arrosé (${col}, ${row})`);

        return { success: true, message: "Tuile arrosée !" };
    },

    // Récolter une tuile
    harvest: function (col, row) {
        const tile = this.getTile(col, row);
        if (!tile) return { success: false, message: "Tuile invalide" };

        if (tile.state !== this.STATES.READY) {
            return { success: false, message: "Cette culture n'est pas prête" };
        }

        // Vérifier l'énergie
        const energyCost = 1;
        if (!GameState.spendEnergy(energyCost)) {
            return { success: false, message: "Pas assez d'énergie" };
        }

        const harvestedType = tile.seedType;

        // Reset la tuile
        tile.state = this.STATES.EMPTY;
        tile.seedType = null;
        tile.growthStage = 0;
        tile.watered = false;
        tile.season = null;

        // Ajouter au stock UNIFIÉ
        // Rendement x2 : On récupère la semence + 1 fruit (Gain net +1)
        if (window.Inventory) {
            Inventory.addLoot(harvestedType, 2);
        }

        if (window.refreshHUD) window.refreshHUD();
        console.log(`🌾 Récolté ${harvestedType} à (${col}, ${row})`);

        return { success: true, message: `${harvestedType} récolté ! (+2 Stock)`, item: harvestedType };
    },

    // --- Cycle journalier ---

    // Appelé à la fin de chaque jour pour faire pousser les cultures
    processNightCycle: function () {
        let growthCount = 0;
        let readyCount = 0;

        // Traiter toutes les grilles
        for (const zoneId in this.grids) {
            const grid = this.grids[zoneId];

            for (const tile of grid) {
                const wasWatered = tile.watered;
                tile.watered = false; // Reset arrosage quotidien

                // LOGIQUE DE POUSSE (10 Jours)
                if (wasWatered && tile.state !== this.STATES.EMPTY && tile.state !== this.STATES.READY) {

                    // Incrémenter l'étape de croissance
                    if (!tile.growthStage) tile.growthStage = 0;
                    tile.growthStage++;
                    growthCount++;

                    // Mise à jour de l'état visuel et logique
                    if (tile.growthStage >= this.GROWTH_DURATION) {
                        tile.state = this.STATES.READY;
                        readyCount++;
                    } else if (tile.growthStage > 0) {
                        // Reste ou devient GROWING (visuel plante verte)
                        tile.state = this.STATES.GROWING;
                    }
                }
                // Si pas arrosé : Ne rien faire (Pause, le growthStage n'augmente pas)
            }
        }

        console.log(`🌙 Cycle nuit: ${growthCount} cultures ont poussé, ${readyCount} prêtes.`);
    },

    // --- Rendu ---

    // Dessine la grille sur le canvas p5.js
    draw: function () {
        const offsetX = (Config.zoneWidth - this.GRID_SIZE * this.TILE_SIZE) / 2;
        const offsetY = (Config.zoneHeight - this.GRID_SIZE * this.TILE_SIZE) / 2;
        const grid = this.getActiveGrid();

        push();

        // Dessiner chaque tuile
        for (const tile of grid) {
            const x = offsetX + tile.col * this.TILE_SIZE;
            const y = offsetY + tile.row * this.TILE_SIZE;

            // Couleur de fond selon l'état
            this.drawTile(x, y, tile);
        }

        pop();
    },

    // Dessine une tuile individuelle
    drawTile: function (x, y, tile) {
        // Couleur de base (terre)
        let fillColor = color(139, 90, 43);  // Marron terre

        // Modifier selon l'état
        switch (tile.state) {
            case this.STATES.PLANTED:
                fillColor = color(101, 67, 33);  // Marron foncé
                break;
            case this.STATES.GROWING:
                fillColor = color(85, 107, 47);  // Vert olive
                break;
            case this.STATES.READY:
                fillColor = color(34, 139, 34);  // Vert forêt
                break;
        }

        // Effet arrosage (teinte bleue)
        if (tile.watered) {
            fillColor = lerpColor(fillColor, color(70, 130, 180), 0.3);
        }

        // Dessiner la tuile
        fill(fillColor);
        stroke(60, 40, 20);
        strokeWeight(1);
        rect(x, y, this.TILE_SIZE, this.TILE_SIZE, 4);

        // Icône centrale selon l'état
        if (tile.state !== this.STATES.EMPTY) {
            textAlign(CENTER, CENTER);
            textSize(24);
            noStroke();
            fill(255);

            // Afficher l'icône de la graine spécifique si disponible
            let icon = this.getSeedIcon(tile.seedType, tile.state);
            text(icon, x + this.TILE_SIZE / 2, y + this.TILE_SIZE / 2);
        }
    },

    // Récupère l'icône appropriée pour une graine
    getSeedIcon: function (seedType, state) {
        // Icônes par type de graine
        const seedIcons = {
            'potato': { planted: '🥔', growing: '🥔', ready: '🥔' },
            'leek': { planted: '🧅', growing: '🧅', ready: '🧅' },
            'cabbage': { planted: '🥬', growing: '🥬', ready: '🥬' },
            'radish': { planted: '🌱', growing: '🌿', ready: '🥗' },
            'blueberry': { planted: '🫐', growing: '🫐', ready: '🫐' },
            'beans': { planted: '🫘', growing: '🫘', ready: '🫘' },
            'pepper': { planted: '🌶️', growing: '🌶️', ready: '🌶️' },
            'melon': { planted: '🍈', growing: '🍈', ready: '🍈' },
            'eggplant': { planted: '🍆', growing: '🍆', ready: '🍆' },
            'pumpkin': { planted: '🎃', growing: '🎃', ready: '🎃' },
            'mushroom': { planted: '🍄', growing: '🍄', ready: '🍄' },
            'garlic': { planted: '🧄', growing: '🧄', ready: '🧄' }
        };

        const stateKey = state === this.STATES.PLANTED ? 'planted' :
            state === this.STATES.GROWING ? 'growing' : 'ready';

        if (seedIcons[seedType]) {
            return seedIcons[seedType][stateKey];
        }

        // Fallback générique
        switch (state) {
            case this.STATES.PLANTED: return '🌱';
            case this.STATES.GROWING: return '🌿';
            case this.STATES.READY: return '🌾';
            default: return '';
        }
    },

    // --- Sauvegarde ---

    // Exporte toutes les grilles pour sauvegarde
    export: function () {
        return JSON.parse(JSON.stringify(this.grids));
    },

    // Importe les grilles depuis une sauvegarde
    import: function (data) {
        if (data && typeof data === 'object') {
            this.grids = data;
            console.log("📦 Grilles importées");
        }
    }
};

console.log("✅ GridSystem.js chargé");