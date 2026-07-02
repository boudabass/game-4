/*
    InteriorRenderer.js
    Gère l'affichage de l'intérieur (Overlay, Grille, Redimensionnement).
*/

window.InteriorRenderer = {
    overlay: null,
    gridContainer: null,
    currentBuilding: null,

    // Personnage (worker) dans l'intérieur
    workerElement: null,
    workerPosition: { x: 0, y: 0 }, // Position en cellules
    workerTargetPosition: null,
    workerMoving: false,
    gridInfo: { width: 0, tileSize: 0 }, // Info grille pour calculs
    currentWorkerData: null, // Données du citoyen assigné (id, name, color)

    init: function () {
        this.createOverlay();
        window.addEventListener('resize', () => this.handleResize());
    },

    createOverlay: function () {
        if (document.getElementById('interior-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'interior-overlay';
        overlay.className = 'interior-overlay hidden';

        // Nouvelle structure avec Sidebar
        // On récupère le HTML de la sidebar depuis InteriorUI
        const sidebarHTML = window.InteriorUI ? window.InteriorUI.getSidebarHTML() : '<div class="error">InteriorUI missing</div>';

        overlay.innerHTML = `
            <div class="interior-container">
                ${sidebarHTML}
                
                <div class="interior-main-view">
                    <div class="interior-header-bar">
                        <h2 id="interior-title">INTÉRIEUR</h2>
                        <div id="interior-worker-info" class="interior-worker-info"></div>
                        <div class="int-header-actions">
                            <button id="int-build-toggle" class="hud-btn-icon" onclick="InteriorUI.toggleBuildMode()">🔨 OFF</button>
                            <button class="close-btn-int" onclick="window.InteriorSystem.exit()">SORTIR</button>
                        </div>
                    </div>
                    <div class="interior-grid-container">
                        <div id="interior-grid" class="interior-grid"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.overlay = overlay;
        this.gridContainer = document.getElementById('interior-grid');
    },

    show: function (building, config) {
        if (!this.overlay) this.createOverlay();

        this.currentBuilding = building;
        document.getElementById('interior-title').textContent = `INTÉRIEUR - ${building.buildingId.toUpperCase()}`;
        this.overlay.classList.remove('hidden');

        // Récupérer le premier citoyen assigné au bâtiment
        this.currentWorkerData = null;
        if (window.PersonSystem && window.PersonSystem.getPeopleInBuilding) {
            const assignedPeople = window.PersonSystem.getPeopleInBuilding(building);
            if (assignedPeople && assignedPeople.length > 0) {
                this.currentWorkerData = assignedPeople[0]; // Premier citoyen assigné
            }
        }

        // Mettre à jour l'affichage du citoyen dans le header
        this.updateWorkerInfo();

        // Initialiser l'UI (Catégories)
        if (window.InteriorUI) {
            window.InteriorUI.setCategory('machines'); // Default
        }

        this.renderGrid(building, config);
    },

    updateWorkerInfo: function () {
        const infoEl = document.getElementById('interior-worker-info');
        if (!infoEl) return;

        if (this.currentWorkerData) {
            const name = this.currentWorkerData.name || 'Inconnu';
            const color = this.currentWorkerData.color || '#888';
            infoEl.innerHTML = `
                <div class="worker-badge">
                    <span class="worker-color" style="background-color: ${color}"></span>
                    <span class="worker-name">${name}</span>
                </div>
            `;
        } else {
            infoEl.innerHTML = `<span class="no-worker">Aucun travailleur assigné</span>`;
        }
    },

    hide: function () {
        if (this.overlay) {
            this.overlay.classList.add('hidden');
        }
        this.currentBuilding = null;
    },

    renderGrid: function (building, config) {
        if (!this.gridContainer) return;
        this.gridContainer.innerHTML = '';

        // 1. Dimensions
        let w = 5;
        let h = 5;

        const bInfo = window.Config?.BUILDINGS?.[building.buildingId];
        if (bInfo) {
            w = bInfo.width;
            h = bInfo.height;
        }

        const intW = w * 3;
        const intH = h * 3;

        // 2. Scale calcul
        const availW = window.innerWidth - 350;
        const availH = window.innerHeight - 100;

        let tileSize = Math.floor(Math.min(availW / intW, availH / intH));
        if (tileSize > 64) tileSize = 64;
        if (tileSize < 20) tileSize = 20;

        // Stocker les infos de grille pour le personnage
        this.gridInfo = { width: intW, height: intH, tileSize: tileSize };

        // Appliquer style grille
        this.gridContainer.style.display = 'grid';
        this.gridContainer.style.gridTemplateColumns = `repeat(${intW}, ${tileSize}px)`;
        this.gridContainer.style.gridTemplateRows = `repeat(${intH}, ${tileSize}px)`;
        this.gridContainer.style.width = `${intW * tileSize}px`;
        this.gridContainer.style.height = `${intH * tileSize}px`;
        this.gridContainer.style.position = 'relative'; // Important pour le personnage positionné absolument

        // 3. Génération Cellules
        const totalCells = intW * intH;
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'interior-cell';
            cell.dataset.index = i;

            // Event Listeners pour placement ET déplacement perso
            cell.onmouseenter = () => this.handleCellHover(i, intW);
            cell.onmouseleave = () => this.handleCellLeave(i);
            cell.onclick = (e) => this.handleCellClick(i, intW, e);

            this.gridContainer.appendChild(cell);
        }

        // 4. Créer le personnage au centre de la grille
        this.createWorker(intW, intH, tileSize);
    },

    // --- Interaction ---

    handleCellHover: function (index, width) {
        if (!window.InteriorUI || !window.InteriorUI.selectedItem) return;

        // Logique de preview simple (1x1 pour l'instant)
        // TODO: Gérer taille items
        const cell = this.gridContainer.children[index];
        if (cell) {
            cell.classList.add('valid'); // ou invalid selon logique
        }
    },

    handleCellLeave: function (index) {
        const cell = this.gridContainer.children[index];
        if (cell) {
            cell.classList.remove('valid', 'invalid');
        }
    },

    handleCellClick: function (index, width, event) {
        // Si le mode construction est actif ET un item est sélectionné, placer l'item
        if (window.InteriorUI && window.InteriorUI.buildMode && window.InteriorUI.selectedItem) {
            const item = window.InteriorUI.selectedItem;
            console.log(`Tentative placement ${item.name} en ${index}`);

            // TODO: Validation coût et logique métier
            // Pour l'instant visuel
            const cell = this.gridContainer.children[index];
            if (cell) {
                cell.classList.add('occupied');
                cell.innerHTML = item.icon || '📦';
                cell.style.display = 'flex';
                cell.style.alignItems = 'center';
                cell.style.justifyContent = 'center';
                cell.style.fontSize = '20px';
            }
        } else {
            // Sinon, déplacer le personnage vers cette cellule
            this.moveWorkerTo(index);
        }
    },

    // --- Personnage (Worker) ---

    createWorker: function (gridW, gridH, tileSize) {
        // Supprimer l'ancien personnage s'il existe
        if (this.workerElement) {
            this.workerElement.remove();
            this.workerElement = null;
        }

        // Pas de personnage si personne n'est assigné
        if (!this.currentWorkerData) {
            console.log('🏠 Aucun citoyen assigné - pas de personnage affiché');
            return;
        }

        const workerColor = this.currentWorkerData.color || '#888';
        const workerName = this.currentWorkerData.name || 'Travailleur';

        // Créer l'élément du personnage (carré coloré)
        const worker = document.createElement('div');
        worker.className = 'interior-worker';

        // Taille du carré (80% de la tuile)
        const workerSize = Math.floor(tileSize * 0.8);

        // Style du personnage - carré coloré avec le nom
        worker.style.cssText = `
            position: absolute;
            width: ${workerSize}px;
            height: ${workerSize}px;
            background-color: ${workerColor};
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            pointer-events: none;
            transition: left 0.4s ease-out, top 0.4s ease-out;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
            border: 2px solid rgba(255,255,255,0.4);
        `;

        // Initiale du nom dans le carré
        const initial = workerName.charAt(0).toUpperCase();
        worker.innerHTML = `<span style="
            color: #fff;
            font-weight: bold;
            font-size: ${Math.floor(workerSize * 0.6)}px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            font-family: 'Oswald', sans-serif;
        ">${initial}</span>`;

        // Positionner au centre de la grille
        const centerX = Math.floor(gridW / 2);
        const centerY = Math.floor(gridH / 2);
        this.workerPosition = { x: centerX, y: centerY };

        // Offset pour centrer le carré dans la cellule
        const offset = Math.floor((tileSize - workerSize) / 2);
        worker.style.left = `${centerX * tileSize + offset}px`;
        worker.style.top = `${centerY * tileSize + offset}px`;

        this.gridContainer.appendChild(worker);
        this.workerElement = worker;
        this.workerTileSize = tileSize;
        this.workerOffset = offset;
    },

    moveWorkerTo: function (cellIndex) {
        if (!this.workerElement || !this.gridInfo.width) return;

        // Calculer la position x,y depuis l'index
        const gridW = this.gridInfo.width;
        const tileSize = this.gridInfo.tileSize;
        const offset = this.workerOffset || 0;

        const targetX = cellIndex % gridW;
        const targetY = Math.floor(cellIndex / gridW);

        // Mettre à jour la position
        this.workerPosition = { x: targetX, y: targetY };

        // Animer le déplacement avec CSS transition (avec offset pour centrer)
        this.workerElement.style.left = `${targetX * tileSize + offset}px`;
        this.workerElement.style.top = `${targetY * tileSize + offset}px`;
    },

    handleResize: function () {
        if (window.InteriorSystem.isInside && this.currentBuilding) {
            const b = this.currentBuilding;
            const conf = window.InteriorSystem.getInteriorConfig(b.buildingId);
            this.renderGrid(b, conf); // Re-render simple
        }
    }
};
