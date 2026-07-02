// public/games/system/core/building/placement.js
// Logique de placement Mobile-Standard (Center-Reticle)

(function () {
    const BS = window.BuildingSystem;
    if (!BS) {
        console.error("❌ CRITICAL: BuildingSystem introuvable dans placement.js ! L'ordre de chargement est-il correct ?");
        return;
    }

    // Déclencher le mode construction depuis l'UI
    BS.startPlacement = function (buildingId) {
        if (this.isDemolishing) this.toggleDemolishMode();
        this.deselectBuilding();

        const bInfo = Config.BUILDINGS[buildingId];
        if (!bInfo) return;

        this.selectedBuildingId = buildingId;
        this.isPlacing = true;
        this.isValidPlacement = false;
        this.targetGridPos = null;
        this.targetUpgradeBuilding = null;

        console.log("🛠️ Mode Construction (Center-Reticle): " + bInfo.name);

        // UI: Fermer le menu et afficher le HUD de placement
        if (window.UIManager) {
            UIManager.hideAllShelves();
            const hud = document.getElementById('placement-hud');
            if (hud) hud.style.display = 'flex';
        }

        // Créer le Ghost initialement
        this.createActiveGhost();
    };

    BS.createActiveGhost = function () {
        if (this.ghost) {
            this.ghost.remove();
        }

        const bInfo = Config.BUILDINGS[this.selectedBuildingId];
        const w = bInfo.width || 1;
        const h = bInfo.height || 1;

        this.ghost = new Sprite();
        this.ghost.width = (w * Config.TILE_SIZE) - 4;
        this.ghost.height = (h * Config.TILE_SIZE) - 4;
        this.ghost.collider = 'none';
        this.ghost.opacity = 0.6;
        this.ghost.text = bInfo.icon;
        this.ghost.textSize = Math.min(this.ghost.width, this.ghost.height) * 0.8;
        this.ghost.textColor = 'white';
        this.ghost.layer = 500;

        // Initial placement
        if (typeof camera !== 'undefined') {
            this.ghost.x = camera.x;
            this.ghost.y = camera.y;
        } else if (window.camera) {
            this.ghost.x = window.camera.x;
            this.ghost.y = window.camera.y;
        }
    };

    BS.cancelPlacement = function () {
        this.isPlacing = false;
        this.selectedBuildingId = null;
        this.isValidPlacement = false;
        this.targetGridPos = null;
        this.targetUpgradeBuilding = null;

        if (this.ghost) {
            this.ghost.remove();
            this.ghost = null;
        }

        // Désactiver l'état visuel dans le menu
        document.querySelectorAll('.build-item-container').forEach(el => el.classList.remove('active'));

        // Cacher le HUD de placement
        const hud = document.getElementById('placement-hud');
        if (hud) hud.style.display = 'none';

        // Fermer la modale si elle était ouverte (legacy)
        if (window.UIManager) UIManager.hideActionModal();
    };

    BS.confirmPlacement = function () {
        if (!this.isPlacing) return;

        if (this.targetUpgradeBuilding) {
            this.tryUpgrade(this.targetGridPos.col, this.targetGridPos.row, this.targetUpgradeBuilding);
        } else if (this.isValidPlacement && this.targetGridPos) {
            this.tryPlace(this.targetGridPos.col, this.targetGridPos.row);
        } else {
            console.log("❌ Placement invalide");
            // Optionnel: Animation shake ou son erreur
        }
    };

    // Appelé chaque frame par sketch.js -> draw() -> BuildingSystem.update()
    BS.update = function () {
        // Sécurité pour l'accès à camera
        const cam = (typeof camera !== 'undefined') ? camera : (window.camera || null);

        if (!this.isPlacing || !this.ghost || !cam || !window.GridSystem) return;

        // 1. Calculer la position centrale de la caméra
        const centerX = cam.x;
        const centerY = cam.y;

        // 2. Convertir en grille
        const gridPos = GridSystem.worldToGrid(centerX, centerY);
        this.targetGridPos = gridPos;

        // 3. Positionner le Ghost (Snap to Grid)
        const bInfo = Config.BUILDINGS[this.selectedBuildingId];
        const w = bInfo.width || 1;
        const h = bInfo.height || 1;
        const worldPos = GridSystem.gridToWorld(gridPos.col, gridPos.row, w, h);

        this.ghost.x = worldPos.x;
        this.ghost.y = worldPos.y;

        // 4. Valider le placement
        this.validatePlacementAt(gridPos.col, gridPos.row, w, h, bInfo);
    };

    BS.validatePlacementAt = function (col, row, w, h, bInfo) {
        let isValid = true;
        let color = '#2ecc71'; // Vert par défaut
        this.targetUpgradeBuilding = null; // Reset upgrade target

        // A. Hors Limites
        if (col < 0 || row < 0 || col + w > Config.GRID_SIZE || row + h > Config.GRID_SIZE) {
            isValid = false;
            color = '#e74c3c'; // Rouge
        }

        // B. Occupation / Upgrade
        if (isValid) {
            // Check Upgrade First
            const upgradeTarget = this.checkUpgradePossible(col, row, this.selectedBuildingId);
            if (upgradeTarget) {
                this.targetUpgradeBuilding = upgradeTarget;
                color = '#3498db'; // Bleu Upgrade
                this.ghost.color = color;
                this.isValidPlacement = true;
                this.updateConfirmButton(true);
                return; // Mode Upgrade détecté -> Exit
            }

            // Check Occupation Normale
            let isOccupied = GridSystem.isOccupied(col, row, w, h);

            // Exception checkZoneType si requiresZone (ex: Drill sur Natural)
            if (bInfo.requiresZone) {
                // Si la case est occupée par un autre bâtiment (pas la zone), isOccupied sera true.
                // GridSystem.isOccupied ignore 'natural'/'manual' cells.

                // Vérifier si la zone requise est présente
                if (!GridSystem.checkZoneType(col, row, w, h, bInfo.requiresZone)) {
                    isValid = false; // Zone incorrecte
                    // Pas besoin de changer la couleur si occupied prend le dessus, mais ici c'est zone error.
                }
            }

            if (isOccupied) {
                isValid = false;
                color = '#ce000080'; // Rouge Transparent
            }
        }

        // C. Connexion Réseau
        if (isValid) {
            const isConnected = (this.selectedBuildingId === 'generator') || this.checkNetworkConnection(col, row, w, h);
            if (!isConnected) {
                isValid = false;
                color = '#f39c12'; // Orange (Non connecté)
            }
        }

        // D. Ressources
        if (isValid && window.GameState && !GameState.hasResources(bInfo.cost)) {
            isValid = false;
            color = '#95a5a6'; // Gris (Pas de ressources)
        }

        this.ghost.color = color;
        this.isValidPlacement = isValid;
        this.updateConfirmButton(isValid);
    };

    BS.updateConfirmButton = function (isValid) {
        const btn = document.getElementById('btn-place-confirm');
        if (btn) {
            btn.style.opacity = isValid ? '1' : '0.5';
            btn.style.cursor = isValid ? 'pointer' : 'not-allowed';
            // btn.disabled = !isValid; // Pas de disable pour laisser le clic feedback
        }
    }

    // Appelé par InputManager lors d'un clic
    BS.handleWorldClick = function (worldX, worldY) {
        // En mode placement Mobile-Standard, on ignore les clics map.
        // C'est le bouton HUD qui valide.
        if (this.isPlacing) return;

        if (this.isDemolishing) {
            this.handleDemolishClick(worldX, worldY);
        } else {
            this.handleSelectClick(worldX, worldY);
        }
    };

    // --- LOGIQUE METIER (Gardée) ---

    BS.checkUpgradePossible = function (col, row, targetBuildingId) {
        const worldPos = GridSystem.gridToWorld(col, row, 1, 1);
        const existingBuilding = this.findBuildingAt(worldPos.x, worldPos.y);

        if (!existingBuilding) return null;

        const existingInfo = Config.BUILDINGS[existingBuilding.buildingId];
        if (!existingInfo || !existingInfo.upgrade) return null;

        if (existingInfo.upgrade === targetBuildingId) {
            return existingBuilding;
        }
        return null;
    };

    BS.checkNetworkConnection = function (col, row, w, h) {
        for (let i = -1; i <= w; i++) {
            for (let j = -1; j <= h; j++) {
                if (i >= 0 && i < w && j >= 0 && j < h) continue;
                if ((i < 0 || i >= w) && (j < 0 || j >= h)) continue;

                const c = col + i;
                const r = row + j;
                if (c < 0 || c >= Config.GRID_SIZE || r < 0 || r >= Config.GRID_SIZE) continue;

                const cell = GridSystem.grid[c][r];
                if (cell === 'generator') return true;
                if (cell === 'road') {
                    if (GridSystem.checkNetworkConnection(c, r)) return true;
                }
            }
        }
        return false;
    };

    BS.tryPlace = function (col, row) {
        const bInfo = Config.BUILDINGS[this.selectedBuildingId];

        if (window.GameState && !GameState.hasResources(bInfo.cost)) {
            // Feedback visuel ou son
            return;
        }

        if (this.selectedBuildingId === 'hothouse' || this.selectedBuildingId === 'industrial_hothouse') {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    GridSystem.grid[col + i][row + j] = GridSystem.CELL_TYPES.MANUAL_ZONE; // 'manual'
                }
            }
        }

        if (GridSystem.place(col, row, this.selectedBuildingId, bInfo.width, bInfo.height)) {
            if (window.GameState) GameState.consumeResources(bInfo.cost);
            this.spawnBuilding(col, row, this.selectedBuildingId);

            // Si c'est un bâtiment unique (type Generator), on quitte.
            // Sinon on reste en mode placement pour enchaîner (ex: routes).
            if (bInfo.isUnique) {
                this.cancelPlacement();
            } else {
                // Feedback placement réussi (petit pop ou son)
                console.log("✅ Bâtiment placé");
            }
        }
    };

    BS.tryUpgrade = function (col, row, existingBuilding) {
        const newBuildingId = this.selectedBuildingId;
        const newInfo = Config.BUILDINGS[newBuildingId];
        const oldInfo = Config.BUILDINGS[existingBuilding.buildingId];

        if (window.GameState && !GameState.hasResources(newInfo.cost)) return;

        console.log(`⬆️ Upgrade: ${oldInfo.name} → ${newInfo.name}`);

        const savedData = {
            gridPos: existingBuilding.gridPos,
            staffCount: existingBuilding.staffCount || 0,
            assignedCitizens: existingBuilding.assignedCitizens || [],
            is_map: existingBuilding.is_map
        };

        const upgradeCol = savedData.gridPos.col;
        const upgradeRow = savedData.gridPos.row;

        GridSystem.clearArea(upgradeCol, upgradeRow, oldInfo.width || 1, oldInfo.height || 1);
        existingBuilding.remove();

        if (window.GameState) GameState.consumeResources(newInfo.cost);

        if (GridSystem.place(upgradeCol, upgradeRow, newBuildingId, newInfo.width, newInfo.height)) {
            const newBuilding = this.spawnBuilding(upgradeCol, upgradeRow, newBuildingId);

            if (newBuilding) {
                newBuilding.staffCount = savedData.staffCount;
                newBuilding.assignedCitizens = savedData.assignedCitizens;
                if (savedData.is_map) newBuilding.is_map = true;

                if (window.PersonSystem && savedData.assignedCitizens.length > 0) {
                    savedData.assignedCitizens.forEach(citizenId => {
                        const person = PersonSystem.getPerson(citizenId);
                        if (person) person.workplaceId = newBuilding.id;
                    });
                }
            }
        }

        // Si plus d'upgrade possible, on quitte le mode upgrade qui était contextuel
        if (!newInfo.upgrade) {
            this.cancelPlacement(); // Ou simple reset
        }
    };

    BS.spawnBuilding = function (col, row, buildingId, options = {}) {
        const bInfo = Config.BUILDINGS[buildingId];
        const w = bInfo.width || 1;
        const h = bInfo.height || 1;
        const worldPos = GridSystem.gridToWorld(col, row, w, h);

        const b = new this.group.Sprite();
        b.x = worldPos.x;
        b.y = worldPos.y;
        b.width = (w * Config.TILE_SIZE) - 4;
        b.height = (h * Config.TILE_SIZE) - 4;
        b.text = bInfo.icon;
        b.textSize = Math.min(b.width, b.height) * 0.8;
        b.color = buildingId === 'generator' ? '#ff4444' : '#446688';
        b.textColor = 'white';
        b.buildingId = buildingId;
        b.id = `b_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        b.gridPos = { col, row };

        if (options.is_map) {
            b.is_map = true;
        }

        return b;
    };
})();
