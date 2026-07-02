// public/games/system/core/building/management.js
// Gestion, Sélection et Démolition

(function () {
    const BS = window.BuildingSystem;

    BS.toggleDemolishMode = function () {
        this.cancelPlacement();
        this.deselectBuilding();
        this.isDemolishing = !this.isDemolishing;

        const container = document.getElementById('build-item-demolish');
        if (container) container.classList.toggle('active', this.isDemolishing);

        console.log("🛠️ Mode Démolition : " + (this.isDemolishing ? "ON" : "OFF"));
    };

    // Initialisation au chargement
    window.addEventListener('load', () => {
        if (window.PersonSystem) window.PersonSystem.init();
    });

    BS.handleSelectClick = function (worldX, worldY) {
        const clicked = this.findBuildingAt(worldX, worldY);
        if (clicked) {
            this.selectBuilding(clicked);
        } else {
            this.deselectBuilding();
        }
    };

    BS.handleDemolishClick = function (worldX, worldY) {
        const clicked = this.findBuildingAt(worldX, worldY);
        if (clicked) {
            if (clicked.buildingId === 'generator') {
                console.warn("Impossible de démolir le Générateur.");
                return;
            }

            if (clicked.is_map) {
                console.warn("Impossible de démolir un élément de la carte.");
                return;
            }

            const bInfo = Config.BUILDINGS[clicked.buildingId];
            const refund = {};
            for (let r in bInfo.cost) {
                refund[r] = Math.floor(bInfo.cost[r] * 0.5);
            }

            if (window.UIManager) {
                UIManager.showActionModal('DEMOLISH', {
                    name: bInfo.name, icon: bInfo.icon, refund: refund
                }, () => this.dismantle(clicked));
            } else {
                this.dismantle(clicked);
            }
        }
    };

    BS.findBuildingAt = function (x, y) {
        for (let b of this.group) {
            if (x >= b.x - b.width / 2 && x <= b.x + b.width / 2 &&
                y >= b.y - b.height / 2 && y <= b.y + b.height / 2) {
                return b;
            }
        }
        return null;
    };

    BS.selectBuilding = function (building) {
        this.selectedBuilding = building;
        if (window.UIManager) UIManager.showDetailPanel(building);
    };

    BS.deselectBuilding = function () {
        this.selectedBuilding = null;
        if (window.UIManager) UIManager.hideDetailPanel();
    };

    BS.modifyStaff = function (delta) {
        if (!this.selectedBuilding) return;
        const bInfo = Config.BUILDINGS[this.selectedBuilding.buildingId];
        if (!bInfo) return;

        const max = bInfo.staff ? (bInfo.staff.workers || bInfo.staff.engineers || 0) : (bInfo.staff_max || 0);

        let current = this.selectedBuilding.staffCount || 0;
        if (delta > 0 && current < max) current++;
        else if (delta < 0 && current > 0) current--;

        this.selectedBuilding.staffCount = current;
        if (window.UIManager) UIManager.updateDetailPanel(this.selectedBuilding);
    };

    BS.staffIncrease = function () { this.modifyStaff(1); };
    BS.staffDecrease = function () { this.modifyStaff(-1); };

    BS.dismantleCurrent = function () {
        if (!this.selectedBuilding) return;
        if (this.selectedBuilding.buildingId === 'generator') return;
        if (this.selectedBuilding.is_map) return;
        this.dismantle(this.selectedBuilding);
    };

    BS.dismantle = function (building) {
        if (building.is_map) {
            console.warn("Tentative de démolition d'un élément de carte bloquée.");
            return;
        }

        const bInfo = Config.BUILDINGS[building.buildingId];

        // Remboursement
        if (window.GameState) {
            const refund = {};
            for (let res in bInfo.cost) refund[res] = Math.floor(bInfo.cost[res] * 0.5);
            GameState.addResources(refund);
        }

        // Libération Grille
        GridSystem.clearArea(building.gridPos.col, building.gridPos.row, bInfo.width || 1, bInfo.height || 1);

        building.remove();
        if (this.selectedBuilding === building) this.deselectBuilding();
        if (window.UIManager) UIManager.hideActionModal();
    };

    // Retourne la coordonnée (col, row) de la route la plus proche d'un bâtiment
    BS.getEntrance = function (building) {
        const bInfo = Config.BUILDINGS[building.buildingId];
        const w = bInfo.width || 1;
        const h = bInfo.height || 1;
        const col = building.gridPos.col;
        const row = building.gridPos.row;

        // On cherche une cellule 'road' adjacente
        for (let i = -1; i <= w; i++) {
            for (let j = -1; j <= h; j++) {
                if (i >= 0 && i < w && j >= 0 && j < h) continue; // Intérieur
                if ((i < 0 || i >= w) && (j < 0 || j >= h)) continue; // Coins (diagonales)

                const c = col + i;
                const r = row + j;
                if (c < 0 || c >= GridSystem.GRID_SIZE || r < 0 || r >= GridSystem.GRID_SIZE) continue;

                if (GridSystem.grid[c][r] === 'road') {
                    return { col: c, row: r };
                }
            }
        }
        // Fallback si pas de route (sécurité)
        return { col: col, row: row };
    };
})();
