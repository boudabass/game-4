window.UIManager = {
    init: function () {
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    },

    handleResize: function () {
        const referenceWidth = 1920;
        const scale = (window.innerWidth / referenceWidth) * 1.5;

        // Appliquer le scaling au conteneur UI s'il existe
        // Note: On suppose qu'il y a un conteneur global ou on l'applique au body/game-container
        // Dans index.html on a les éléments UI éparpillés.
        // On va cibler les éléments principaux ou créer un wrapper si besoin.
        // Le mieux est de cibler .hud-bar, .central-temp-gauge, .time-weather-bar, .mission-panel, .bottom-ui-container, .detail-panel
        // OU MIEUX : Ajouter un conteneur global dans index.html ou appliquer au body avec transform origin ? 
        // Appliquer au body peut casser p5.
        // On va appliquer sur les éléments UI spécifiques via une classe commune ou individuellement.

        // STRATÉGIE "UI LAYER" : On applique le scale sur les conteneurs principaux.

        // 1. Top HUD (Groupé)
        const topHud = document.getElementById('top-hud-container');
        if (topHud) {
            topHud.style.transform = `scale(${scale})`;
            topHud.style.width = `${100 / scale}%`;
            topHud.style.transformOrigin = 'top left';
        }

        // 2. Autres éléments UI
        const uiElements = [
            '#mission-panel',
            '.bottom-ui-container',
            '#detail-panel',
            '#debug-panel',
            '#action-modal'
        ];

        uiElements.forEach(selector => {
            const els = document.querySelectorAll(selector);
            els.forEach(el => {
                el.style.transform = `scale(${scale})`;

                // Gestion des origines
                if (el.id === 'mission-panel') {
                    // FIX: Ancrage BAS-GAUCHE pour qu'il ne remonte pas
                    el.style.transformOrigin = 'bottom left';
                } else if (el.classList.contains('bottom-ui-container')) {
                    el.style.transformOrigin = 'bottom left';
                    el.style.width = `${100 / scale}%`;
                } else if (el.id === 'detail-panel' || el.id === 'debug-panel') {
                    el.style.transformOrigin = 'top right';
                } else if (el.id === 'action-modal') {
                    el.style.transformOrigin = 'center left';
                } else {
                    el.style.transformOrigin = 'top left';
                }
            });
        });

        console.log(`UI Resized: Scale ${scale.toFixed(2)}`);
    },

    startBuild: function (buildingId) {
        if (window.BuildingSystem) {
            BuildingSystem.startPlacement(buildingId);
            this.updateBuildingSelection(buildingId);
        }
    },

    updateBuildingSelection: function (selectedId) {
        const items = document.querySelectorAll('.build-item-container');
        items.forEach(item => {
            if (item.dataset.id === selectedId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    setSpeed: function (speed) {
        GameState.gameSpeed = speed;
        // ... (unchanged)
        GameState.isPaused = (speed === 0);

        document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`speed-${speed}`);
        if (activeBtn) activeBtn.classList.add('active');

        console.log("Vitesse du jeu réglée sur : " + speed);
    },

    // ... (toggleBuildMenu unchanged)

    toggleBuildMenu: function () {
        const shelf = document.getElementById('build-shelf');
        const btn = document.getElementById('btn-build');
        if (shelf && btn) {
            const isVisible = shelf.classList.toggle('visible');
            btn.classList.toggle('active', isVisible);

            if (isVisible) {
                this.renderBuildings('all');
            } else {
                if (window.BuildingSystem) {
                    BuildingSystem.cancelPlacement();
                    if (BuildingSystem.isDemolishing) BuildingSystem.toggleDemolishMode();
                }
                this.updateBuildingSelection(null);
            }
        }
    },

    renderBuildings: function (category) {
        const container = document.getElementById('buildings-row');
        if (!container) return;
        container.innerHTML = '';

        const buildings = window.Config.BUILDINGS;
        for (const [id, data] of Object.entries(buildings)) {
            if (category !== 'all' && data.category !== category) continue;
            if (data.category === 'special' || id === 'road') continue;

            const itemWrap = document.createElement('div');
            itemWrap.className = 'build-item-container';
            itemWrap.dataset.id = id; // Identify for selection
            itemWrap.onclick = () => this.startBuild(id);

            // Tooltip
            itemWrap.onmouseover = (e) => this.showTooltip(e, data);
            itemWrap.onmouseout = () => this.hideTooltip();

            itemWrap.innerHTML = `
                <div class="action-btn-square">
                    <div class="square-icon-frame">
                        <span>${data.icon}</span>
                    </div>
                    <span class="build-label">${data.name}</span>
                </div>
            `;

            container.appendChild(itemWrap);
        }
    },

    filterBuildings: function (category) {
        console.log("Filtrage des constructions : " + category);
        // Mise à jour visuelle des onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === `tab-${category}`);
        });

        this.renderBuildings(category);
    },

    showTooltip: function (event, data) {
        let tooltip = document.getElementById('ui-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'ui-tooltip';
            tooltip.className = 'ui-tooltip';
            document.body.appendChild(tooltip);
        }

        let costHtml = Object.entries(data.cost).map(([res, val]) => {
            return `<span class="cost-item">${val} ${res}</span>`;
        }).join(' ');

        tooltip.innerHTML = `
            <div class="tooltip-header">${data.name}</div>
            <div class="tooltip-body">${data.description}</div>
            <div class="tooltip-cost">COÛT : ${costHtml}</div>
        `;

        tooltip.style.display = 'block';
        this.updateTooltipPos(event);
    },

    updateTooltipPos: function (e) {
        const tooltip = document.getElementById('ui-tooltip');
        if (tooltip) {
            tooltip.style.left = (e.pageX + 15) + 'px';
            tooltip.style.top = (e.pageY - 100) + 'px';
        }
    },

    hideTooltip: function () {
        const tooltip = document.getElementById('ui-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    },

    toggleLaws: function () {
        alert("Livre des Lois : Bientôt disponible !");
    },

    toggleTech: function () {
        alert("Arbre Technologique : Bientôt disponible !");
    },

    showDetailPanel: function (building) {
        const panel = document.getElementById('detail-panel');
        if (panel) {
            panel.classList.add('visible');
            this.updateDetailPanel(building);
        }
    },

    updateDetailPanel: function (building) {
        if (!building) return;
        const bInfo = Config.BUILDINGS[building.buildingId];
        const capacity = bInfo.capacity || 0;
        const current = building.staffCount || 0;
        const max = bInfo.staff ? (bInfo.staff.workers || bInfo.staff.engineers || 0) : 0;

        this.currentDetailBuilding = building; // Stocker le bâtiment courant pour l'action

        document.getElementById('detail-icon').textContent = bInfo.icon;
        document.getElementById('detail-name').textContent = bInfo.name;
        document.getElementById('detail-desc').textContent = bInfo.description;

        // Stats générales
        const statsEl = document.getElementById('detail-stats');
        if (statsEl) {
            statsEl.textContent = `Capacité: ${capacity} | Isolation: ${bInfo.insulation || '-'}`;
        }

        // Staff (entre les boutons +/-)
        const staffEl = document.getElementById('detail-staff-val');
        if (staffEl) {
            staffEl.textContent = `${current} / ${max}`;
        }
    },

    movePlayerToCurrent: function () {
        if (this.currentDetailBuilding && window.PlayerSystem) {
            const b = this.currentDetailBuilding;
            const gridCol = b.gridPos.col;
            const gridRow = b.gridPos.row;
            const bInfo = Config.BUILDINGS[b.buildingId];
            const w = bInfo.width || 1;
            const h = bInfo.height || 1;

            // Trouver la route la plus proche autour du bâtiment
            let nearestRoad = null;
            let minDistance = Infinity;

            const playerCol = PlayerSystem.player.gridCol;
            const playerRow = PlayerSystem.player.gridRow;

            // Parcourir le périmètre autour du bâtiment
            for (let i = -1; i <= w; i++) {
                for (let j = -1; j <= h; j++) {
                    // Ignorer les cases à l'intérieur du bâtiment
                    if (i >= 0 && i < w && j >= 0 && j < h) continue;

                    const checkCol = gridCol + i;
                    const checkRow = gridRow + j;

                    // Vérifier limites
                    if (checkCol < 0 || checkCol >= Config.GRID_SIZE ||
                        checkRow < 0 || checkRow >= Config.GRID_SIZE) continue;

                    // Vérifier si c'est une route
                    if (GridSystem.grid[checkCol][checkRow] === 'road') {
                        // Calculer distance Manhattan depuis le joueur
                        const dist = Math.abs(checkCol - playerCol) + Math.abs(checkRow - playerRow);
                        if (dist < minDistance) {
                            minDistance = dist;
                            nearestRoad = { col: checkCol, row: checkRow };
                        }
                    }
                }
            }

            if (nearestRoad) {
                console.log(`Déplacement vers route adjacente à ${bInfo.name} [${nearestRoad.col}, ${nearestRoad.row}]`);
                PlayerSystem.moveTo(nearestRoad.col, nearestRoad.row);
            } else {
                console.log(`Aucune route trouvée autour de ${bInfo.name}`);
            }
        }
    },

    hideDetailPanel: function () {
        const panel = document.getElementById('detail-panel');
        if (panel) panel.classList.remove('visible');
    },

    toggleMenu: function () {
        const modal = document.getElementById('menu-modal');
        if (modal) modal.style.display = (modal.style.display === 'flex' ? 'none' : 'flex');
    },

    // --- DEBUG ---
    toggleDebugMenu: function () {
        const panel = document.getElementById('debug-panel');
        if (panel) {
            panel.classList.toggle('visible');
        }
    },

    modifyResource: function (type, amount) {
        if (amount > 0) {
            ResourceManager.add(type, amount);
        } else {
            ResourceManager.consume(type, Math.abs(amount));
        }
    },

    // --- ACTION MODAL ---
    showActionModal: function (mode, data, onConfirm, onCancel) {
        const modal = document.getElementById('action-modal');
        if (!modal) return;

        // Fermer les autres panneaux
        this.hideDetailPanel();

        // Configurer le contenu
        document.getElementById('action-icon').textContent = data.icon || '🏗️';
        const titleEl = document.getElementById('action-title');
        const costEl = document.getElementById('action-cost');
        const confirmBtn = document.getElementById('btn-confirm');
        const cancelBtn = document.getElementById('btn-cancel');
        const msgEl = document.getElementById('action-msg');

        // Nettoyage events précédents
        const newConfirm = confirmBtn.cloneNode(true);
        const newCancel = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

        newCancel.onclick = () => {
            this.hideActionModal();
            if (onCancel) onCancel();
        };

        if (mode === 'BUILD') {
            titleEl.textContent = 'CONSTRUCTION';
            const bName = data.name || 'Bâtiment';
            msgEl.innerHTML = `Voulez-vous construire : <strong>${bName}</strong> ?`;

            // Afficher le coût
            let costHtml = '';
            if (data.cost) {
                costHtml = Object.entries(data.cost).map(([res, val]) => {
                    const have = GameState[res] || 0;
                    const color = have >= val ? '#a5f3fc' : '#ff4444';
                    return `<div style="color:${color}">${val} ${res}</div>`;
                }).join('');
            }
            costEl.innerHTML = `<div style="display:flex; gap:10px; margin-top:5px;">${costHtml}</div>`;

            newConfirm.textContent = 'CONSTRUIRE';
            newConfirm.onclick = () => {
                this.hideActionModal();
                if (onConfirm) onConfirm();
            };

            // Validation État
            if (data.isValid) {
                newConfirm.disabled = false;
                modal.style.borderColor = 'var(--frost-blue)';
            } else {
                newConfirm.disabled = true;
                modal.style.borderColor = 'var(--accent-red)';
                msgEl.innerHTML += `<br><span style="color:var(--accent-red)">${data.error || "Emplacement invalide"}</span>`;
            }

        } else if (mode === 'DEMOLISH') {
            titleEl.textContent = 'DÉMOLITION';
            msgEl.innerHTML = `Démolir <strong>${data.name}</strong> ?<br>Ressources récupérées (50%) :`;

            let refundHtml = '';
            if (data.refund) {
                refundHtml = Object.entries(data.refund).map(([res, val]) => {
                    return `<div style="color:#a5f3fc">+${val} ${res}</div>`;
                }).join('');
            }
            costEl.innerHTML = `<div style="display:flex; gap:10px; margin-top:5px;">${refundHtml}</div>`;

            newConfirm.textContent = 'DÉMOLIR';
            newConfirm.disabled = false;
            modal.style.borderColor = 'var(--accent-red)';
            newConfirm.onclick = () => {
                this.hideActionModal();
                if (onConfirm) onConfirm();
            };
        }

        modal.style.display = 'flex';
    },

    hideActionModal: function () {
        const modal = document.getElementById('action-modal');
        if (modal) modal.style.display = 'none';
    }
};

// Global shortcuts for HTML convenience
window.toggleBuildMenu = () => UIManager.toggleBuildMenu();
window.toggleLaws = () => UIManager.toggleLaws();
window.toggleTech = () => UIManager.toggleTech();
window.toggleMenu = () => UIManager.toggleMenu();
window.setSpeed = (s) => UIManager.setSpeed(s);

// DEBUG SHORTCUTS
window.toggleDebugMenu = () => UIManager.toggleDebugMenu();
window.modifyResource = (t, a) => UIManager.modifyResource(t, a);

window.saveGame = () => {
    if (window.SaveManager) SaveManager.save();
    console.log("Jeu sauvegardé.");
};

window.toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
};

window.quitGame = () => {
    if (confirm("Voulez-vous vraiment quitter ?")) {
        window.location.href = "/";
    }
};
