// public/games/system/core/ui/panels/people_list.js
// Gestion de la liste de sélection des citoyens pour assignation

(function () {
    const UI = window.UIManager;
    if (!UI) return;

    UI.Panels = UI.Panels || {};
    UI.Panels.PeopleList = {
        currentPickingSlot: null,
        currentPickingBuilding: null,
        refreshTimer: null,

        show: function (building, slotIndex) {
            this.currentPickingBuilding = building;
            this.currentPickingSlot = slotIndex;

            const panel = document.getElementById('people-picker-panel');
            if (panel) {
                panel.classList.add('visible');
                this.render();

                // --- AJOUT: Mise à jour automatique ---
                if (!this.refreshTimer) {
                    this.refreshTimer = setInterval(() => {
                        if (panel.classList.contains('visible')) {
                            this.render();
                        } else {
                            this.stopRefresh();
                        }
                    }, 1000); // Rafraîchir toutes les secondes
                }
            }
        },

        hide: function () {
            const panel = document.getElementById('people-picker-panel');
            if (panel) panel.classList.remove('visible');
            this.stopRefresh();
        },

        stopRefresh: function () {
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
                this.refreshTimer = null;
            }
        },

        render: function () {
            const container = document.getElementById('people-picker-list');
            if (!container || !window.PersonSystem || !this.currentPickingBuilding) return;

            // Optimisation : Ne pas tout redessiner si rien n'a changé ? 
            // Pour l'instant on garde le innerHTML = '' pour la simplicité demandée ("la liste doit se mettre à jour")
            container.innerHTML = '';

            const buildingId = (this.currentPickingBuilding.id !== undefined) ? this.currentPickingBuilding.id : this.currentPickingBuilding.buildingId;
            const allPeople = window.PersonSystem.people;

            // 1. Bouton "RETIRER TOUT" (Tout en haut)
            // Groupement par état
            const assignedHere = allPeople.filter(p => p.assignedTo === buildingId);
            const freePeople = allPeople.filter(p => !p.assignedTo);
            const occupiedElsewhere = allPeople.filter(p => p.assignedTo && p.assignedTo !== buildingId);

            if (assignedHere.length > 0) {
                const clearAllItem = document.createElement('div');
                clearAllItem.className = 'person-picker-item none-item-separator';
                clearAllItem.style.borderBottom = '1px solid #ff4444';
                clearAllItem.innerHTML = `
                    <div class="picker-name" style="color:#ff4444">TOUT LE MONDE</div>
                    <div class="picker-status-center">RETIRER TOUS LES CITOYENS</div>
                    <button class="picker-select-btn cancel-btn" onclick="UIManager.Panels.PeopleList.unassignAll()">RETIRER TOUT</button>
                `;
                container.appendChild(clearAllItem);
            }

            const createPickerItem = (person, stateClass = "", isAssignedHere = false) => {
                const item = document.createElement('div');
                item.className = `person-picker-item ${stateClass}`;

                const occupation = window.PersonSystem.getOccupationName(person.id);

                const btnText = isAssignedHere ? 'RETIRER' : 'CHOISIR';
                const btnClass = isAssignedHere ? 'cancel-btn' : '';
                const action = isAssignedHere ? `UIManager.Panels.PeopleList.unassignSingle('${person.id}')` : `UIManager.Panels.PeopleList.selectForAssignment('${person.id}')`;

                item.innerHTML = `
                    <div class="picker-name">${person.name}</div>
                    <div class="picker-status-center" style="${isAssignedHere ? 'color:var(--frost-blue)' : ''}">${occupation}</div>
                    <button class="picker-select-btn ${btnClass}" onclick="${action}">${btnText}</button>
                `;
                return item;
            };

            // Étape 1 : Déjà assignés ICI (Vert)
            assignedHere.forEach(person => {
                container.appendChild(createPickerItem(person, "is-assigned", true));
            });

            // Étape 2 : LIBRES (Neutre)
            freePeople.forEach(person => {
                container.appendChild(createPickerItem(person));
            });

            // Étape 3 : OCCUPÉS AILLEURS (Bleu)
            occupiedElsewhere.forEach(person => {
                container.appendChild(createPickerItem(person, "is-busy"));
            });
        },

        unassignAll: function () {
            if (this.currentPickingBuilding) {
                const buildingId = (this.currentPickingBuilding.id !== undefined) ? this.currentPickingBuilding.id : this.currentPickingBuilding.buildingId;
                const assigned = window.PersonSystem.people.filter(p => p.assignedTo === buildingId);

                assigned.forEach(person => {
                    window.PersonSystem.unassign(person.id);
                });

                // On vide également le tableau interne du bâtiment
                if (this.currentPickingBuilding.assignedPeople) {
                    this.currentPickingBuilding.assignedPeople = [];
                }

                this.render(); // Rafraîchir la liste
                if (window.UIManager.Panels.Detail) {
                    window.UIManager.Panels.Detail.update(this.currentPickingBuilding);
                }
            }
        },

        unassignSingle: function (personId) {
            window.PersonSystem.unassign(personId);
            this.render();
            if (window.UIManager.Panels.Detail) {
                window.UIManager.Panels.Detail.update(this.currentPickingBuilding);
            }
        },

        selectForAssignment: function (personId) {
            if (this.currentPickingBuilding && this.currentPickingSlot !== null) {
                window.PersonSystem.assign(personId, this.currentPickingBuilding, this.currentPickingSlot);
                this.render(); // Rafraîchir après assignation
                if (window.UIManager.Panels.Detail) {
                    window.UIManager.Panels.Detail.update(this.currentPickingBuilding);
                }
            }
        },

        // --- AJOUT: Gestionnaire de clic extérieur ---
        setupClickOutside: function () {
            document.addEventListener('mousedown', (e) => {
                const panel = document.getElementById('people-picker-panel');
                if (!panel || !panel.classList.contains('visible')) return;

                // Si clic en dehors du panel ET n'est pas un bouton d'assignation
                if (!panel.contains(e.target) && !e.target.closest('.assign-btn')) {
                    this.hide();
                }
            });
        }
    };

    // Initialisation du clic extérieur
    UI.Panels.PeopleList.setupClickOutside();

    // Mapping pour la compatibilité avec UI.Panels.People.showPicker
    if (UI.Panels.People) {
        UI.Panels.People.showPicker = (b, s) => UI.Panels.PeopleList.show(b, s);
        UI.Panels.People.hidePicker = () => UI.Panels.PeopleList.hide();
    }

    console.log("👥 Module UI PeopleList Loaded");
})();
