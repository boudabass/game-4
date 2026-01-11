// systems/GridSystem.js
// Système de grille unifié - Grille mondiale 20x20 + Farming intégré
// Version 2.0 - Refonte complète

window.GridSystem = {
    // === CONFIGURATION ===
    GRID_SIZE: 41,           // Grille mondiale 21x21
    TILE_SIZE: 32,           // Taille d'une case (synchronisée avec Config)
    GROWTH_DURATION: 10,     // Jours pour maturité des cultures

    // === TYPES DE CELLULES ===
    CELL_TYPES: {
        EMPTY: 'empty',           // Case vide (fixe, non modifiable)
        ROAD: 'road',             // Route (fixe, traversable)
        BUILDING: 'building',     // Bâtiment (fixe, non traversable)
        FIELD_ZONE: 'field_zone', // Zone de champ vide (modifiable)
        PLANTED: 'planted',       // Champ avec culture plantée
        GROWING: 'growing',       // Culture en croissance
        READY: 'ready',           // Culture prête à récolter
        MACHINE: 'machine',       // Machine placée (modifiable)
        PORTAL: 'portal'          // Portail de changement de zone
    },

    // === DONNÉES ===
    grids: {},               // Grilles par zoneId { "C_C": [[]], ... }
    baseMaps: {},            // Cartes de base chargées { "C_C": [[]], ... }
    modifiableZones: [],     // Rectangles modifiables (globaux ou par zone ?)
    farmingData: {},         // Données de farming par zoneid { "C_C": { "col_row": {...} }, ... }
    MAPS_PATH: 'data/maps/',  // Chemin vers les cartes JSON

    // Helpers pour la zone actuelle
    getCurrentGrid: function () {
        const zoneId = (window.GameState && GameState.currentZoneId) || 'C_C';
        if (!this.grids[zoneId]) this.initZone(zoneId);
        return this.grids[zoneId];
    },

    getCurrentFarmingData: function () {
        const zoneId = (window.GameState && GameState.currentZoneId) || 'C_C';
        if (!this.farmingData[zoneId]) this.farmingData[zoneId] = {};
        return this.farmingData[zoneId];
    },

    // === INITIALISATION ===
    init: async function () {
        console.log(`🌍 Initialisation du GridSystem multi-zones (${Config.GRID_SIZE}x${Config.GRID_SIZE})...`);

        // Récupérer la config
        this.GRID_SIZE = Config.GRID_SIZE || 41;
        this.TILE_SIZE = Config.TILE_SIZE || 32;
        this.GROWTH_DURATION = Config.GROWTH_DURATION || 10;
        this.modifiableZones = Config.modifiableZones || [];

        // Charger la zone actuelle en priorité
        const initialZoneId = (window.GameState && GameState.currentZoneId) || 'C_C';
        await this.loadMap(initialZoneId);

        // Initialiser les autres zones définies dans Config (Optionnel: on pourrait le faire on-demand)
        if (Config.zones) {
            for (const zone of Config.zones) {
                if (zone.id !== initialZoneId) {
                    await this.loadMap(zone.id);
                }
            }
        }

        // Calculer les dimensions initiales pour la zone actuelle
        this.updateConfigDimensions();

        console.log(`✅ GridSystem initialisé avec ${Object.keys(this.baseMaps).length} cartes chargées.`);
    },

    // Charge un fichier map JSON
    loadMap: async function (zoneId) {
        if (this.baseMaps[zoneId]) return this.baseMaps[zoneId];

        try {
            console.log(`📂 Chargement de la carte : ${zoneId}...`);
            const response = await fetch(`${this.MAPS_PATH}${zoneId}.json`);
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

            const mapData = await response.json();
            this.baseMaps[zoneId] = mapData;

            // Initialiser la grille de jeu avec cette base si pas déjà fait
            if (!this.grids[zoneId]) {
                this.initZoneWithMap(zoneId, mapData);
            }

            return mapData;
        } catch (error) {
            console.error(`❌ Impossible de charger la carte ${zoneId}:`, error);
            // Fallback sur une grille vide
            this.initZone(zoneId);
            return null;
        }
    },

    // Initialise une zone avec une map chargée
    initZoneWithMap: function (zoneId, mapData) {
        console.log(`🏗️ Initialisation de la zone ${zoneId} depuis le fichier map.`);

        // On clone la map de base pour avoir notre instance modifiable
        this.grids[zoneId] = JSON.parse(JSON.stringify(mapData));
        this.farmingData[zoneId] = {};

        // Réappliquer les structures dynamiques/fixes (Portails, Zones modifiables)
        this.initModifiableZonesInZone(zoneId);
        this.placePortalsInZone(zoneId);
    },

    // Met à jour Config.zoneWidth/Height basé sur la grille actuelle
    updateConfigDimensions: function () {
        Config.zoneWidth = this.GRID_SIZE * this.TILE_SIZE;
        Config.zoneHeight = this.GRID_SIZE * this.TILE_SIZE;
        console.log(`📏 Dimensions de zone mises à jour : ${Config.zoneWidth}x${Config.zoneHeight}`);
    },

    // Initialise une zone spécifique
    initZone: function (zoneId) {
        if (this.grids[zoneId]) {
            // Même si la zone existe déjà (Chargement de sauvegarde), 
            // on s'assure que les portails sont présents sur la zone centrale.
            if (zoneId === 'C_C') {
                this.placePortalsInZone(zoneId);
            }
            return;
        }

        console.log(`🏗️ Initialisation de la zone : ${zoneId}`);

        // Créer la grille 2D
        this.grids[zoneId] = [];
        for (let col = 0; col < this.GRID_SIZE; col++) {
            this.grids[zoneId][col] = [];
            for (let row = 0; row < this.GRID_SIZE; row++) {
                this.grids[zoneId][col][row] = this.CELL_TYPES.EMPTY;
            }
        }

        this.farmingData[zoneId] = {};

        if (zoneId === 'C_C') {
            if (Config.worldMap && Array.isArray(Config.worldMap)) {
                this.loadWorldMapInZone(zoneId, Config.worldMap);
            } else {
                this.generateDefaultMapInZone(zoneId);
            }
            // Appliquer les zones modifiables (uniquement sur C_C pour le moment ?)
            this.initModifiableZonesInZone(zoneId);
            // Toujours assurer la présence des portails (même sur une sauvegarde existante)
            this.placePortalsInZone(zoneId);
        }
    },

    // Place les portails 3x3 dans une zone
    placePortalsInZone: function (zoneId) {
        if (!this.grids[zoneId]) return;
        const grid = this.grids[zoneId];
        const mid = Math.floor(this.GRID_SIZE / 2);

        console.log(`🌀 Placement/Vérification des portails 3x3 sur ${zoneId}...`);

        // Portail Nord (Haut)
        for (let c = mid - 1; c <= mid + 1; c++) {
            for (let r = 0; r <= 2; r++) {
                grid[c][r] = this.CELL_TYPES.PORTAL;
            }
        }
        // Portail Sud (Bas)
        for (let c = mid - 1; c <= mid + 1; c++) {
            for (let r = this.GRID_SIZE - 3; r < this.GRID_SIZE; r++) {
                grid[c][r] = this.CELL_TYPES.PORTAL;
            }
        }
        // Portail Ouest (Gauche)
        for (let c = 0; c <= 2; c++) {
            for (let r = mid - 1; r <= mid + 1; r++) {
                grid[c][r] = this.CELL_TYPES.PORTAL;
            }
        }
        // Portail Est (Droite)
        for (let c = this.GRID_SIZE - 3; c < this.GRID_SIZE; c++) {
            for (let r = mid - 1; r <= mid + 1; r++) {
                grid[c][r] = this.CELL_TYPES.PORTAL;
            }
        }
    },


    // Charger une map depuis la config dans une zone spécifique
    loadWorldMapInZone: function (zoneId, worldMap) {
        if (!this.grids[zoneId]) return;
        for (let row = 0; row < Math.min(worldMap.length, this.GRID_SIZE); row++) {
            for (let col = 0; col < Math.min(worldMap[row].length, this.GRID_SIZE); col++) {
                const cellType = worldMap[row][col];
                if (Object.values(this.CELL_TYPES).includes(cellType)) {
                    this.grids[zoneId][col][row] = cellType;
                }
            }
        }
        console.log(`🗺️ Map fixe chargée dans la zone ${zoneId}`);
    },

    // Générer une map par défaut dans une zone spécifique
    generateDefaultMapInZone: function (zoneId) {
        if (!this.grids[zoneId]) return;
        console.log(`🔨 Génération d'une map vide pour ${zoneId}...`);

        // On ne génère plus de routes ni de bâtiments de test
        // La grille reste remplie de CELL_TYPES.EMPTY par défaut

        console.log(`✅ Map vide générée pour ${zoneId}`);
    },

    // Initialiser les zones modifiables dans une zone spécifique
    initModifiableZonesInZone: function (zoneId) {
        if (!this.grids[zoneId]) return;
        const grid = this.grids[zoneId];

        for (const zone of this.modifiableZones) {
            for (let col = zone.col; col < zone.col + zone.width; col++) {
                for (let row = zone.row; row < zone.row + zone.height; row++) {
                    if (col >= 0 && col < this.GRID_SIZE && row >= 0 && row < this.GRID_SIZE) {
                        // NE PAS ÉCRASER si la case est déjà occupée (plantations chargées depuis le save)
                        if (grid[col][row] === this.CELL_TYPES.EMPTY) {
                            grid[col][row] = this.CELL_TYPES.FIELD_ZONE;
                        }
                    }
                }
            }
        }
        console.log(`🌾 Zones modifiables initialisées pour ${zoneId} (SANS écraser les plantations).`);
    },

    // === CONVERSION COORDONNÉES ===

    // Coordonnées Grille [col, row] -> Monde [x, y] (Centre du rectangle)
    gridToWorld: function (col, row, w = 1, h = 1) {
        const startX = (col - this.GRID_SIZE / 2) * this.TILE_SIZE;
        const startY = (row - this.GRID_SIZE / 2) * this.TILE_SIZE;

        return {
            x: startX + (w * this.TILE_SIZE) / 2,
            y: startY + (h * this.TILE_SIZE) / 2
        };
    },

    // Coordonnées Monde [x, y] -> Grille [col, row]
    worldToGrid: function (x, y) {
        const col = Math.floor((x + (this.GRID_SIZE * this.TILE_SIZE / 2)) / this.TILE_SIZE);
        const row = Math.floor((y + (this.GRID_SIZE * this.TILE_SIZE / 2)) / this.TILE_SIZE);

        // Vérifier les limites
        if (col >= 0 && col < this.GRID_SIZE && row >= 0 && row < this.GRID_SIZE) {
            return { col, row, valid: true };
        }
        return { col: -1, row: -1, valid: false };
    },

    // === GESTION DE LA GRILLE ===

    // Vérifie si une zone est occupée
    isOccupied: function (col, row, w = 1, h = 1) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                const c = col + i;
                const r = row + j;
                if (c < 0 || c >= this.GRID_SIZE || r < 0 || r >= this.GRID_SIZE) return true;

                const grid = this.getCurrentGrid();
                const cellType = grid[c][r];
                // Une case est occupée si ce n'est pas une zone de champ vide
                if (cellType !== this.CELL_TYPES.FIELD_ZONE) return true;
            }
        }
        return false;
    },

    // Vérifie si une zone est modifiable
    isModifiable: function (col, row) {
        if (col < 0 || col >= this.GRID_SIZE || row < 0 || row >= this.GRID_SIZE) return false;

        for (const zone of this.modifiableZones) {
            if (col >= zone.col && col < zone.col + zone.width &&
                row >= zone.row && row < zone.row + zone.height) {
                return true;
            }
        }
        return false;
    },

    // Vérifie si une case est traversable (pour pathfinding)
    isTraversable: function (col, row) {
        if (col < 0 || col >= this.GRID_SIZE || row < 0 || row >= this.GRID_SIZE) return false;

        const grid = this.getCurrentGrid();
        const cellType = grid[col][row];
        // Les routes, cases vides et champs (même plantés) sont traversables pour le pathfinding
        return cellType === this.CELL_TYPES.ROAD ||
            cellType === this.CELL_TYPES.EMPTY ||
            cellType === this.CELL_TYPES.FIELD_ZONE ||
            cellType === this.CELL_TYPES.PLANTED ||
            cellType === this.CELL_TYPES.GROWING ||
            cellType === this.CELL_TYPES.READY ||
            cellType === this.CELL_TYPES.PORTAL;
    },

    // Place un élément sur la grille
    place: function (col, row, type, w = 1, h = 1) {
        if (!this.isModifiable(col, row)) {
            console.warn(`⚠️ Case (${col},${row}) non modifiable`);
            return false;
        }

        if (!this.isOccupied(col, row, w, h)) {
            const grid = this.getCurrentGrid();
            for (let i = 0; i < w; i++) {
                for (let j = 0; j < h; j++) {
                    grid[col + i][row + j] = type;
                }
            }
            return true;
        }
        return false;
    },

    // Retire un élément de la grille
    remove: function (col, row) {
        if (col < 0 || col >= this.GRID_SIZE || row < 0 || row >= this.GRID_SIZE) return false;

        if (this.isModifiable(col, row)) {
            const grid = this.getCurrentGrid();
            const farmingData = this.getCurrentFarmingData();

            // Retour à zone de champ vide
            grid[col][row] = this.CELL_TYPES.FIELD_ZONE;

            // Supprimer les données de farming associées
            const key = `${col}_${row}`;
            delete farmingData[key];

            return true;
        }
        return false;
    },

    // Récupère une tuile/cellule
    getTile: function (col, row) {
        if (col < 0 || col >= this.GRID_SIZE || row < 0 || row >= this.GRID_SIZE) return null;

        const grid = this.getCurrentGrid();
        const farmingData = this.getCurrentFarmingData();

        const cellType = grid[col][row];
        const key = `${col}_${row}`;
        const farming = farmingData[key] || {};

        return {
            col,
            row,
            type: cellType,
            modifiable: this.isModifiable(col, row),
            // Données de farming si applicable
            seedType: farming.seedType || null,
            growthStage: farming.growthStage || 0,
            watered: farming.watered || false,
            season: farming.season || null
        };
    },

    // === FARMING (MIGRÉ DE L'ANCIEN SYSTÈME) ===

    // Planter une graine
    plant: function (col, row, seedType) {
        const tile = this.getTile(col, row);
        if (!tile) return { success: false, message: "Tuile invalide" };

        if (!tile.modifiable) {
            return { success: false, message: "Zone non modifiable" };
        }

        if (tile.type !== this.CELL_TYPES.FIELD_ZONE) {
            return { success: false, message: "Cette case n'est pas un champ vide" };
        }

        // Vérifier Compatibilité Saison (si système de saison existe)
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

        if (seedSeason && window.GameState && seedSeason !== GameState.season) {
            return { success: false, message: "Mauvaise saison !" };
        }

        // Vérifier l'énergie
        const energyCost = 4;
        if (window.GameState && !GameState.spendEnergy(energyCost)) {
            return { success: false, message: "Pas assez d'énergie" };
        }

        // Planter
        const grid = this.getCurrentGrid();
        const farmingData = this.getCurrentFarmingData();

        grid[col][row] = this.CELL_TYPES.PLANTED;
        const key = `${col}_${row}`;
        farmingData[key] = {
            seedType: seedType,
            growthStage: 0,
            watered: false,
            season: window.GameState ? GameState.season : null
        };

        if (window.refreshHUD) window.refreshHUD();
        console.log(`🌱 Planté ${seedType} à (${col}, ${row})`);

        return { success: true, message: "Plante plantée ! (-1 Stock)" };
    },

    // Arroser une tuile
    water: function (col, row) {
        const tile = this.getTile(col, row);
        if (!tile) return { success: false, message: "Tuile invalide" };

        if (tile.type !== this.CELL_TYPES.PLANTED && tile.type !== this.CELL_TYPES.GROWING) {
            return { success: false, message: "Rien à arroser ici" };
        }

        const farmingData = this.getCurrentFarmingData();
        const key = `${col}_${row}`;
        if (!farmingData[key]) {
            return { success: false, message: "Données de culture manquantes" };
        }

        if (farmingData[key].watered) {
            return { success: false, message: "Déjà arrosée aujourd'hui" };
        }

        // Vérifier l'énergie
        const energyCost = 2;
        if (window.GameState && !GameState.spendEnergy(energyCost)) {
            return { success: false, message: "Pas assez d'énergie" };
        }

        farmingData[key].watered = true;

        if (window.refreshHUD) window.refreshHUD();
        console.log(`💧 Arrosé (${col}, ${row})`);

        return { success: true, message: "Tuile arrosée !" };
    },

    // Récolter une tuile
    harvest: function (col, row) {
        const tile = this.getTile(col, row);
        if (!tile) return { success: false, message: "Tuile invalide" };

        if (tile.type !== this.CELL_TYPES.READY) {
            return { success: false, message: "Cette culture n'est pas prête" };
        }

        // Vérifier l'énergie
        const energyCost = 1;
        if (window.GameState && !GameState.spendEnergy(energyCost)) {
            return { success: false, message: "Pas assez d'énergie" };
        }

        const grid = this.getCurrentGrid();
        const farmingData = this.getCurrentFarmingData();
        const key = `${col}_${row}`;
        const harvestedType = farmingData[key] ? farmingData[key].seedType : null;

        // Reset la tuile
        grid[col][row] = this.CELL_TYPES.FIELD_ZONE;
        delete farmingData[key];

        // Ajouter au stock
        if (window.Inventory && harvestedType) {
            Inventory.addLoot(harvestedType, 2);
        }

        if (window.refreshHUD) window.refreshHUD();
        console.log(`🌾 Récolté ${harvestedType} à (${col}, ${row})`);

        return { success: true, message: `${harvestedType} récolté ! (+2 Stock)`, item: harvestedType };
    },

    // Cycle journalier (pousse des cultures) - Affecte TOUTES les zones
    processNightCycle: function () {
        let totalGrowthCount = 0;
        let totalReadyCount = 0;

        for (const zoneId in this.grids) {
            const grid = this.grids[zoneId];
            const farmingData = this.farmingData[zoneId];
            let zoneGrowth = 0;

            for (let col = 0; col < this.GRID_SIZE; col++) {
                for (let row = 0; row < this.GRID_SIZE; row++) {
                    const cellType = grid[col][row];
                    const key = `${col}_${row}`;

                    if ((cellType === this.CELL_TYPES.PLANTED || cellType === this.CELL_TYPES.GROWING) && farmingData[key]) {
                        const data = farmingData[key];
                        const wasWatered = data.watered;
                        data.watered = false;

                        if (wasWatered) {
                            if (!data.growthStage) data.growthStage = 0;
                            data.growthStage++;
                            zoneGrowth++;
                            totalGrowthCount++;

                            if (data.growthStage >= this.GROWTH_DURATION) {
                                grid[col][row] = this.CELL_TYPES.READY;
                                totalReadyCount++;
                            } else if (data.growthStage > 0) {
                                grid[col][row] = this.CELL_TYPES.GROWING;
                            }
                        }
                    }
                }
            }
        }

        console.log(`🌙 Cycle nuit global: ${totalGrowthCount} cultures ont poussé, ${totalReadyCount} prêtes.`);
    },

    // === RENDU ===

    draw: function () {
        if (!Config.showWorldGrid) return;

        const halfSize = (this.GRID_SIZE * this.TILE_SIZE) / 2;

        camera.on();

        // Dessiner chaque tuile
        for (let col = 0; col < this.GRID_SIZE; col++) {
            for (let row = 0; row < this.GRID_SIZE; row++) {
                const worldPos = this.gridToWorld(col, row);
                const x = worldPos.x - this.TILE_SIZE / 2;
                const y = worldPos.y - this.TILE_SIZE / 2;

                this.drawTile(x, y, col, row);
            }
        }

        // Grille de debug
        if (Config.debug) {
            stroke(255, 255, 255, 30);
            strokeWeight(1);
            noFill();

            for (let i = 0; i <= this.GRID_SIZE; i++) {
                let pos = i * this.TILE_SIZE - halfSize;
                line(pos, -halfSize, pos, halfSize);
                line(-halfSize, pos, halfSize, pos);
            }
        }

        camera.off();
    },

    // Dessine une tuile individuelle
    drawTile: function (x, y, col, row) {
        const grid = this.getCurrentGrid();
        const farmingData = this.getCurrentFarmingData();

        const cellType = grid[col][row];
        const key = `${col}_${row}`;
        const data = farmingData[key] || {};

        let fillColor = color(100, 100, 100); // Gris par défaut

        // Couleurs selon le type
        switch (cellType) {
            case this.CELL_TYPES.EMPTY:
                fillColor = color(80, 80, 80); // Gris foncé
                break;
            case this.CELL_TYPES.ROAD:
                fillColor = color(60, 60, 60); // Gris plus foncé
                break;
            case this.CELL_TYPES.BUILDING:
                fillColor = color(139, 69, 19); // Marron
                break;
            case this.CELL_TYPES.FIELD_ZONE:
                fillColor = color(139, 90, 43); // Marron clair (terre)
                break;
            case this.CELL_TYPES.PLANTED:
                fillColor = color(101, 67, 33); // Marron foncé
                break;
            case this.CELL_TYPES.GROWING:
                fillColor = color(101, 67, 33); // Marron foncé
                break;
            case this.CELL_TYPES.READY:
                fillColor = color(34, 139, 34); // Vert forêt
                break;
            case this.CELL_TYPES.MACHINE:
                fillColor = color(169, 169, 169); // Gris clair
                break;
            case this.CELL_TYPES.PORTAL:
                fillColor = color(0, 100, 255); // Bleu azur profond
                break;
        }

        // Effet arrosage (teinte bleue)
        if (data.watered && cellType !== this.CELL_TYPES.READY) {
            fillColor = lerpColor(fillColor, color(50, 50, 200), 0.4);
        }

        // Dessin de la case
        if (cellType === this.CELL_TYPES.PORTAL) {
            // Effet de pulsation pour être ULTRA-VISIBLE
            const pulse = (Math.sin(frameCount * 0.1) + 1) / 2;
            const r = lerp(0, 255, pulse);
            const g = lerp(200, 255, pulse);

            fill(0, 100, 255); // Fond bleu azur
            stroke(r, g, 255); // Bordure pulsante (Blanc/Bleu)
            strokeWeight(3 + pulse * 2);
            rect(x, y, this.TILE_SIZE, this.TILE_SIZE, 4);

            // Icône de portail
            noStroke();
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(12);
            text("🌀", x + this.TILE_SIZE / 2, y + this.TILE_SIZE / 2);
            return; // On arrête là pour le portail
        }

        if (cellType === this.CELL_TYPES.EMPTY && window.groundTextures && groundTextures.length > 0) {
            // Distribution organique : Terre (Texture 01) majoritaire, Herbe (02-64) par amas
            // Fonction de hash déterministe basée sur les coordonnées de la case
            const h = (col, row) => {
                let h = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453123;
                return h - Math.floor(h);
            };

            const noise = h(col, row);
            let index = 0; // Terre simple (FieldsTile_01) par défaut (~60%)

            if (noise > 0.6) {
                // Pour les variantes d'herbe (~40%), on utilise un deuxième hash pour l'index
                const variantHash = h(row + 50, col - 20); // Inversion + offset pour varier
                index = Math.floor(variantHash * (groundTextures.length - 1)) + 1;
            }
            image(groundTextures[index], Math.floor(x), Math.floor(y), this.TILE_SIZE + 1, this.TILE_SIZE + 1);
        } else {
            fill(fillColor);
            stroke(40, 40, 40);
            strokeWeight(1);
            rect(x, y, this.TILE_SIZE, this.TILE_SIZE, 2);
        }

        // Icône de culture (si farming)
        if (cellType === this.CELL_TYPES.PLANTED ||
            cellType === this.CELL_TYPES.GROWING ||
            cellType === this.CELL_TYPES.READY) {

            textAlign(CENTER, CENTER);
            noStroke();
            fill(255);

            // Taille dynamique selon croissance (pour TILE_SIZE = 32)
            let size = 12;
            if (cellType === this.CELL_TYPES.READY) {
                size = 28;
            } else {
                let stage = data.growthStage || 0;
                if (stage > this.GROWTH_DURATION) stage = this.GROWTH_DURATION;
                size = 12 + (16 * (stage / this.GROWTH_DURATION));
            }

            textSize(size);
            let icon = this.getSeedIcon(data.seedType, cellType);
            text(icon, x + this.TILE_SIZE / 2, y + this.TILE_SIZE / 2);
        }
    },

    getSeedIcon: function (seedType, cellType) {
        const seedIcons = {
            'potato': { planted: '🥔', growing: '🌿', ready: '🥔' },
            'leek': { planted: '🧅', growing: '🌱', ready: '🧅' },
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

        const stateKey = cellType === this.CELL_TYPES.PLANTED ? 'planted' :
            cellType === this.CELL_TYPES.GROWING ? 'growing' : 'ready';

        if (seedIcons[seedType]) {
            return seedIcons[seedType][stateKey];
        }

        // Icône par défaut
        switch (cellType) {
            case this.CELL_TYPES.PLANTED: return '🌱';
            case this.CELL_TYPES.GROWING: return '🌿';
            case this.CELL_TYPES.READY: return '🌾';
            default: return '';
        }
    },

    // === SAUVEGARDE ===

    export: function () {
        const exportedZones = {};

        for (const zoneId in this.grids) {
            const grid = this.grids[zoneId];
            const sparse = {};
            let hasData = false;

            for (let col = 0; col < this.GRID_SIZE; col++) {
                for (let row = 0; row < this.GRID_SIZE; row++) {
                    const cell = grid[col][row];
                    // NE SAUVEGARDER QUE les modifications du joueur
                    if (cell !== this.CELL_TYPES.EMPTY &&
                        cell !== this.CELL_TYPES.PORTAL &&
                        cell !== this.CELL_TYPES.FIELD_ZONE) {
                        sparse[`${col}_${row}`] = cell;
                        hasData = true;
                    }
                }
            }

            if (hasData) {
                exportedZones[zoneId] = sparse;
            }
        }

        return {
            zones: exportedZones,
            farming: JSON.parse(JSON.stringify(this.farmingData))
        };
    },

    import: function (data) {
        if (!data) return;

        // Support de la nouvelle structure plate { zones: { id: sparse }, farming: { ... } }
        const zones = data.zones || data.grids; // Fallback pour compatibilité
        const farming = data.farming || data.farmingData;

        if (zones) {
            for (const zoneId in zones) {
                const zoneData = zones[zoneId];

                if (!this.grids[zoneId]) this.initZone(zoneId);

                if (Array.isArray(zoneData)) {
                    this.grids[zoneId] = zoneData;
                } else {
                    const sparse = zoneData.sparse || zoneData; // Support structure simple
                    // Reset
                    for (let c = 0; c < this.GRID_SIZE; c++) {
                        for (let r = 0; r < this.GRID_SIZE; r++) {
                            this.grids[zoneId][c][r] = this.CELL_TYPES.EMPTY;
                        }
                    }
                    // Inject
                    for (const coord in sparse) {
                        const [col, row] = coord.split('_').map(Number);
                        if (!isNaN(col) && !isNaN(row)) {
                            this.grids[zoneId][col][row] = sparse[coord];
                        }
                    }
                }
            }
        }

        if (farming) this.farmingData = farming;

        // Réappliquer le "statique" (Portails, Zones de champs)
        for (const zoneId in this.grids) {
            if (this.placePortalsInZone) this.placePortalsInZone(zoneId);
            if (this.initModifiableZonesInZone) this.initModifiableZonesInZone(zoneId);
        }

        console.log("📥 Grilles restaurées (format optimisé).");
    }
};

console.log("✅ GridSystem.js chargé (Version 2.0 - Unifié - Multi-Zones)");