// public/games/system/core/ui/panels/people.js

(function () {
    const UI = window.UIManager;
    if (!UI) return;

    UI.Panels = UI.Panels || {};
    UI.Panels.People = {
        isVisible: false,
        selectedPersonId: null,

        init: function () {
            // Pas d'init spécial pour l'instant
        },

        toggle: function () {
            window.UIManager.toggleShelf('people-shelf');
        },

        onShow: function () {
            this.isVisible = true;
            this.renderTabs();

            // Sélectionner le premier par défaut si rien n'est sélectionné
            if (!this.selectedPersonId && window.PersonSystem.people.length > 0) {
                this.selectPerson(window.PersonSystem.people[0].id);
            } else if (this.selectedPersonId) {
                this.selectPerson(this.selectedPersonId);
            }
        },

        onHide: function () {
            this.isVisible = false;
        },

        renderTabs: function () {
            const tabsContainer = document.getElementById('people-tabs');
            if (!tabsContainer || !window.PersonSystem) return;

            tabsContainer.innerHTML = '';
            window.PersonSystem.people.forEach(person => {
                const btn = document.createElement('button');
                const isActive = this.selectedPersonId === person.id;
                btn.className = `tab-btn ${isActive ? 'active' : ''}`;

                // --- Style géré par CSS ---

                btn.innerHTML = `👤 ${person.name}`;
                btn.onclick = () => this.selectPerson(person.id);
                tabsContainer.appendChild(btn);
            });
        },

        selectPerson: function (id) {
            this.selectedPersonId = id;
            this.renderTabs();
            this.renderContent();
        },

        renderContent: function () {
            const content = document.getElementById('selected-person-content');
            if (!content || !window.PersonSystem) return;

            const person = window.PersonSystem.getPerson(this.selectedPersonId);
            if (!person) return;

            const occupation = window.PersonSystem.getOccupationName(person.id);

            const toolIcon = person.tool ? (window.Config.ITEM_DEFINITIONS[person.tool]?.icon || '❓') : '❌';
            const toolName = person.tool ? (window.Config.ITEM_DEFINITIONS[person.tool]?.name || person.tool) : 'Aucun';

            content.innerHTML = `
                <div class="person-stats-column">
                    <div class="stat-box"><span class="stat-label">SANTÉ</span><span class="stat-value">${person.stats.health}%</span></div>
                    <div class="stat-box"><span class="stat-label">MORAL</span><span class="stat-value">${person.stats.morale}%</span></div>
                    <div class="stat-box"><span class="stat-label">ÉNERGIE</span><span class="stat-value">${person.stats.energy}%</span></div>
                    <div class="stat-box"><span class="stat-label">MÉCONTENTEMENT</span><span class="stat-value">${person.stats.discontent}%</span></div>
                </div>
                
                <div class="person-occupation-center">
                    <div class="occupation-label">POSTE ACTUEL</div>
                    <div class="occupation-value">${occupation}</div>
                </div>

                <div class="person-info-column">
                   <div class="person-attr-row"><span>NOM</span><span class="person-attr-val">${person.name}</span></div>
                   <div class="person-attr-row"><span>OUTIL</span><span class="person-attr-val">${toolIcon} ${toolName}</span></div>
                   <div class="person-attr-row"><span>STATUT</span><span class="person-attr-val">${person.assignedTo ? 'ACTIF' : 'DISPONIBLE'}</span></div>
                   <div class="person-attr-row"><span>ID</span><span class="person-attr-val" style="opacity:0.3;">${person.id}</span></div>
                </div>
            `;
        },

        showDetailModal: function (id) {
            // Optionnel : On pourrait garder une vue modale plus complète si besoin
            console.log("Détails complets pour :", id);
        }
    };

    window.togglePeoplePanel = () => UI.Panels.People.toggle();

})();
