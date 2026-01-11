window.BuildingSystem = {
    buildings: null, // Group P5play
    ghostBuilding: null, // Sprite pour la prévisualisation
    isPlacing: false,
    selectedBuildingId: null,
    pendingDemolishTarget: null, // Bâtiment en attente de confirmation

    init: function () {
        this.buildings = new Group();
        this.buildings.collider = 'static';

        // Placer le Générateur au centre par défaut pour v1
        const cx = Math.floor(Config.GRID_SIZE / 2);
        const cy = Math.floor(Config.GRID_SIZE / 2);

        this.placeBuilding(cx, cy, 'generator', true);

        // Ajouter une route autour du générateur
        const gInfo = Config.BUILDINGS['generator'];
        // Zone autour : de -1 à width
        for (let i = -1; i <= gInfo.width; i++) {
            for (let j = -1; j <= gInfo.height; j++) {
                // Si on est DANS le générateur (0,0 à w-1,h-1), on skip
                if (i >= 0 && i < gInfo.width && j >= 0 && j < gInfo.height) continue;

                // Sinon on place une route
                this.placeBuilding(cx + i, cy + j, 'road', true);
            }
        }
    },

    toggleDemolishMode: function () {
        this.cancelPlacement();
        this.deselectBuilding();

        // Nettoyage si on quitte le mode
        if (this.isDemolishing) {
            // Si on quitte le mode, on cache le modal s'il est ouvert pour démolition
            if (window.UIManager) UIManager.hideActionModal();
        }

        this.isDemolishing = !this.isDemolishing;

        const btn = document.getElementById('btn-demolish');
        if (btn) btn.classList.toggle('active', this.isDemolishing);

        if (this.isDemolishing) {
            console.log("Mode démolition activé.");
        }
    },

    startPlacement: function (buildingId) {
        if (this.isDemolishing) this.toggleDemolishMode();

        // Empêcher d'avoir un bâtiment sélectionné (panneau détail) en même temps
        this.deselectBuilding();

        const bInfo = Config.BUILDINGS[buildingId];
        if (!bInfo) return;

        this.selectedBuildingId = buildingId;
        this.isPlacing = true;

        // Note: On ne crée PAS de ghost ici (pas de suivi souris).
        // Le ghost sera créé au premier clic sur la grille.
        if (this.ghostBuilding) {
            this.ghostBuilding.remove();
            this.ghostBuilding = null;
        }

        console.log("Mode construction activé : " + buildingId + ". Cliquez sur la grille.");
    },

    cancelPlacement: function () {
        this.isPlacing = false;
        this.selectedBuildingId = null;
        if (this.ghostBuilding) {
            this.ghostBuilding.remove();
            this.ghostBuilding = null;
        }
        if (window.UIManager) {
            UIManager.updateBuildingSelection(null);
            UIManager.hideActionModal();
        }
    },

    handleWorldClick: function (worldX, worldY) {
        if (this.isPlacing) {
            const gridPos = GridSystem.worldToGrid(worldX, worldY);

            // Si le clic est hors grille, on ignore ou annule ?
            // On continue pour laisser le joueur explorer.

            this.updateGhostAt(gridPos.col, gridPos.row);
        } else if (this.isDemolishing) {
            // Mode Démolition : Clic sur un bâtiment existant
            this.handleDemolishClick(worldX, worldY);
        } else {
            // Mode Normal : Sélection
            this.handleSelectClick(worldX, worldY);
        }
    },

    // Nouvelle fonction pour gérer l'affichage du Ghost et le Modal
    updateGhostAt: function (col, row) {
        if (!this.selectedBuildingId) return;

        const bInfo = Config.BUILDINGS[this.selectedBuildingId];
        const w = bInfo.width || 1;
        const h = bInfo.height || 1;

        // Créer le Ghost s'il n'existe pas encore
        if (!this.ghostBuilding) {
            this.ghostBuilding = new Sprite();
            this.ghostBuilding.width = (w * Config.TILE_SIZE) - 4;
            this.ghostBuilding.height = (h * Config.TILE_SIZE) - 4;
            this.ghostBuilding.collider = 'none';
            this.ghostBuilding.opacity = 0.6;
            this.ghostBuilding.text = bInfo.icon;
            const minDim = Math.min(this.ghostBuilding.width, this.ghostBuilding.height);
            this.ghostBuilding.textSize = minDim * 0.8;
            this.ghostBuilding.textColor = 'white';
        }

        // Positionner le Ghost
        const worldPos = GridSystem.gridToWorld(col, row, w, h);
        this.ghostBuilding.x = worldPos.x;
        this.ghostBuilding.y = worldPos.y;
        this.ghostBuilding.gridPos = { col, row };

        // DÉTERMINER L'ÉTAT (Gris, Rouge, Vert)

        // 1. Check Espace (Occupé ?)
        const isOccupied = GridSystem.isOccupied(col, row, w, h);

        if (isOccupied) {
            // ÉTAT 1 : GRIS (Occupé)
            this.ghostBuilding.color = '#7f8c8d'; // Gris
            this.ghostBuilding.tint = '#7f8c8d';

            // Fermer le modal car invalide placement
            UIManager.hideActionModal();
            return;
        }

        // 2. Check Connexion
        let isConnected = true;
        if (this.selectedBuildingId !== 'generator') {
            isConnected = this.checkRoadConnection(col, row, w, h);
        }

        if (!isConnected) {
            // ÉTAT 2 : ROUGE (Place OK, pas de route)
            this.ghostBuilding.color = '#e74c3c'; // Rouge

            // Ouvrir modal en mode erreur
            UIManager.showActionModal('BUILD', {
                name: bInfo.name,
                icon: bInfo.icon,
                cost: bInfo.cost,
                isValid: false,
                error: "Doit toucher une route ou le générateur."
            }, null, () => this.cancelPlacement());

        } else {
            // ÉTAT 3 : VERT (Tout OK)
            this.ghostBuilding.color = '#2ecc71'; // Vert (proche de #a5f3fc mais plus distinct pour validation)

            // Ouvrir modal en mode validation
            UIManager.showActionModal('BUILD', {
                name: bInfo.name,
                icon: bInfo.icon,
                cost: bInfo.cost,
                isValid: true
            },
                // Callback Confirm
                () => {
                    this.tryPlace(col, row);
                },
                // Callback Cancel
                () => {
                    this.cancelPlacement();
                });
        }
    },

    handleDemolishClick: function (worldX, worldY) {
        // Trouver le bâtiment sous la souris
        const clicked = this.findBuildingAt(worldX, worldY);

        if (clicked) {
            if (clicked.buildingId === 'generator') {
                alert("Impossible de démolir le Générateur.");
                return;
            }

            const bInfo = Config.BUILDINGS[clicked.buildingId];

            // Calcul rembousement 50%
            const refund = {};
            for (let r in bInfo.cost) {
                refund[r] = Math.floor(bInfo.cost[r] * 0.5);
            }

            UIManager.showActionModal('DEMOLISH', {
                name: bInfo.name,
                icon: bInfo.icon,
                refund: refund
            },
                // Confirm
                () => {
                    this.dismantleSpecific(clicked);
                    UIManager.hideActionModal();
                },
                // Cancel
                () => {
                    UIManager.hideActionModal();
                });
        }
    },

    handleSelectClick: function (worldX, worldY) {
        const clicked = this.findBuildingAt(worldX, worldY);
        if (clicked) {
            this.selectBuilding(clicked);
        } else {
            this.deselectBuilding();
        }
    },

    findBuildingAt: function (x, y) {
        for (let b of this.buildings) {
            // Hit test simple AABB
            if (x >= b.x - b.width / 2 && x <= b.x + b.width / 2 &&
                y >= b.y - b.height / 2 && y <= b.y + b.height / 2) {
                return b;
            }
        }
        return null;
    },

    update: function () {
        // PLUS DE SUIVI SOURIS POUR LE GHOST
        // La méthode update ne sert plus qu'à gérer les inputs clavier globaux si nécessaire
        // ou animations oisives.

        if (kb.pressed('escape')) {
            if (this.isPlacing) this.cancelPlacement();
            else if (this.isDemolishing) this.toggleDemolishMode();
            else this.deselectBuilding();
        }
    },

    selectBuilding: function (building) {
        this.selectedBuilding = building;
        UIManager.showDetailPanel(building);
    },

    deselectBuilding: function () {
        this.selectedBuilding = null;
        UIManager.hideDetailPanel();
    },

    modifyStaff: function (delta) {
        if (!this.selectedBuilding) return;
        const bInfo = Config.BUILDINGS[this.selectedBuilding.buildingId];
        if (!bInfo || !bInfo.staff) return;

        const max = bInfo.staff.workers || bInfo.staff.engineers || 0;
        let current = this.selectedBuilding.staffCount || 0;

        if (delta > 0 && current < max) current++;
        else if (delta < 0 && current > 0) current--;

        this.selectedBuilding.staffCount = current;
        UIManager.updateDetailPanel(this.selectedBuilding);
    },

    dismantleCurrent: function () {
        // Appelé depuis le panneau de détail (méthode legacy ou bouton "Démanteler" du détail)
        // On redirige vers le modal de démolition
        if (!this.selectedBuilding) return;

        // Simuler un clic de démolition sur le bâtiment sélectionné
        const bInfo = Config.BUILDINGS[this.selectedBuilding.buildingId];
        const refund = {};
        for (let r in bInfo.cost) {
            refund[r] = Math.floor(bInfo.cost[r] * 0.5);
        }

        UIManager.showActionModal('DEMOLISH', {
            name: bInfo.name,
            icon: bInfo.icon,
            refund: refund
        },
            () => {
                this.dismantleSpecific(this.selectedBuilding);
            });
    },

    dismantleSpecific: function (building) {
        if (building.buildingId === 'generator') return;

        const bInfo = Config.BUILDINGS[building.buildingId];
        const w = bInfo.width || 1;
        const h = bInfo.height || 1;

        // Remboursement 50%
        for (let res in bInfo.cost) {
            ResourceManager.add(res, Math.floor(bInfo.cost[res] * 0.5));
        }

        // Libérer la grille
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                // Seulement si c'est bien ce bâtiment (double check)
                if (GridSystem.grid[building.gridPos.col + i]) {
                    GridSystem.grid[building.gridPos.col + i][building.gridPos.row + j] = null;
                }
            }
        }

        building.remove();

        if (this.selectedBuilding === building) {
            this.deselectBuilding();
        }
    },

    canPlaceAt: function (col, row, buildingId) {
        // Cette fonction est devenue utilitaire pour tryPlace, 
        // la logique visuelle est dans updateGhostAt
        const bInfo = Config.BUILDINGS[buildingId];
        const w = bInfo.width || 1;
        const h = bInfo.height || 1;

        if (GridSystem.isOccupied(col, row, w, h)) {
            return { valid: false, reason: "Occupé" };
        }

        if (buildingId !== 'generator') {
            const hasConnection = this.checkRoadConnection(col, row, w, h);
            if (!hasConnection) {
                return { valid: false, reason: "Pas de route" };
            }
        }

        return { valid: true };
    },

    checkRoadConnection: function (col, row, w, h) {
        for (let i = -1; i <= w; i++) {
            for (let j = -1; j <= h; j++) {
                if (i >= 0 && i < w && j >= 0 && j < h) continue;
                if ((i < 0 || i >= w) && (j < 0 || j >= h)) continue;

                const c = col + i;
                const r = row + j;

                if (c < 0 || c >= Config.GRID_SIZE || r < 0 || r >= Config.GRID_SIZE) continue;

                const cell = GridSystem.grid[c][r];
                // Connexion valide si touche Route ou Générateur
                if (cell === 'road' || cell === 'generator') return true;

                // TODO: Ajouter connexion via Hubs plus tard
            }
        }
        return false;
    },

    isAdjacentTo: function (col, row, targetId) {
        const neighbors = this.getNeighbors(col, row);
        return neighbors.some(n => GridSystem.grid[n.c][n.r] === targetId);
    },

    getNeighbors: function (col, row) {
        let n = [];
        if (col > 0) n.push({ c: col - 1, r: row });
        if (col < Config.GRID_SIZE - 1) n.push({ c: col + 1, r: row });
        if (row > 0) n.push({ c: col, r: row - 1 });
        if (row < Config.GRID_SIZE - 1) n.push({ c: col, r: row + 1 });
        return n;
    },

    tryPlace: function (col, row) {
        const bInfo = Config.BUILDINGS[this.selectedBuildingId];
        const w = bInfo.width || 1;
        const h = bInfo.height || 1;

        // Double check ressources
        let canAfford = true;
        for (let res in bInfo.cost) {
            if (!ResourceManager.check(res, bInfo.cost[res])) {
                canAfford = false;
                break;
            }
        }

        if (!canAfford) {
            alert("Ressources insuffisantes !"); // Fallback
            return;
        }

        if (GridSystem.place(col, row, this.selectedBuildingId, w, h)) {
            for (let res in bInfo.cost) {
                ResourceManager.consume(res, bInfo.cost[res]);
            }
            this.placeBuilding(col, row, this.selectedBuildingId);

            // Après placement, on quitte le mode construction ou on reste ?
            // User requested: "4 Je valide la construction puis elle et marquer pour la construction ."
            // "5 J'annule la construction ce qui va l'enlever de la grid... et fermer le paneau"

            // Standard : On reste en mode construction pour en placer d'autres ou on quitte ?
            // Frostpunk : Souvent on continue. Mais ici le user dit "5 J'annule...".
            // Si "4 Je valide", le ghost doit probablement disparaitre et être remplacé par le batiment.
            // Et on peut recommencer.

            // Pour l'instant, on nettoie le ghost (car le batiment est là).
            // Mais on garde isPlacing = true ?
            // Le comportement "Je valide la construction puis elle est marquée" -> On a posé.
            // Si on veut poser un autre, il faudrait re-cliquer.
            // Donc startPlacement reste actif, mais ghostBuilding est reset.

            if (this.ghostBuilding) {
                this.ghostBuilding.remove();
                this.ghostBuilding = null;
            }

            UIManager.hideActionModal();
            console.log("Bâtiment construit.");

            // Si c'est un bâtiment unique, on arrête peut-être
            if (bInfo.isUnique) {
                this.cancelPlacement();
            }
        }
    },

    placeBuilding: function (col, row, buildingId, isInitial = false) {
        const bInfo = Config.BUILDINGS[buildingId];
        const w = bInfo.width || 1;
        const h = bInfo.height || 1;

        const worldPos = GridSystem.gridToWorld(col, row, w, h);

        const b = new this.buildings.Sprite();
        b.x = worldPos.x;
        b.y = worldPos.y;
        b.width = (w * Config.TILE_SIZE) - 4;
        b.height = (h * Config.TILE_SIZE) - 4;
        b.text = bInfo.icon;

        const minDim = Math.min(b.width, b.height);
        b.textSize = minDim * 0.8;

        b.color = buildingId === 'generator' ? '#ff4444' : '#446688';
        b.textColor = 'white';
        b.buildingId = buildingId;
        b.gridPos = { col, row };

        if (isInitial) {
            GridSystem.place(col, row, buildingId, w, h);
        }

        return b;
    }
};


