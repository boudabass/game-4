// public/games/system/core/ui/panels/detail.js
// Gestion du Panneau de Détail Bâtiment

(function () {
    const UI = window.UIManager;
    if (!UI) return;

    UI.Panels = UI.Panels || {};
    UI.Panels.Detail = {
        show: function (building) {
            const panel = document.getElementById('detail-panel');
            if (panel) {
                panel.classList.add('visible');
                this.update(building);
            }
        },

        update: function (building) {
            if (!building) return;
            const bInfo = window.Config && window.Config.BUILDINGS && window.Config.BUILDINGS[building.buildingId];
            if (!bInfo) return;

            // Infos de base
            const elIcon = document.getElementById('detail-icon');
            if (elIcon) elIcon.textContent = bInfo.icon;

            const elName = document.getElementById('detail-name');
            if (elName) elName.textContent = bInfo.name;

            const elDesc = document.getElementById('detail-desc');
            if (elDesc) elDesc.textContent = bInfo.description || '';

            // Stats
            const statsEl = document.getElementById('detail-stats');
            if (statsEl) {
                const isolation = bInfo.insulation || 0;
                statsEl.textContent = `Isolation: ${isolation}`;
            }

            // Staff / Management
            const mgmtRow = document.querySelector('.mgmt-row');

            if (mgmtRow) {
                mgmtRow.innerHTML = '';
                mgmtRow.style.flexDirection = 'column';
                mgmtRow.style.alignItems = 'flex-start';
                mgmtRow.style.gap = '8px';

                const numSlots = bInfo.slots || 0;
                if (numSlots > 0) {
                    // 1. Outil Nécessaire
                    const toolId = bInfo.required_tool;
                    const toolDef = (window.Config && window.Config.ITEM_DEFINITIONS) ? window.Config.ITEM_DEFINITIONS[toolId] : null;
                    const toolIcon = toolDef?.icon || '❓';
                    const toolName = toolDef?.name || 'Inconnu';

                    const toolEl = document.createElement('div');
                    toolEl.className = 'detail-mgmt-line';
                    toolEl.innerHTML = `<span class="label">outils nécessaire :</span> <span class="val">${toolIcon} ${toolName}</span>`;
                    mgmtRow.appendChild(toolEl);

                    // 2. Travailleurs Assignés
                    let workerNames = "Aucun";
                    const rawAssigned = building.assignedPeople || [];
                    const assignedList = Array.isArray(rawAssigned) ? rawAssigned : Object.values(rawAssigned);
                    const activeWorkers = assignedList.filter(id => id !== null && id !== undefined);

                    if (activeWorkers.length > 0) {
                        workerNames = activeWorkers
                            .map(id => {
                                const p = window.PersonSystem.getPerson(id);
                                const inst = window.PersonSystem.getInstance(id);
                                if (!p || !inst) return "Inconnu";
                                let stateText = (inst.state === 'GOING_TO_WORK') ? " (En chemin...)" : (inst.state === 'WORKING' ? " (Au poste)" : "");
                                return p.name + stateText;
                            })
                            .join(", ");
                    }

                    const workerEl = document.createElement('div');
                    workerEl.className = 'detail-mgmt-line';
                    workerEl.innerHTML = `<span class="label">Travaileur assigné :</span> <span class="val">${workerNames}</span>`;
                    mgmtRow.appendChild(workerEl);

                    // 3. Bouton d'Assignation
                    const assignBtn = document.createElement('button');
                    assignBtn.className = 'hud-btn confirm-btn assign-btn';
                    assignBtn.style.marginTop = '10px';
                    assignBtn.style.width = '100%';
                    assignBtn.textContent = 'ASSIGNER CITOYEN';

                    // On ouvre le picker pour le premier slot disponible, ou le premier slot tout court
                    let targetIndex = assignedList.indexOf(null);
                    if (targetIndex === -1 || targetIndex >= numSlots) targetIndex = 0;

                    assignBtn.onclick = () => this.handleSlotClick(building, targetIndex);
                    mgmtRow.appendChild(assignBtn);
                } else {
                    mgmtRow.innerHTML = '<span class="detail-desc">Pas de personnel requis pour ce bâtiment.</span>';
                }
            }

            // Gestion Bouton Démanteler
            const dismantleBtn = document.getElementById('btn-dismantle-main');

            // --- NOUVEAU: Bouton "ENTRER" (Vue Intérieure) ---
            // On l'ajoute juste avant le bouton démanteler ou dans le footer
            // Pour l'instant, on va l'injecter dynamiquement dans le footer si pas déjà là
            let enterBtn = document.getElementById('btn-enter-interior');
            if (!enterBtn) {
                const footer = document.querySelector('.detail-footer');
                if (footer) {
                    enterBtn = document.createElement('button');
                    enterBtn.id = 'btn-enter-interior';
                    enterBtn.className = 'hud-btn'; // Style par défaut
                    enterBtn.style.marginBottom = '10px';
                    enterBtn.style.borderColor = '#a5f3fc';
                    enterBtn.style.color = '#a5f3fc';
                    enterBtn.textContent = 'ENTRER';
                    // Insérer en premier (avant Démanteler)
                    footer.insertBefore(enterBtn, footer.firstChild);
                }
            }

            if (enterBtn) {
                // Vérifier si c'est un batiment avec intérieur possible (pas une route, pas le générateur)
                const isSpecial = building.is_map || building.buildingId === 'generator' || building.buildingId === 'road';
                if (isSpecial) {
                    enterBtn.classList.add('hidden');
                } else {
                    enterBtn.classList.remove('hidden');
                    enterBtn.onclick = () => this.enterInterior(building);
                }
            }

            // Reset de l'état (toujours afficher le bouton principal au changement de bâtiment)
            this.cancelDismantle();

            if (dismantleBtn) {
                if (building.is_map || building.buildingId === 'generator') {
                    dismantleBtn.disabled = true;
                    dismantleBtn.style.opacity = '0.5';
                    dismantleBtn.style.cursor = 'not-allowed';
                    dismantleBtn.title = 'Impossible de démolir un élément de la carte';
                } else {
                    dismantleBtn.disabled = false;
                    dismantleBtn.style.opacity = '1';
                    dismantleBtn.style.cursor = 'pointer';
                    dismantleBtn.title = 'Démanteler ce bâtiment';
                }
            }
        },

        requestDismantle: function () {
            const mainBtn = document.getElementById('btn-dismantle-main');
            const group = document.getElementById('dismantle-confirm-group');
            if (mainBtn) mainBtn.classList.add('hidden');
            if (group) group.classList.remove('hidden');
        },

        cancelDismantle: function () {
            const mainBtn = document.getElementById('btn-dismantle-main');
            const group = document.getElementById('dismantle-confirm-group');
            if (mainBtn) mainBtn.classList.remove('hidden');
            if (group) group.classList.add('hidden');
        },

        confirmDismantle: function () {
            if (window.BuildingSystem) {
                window.BuildingSystem.dismantleCurrent();
            }
            this.cancelDismantle();
        },

        enterInterior: function (building) {
            if (window.InteriorSystem) {
                window.InteriorSystem.enter(building);
            }
        },

        hide: function () {
            const panel = document.getElementById('detail-panel');
            if (panel) panel.classList.remove('visible');
        },

        handleSlotClick: function (building, slotIndex) {
            // OUVRE LE PICKER SYSTEMATIQUEMENT (POUR AJOUTER, CHANGER OU RETIRER)
            if (window.UIManager.Panels.People) {
                window.UIManager.Panels.People.showPicker(building, slotIndex);
            }
        }
    };

    // Mapping Core UIManager
    UI.showDetailPanel = (b) => UI.Panels.Detail.show(b);
    UI.updateDetailPanel = (b) => UI.Panels.Detail.update(b);
    UI.hideDetailPanel = () => UI.Panels.Detail.hide();

})();
