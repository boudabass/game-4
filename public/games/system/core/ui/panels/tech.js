// public/games/system/core/ui/panels/tech.js
// Gestion du Panneau des Technologies (Plein écran)
// Charge dynamiquement les arbres depuis Config.TECH_TREES (dossier config/tech/)

(function () {
    const UI = window.UIManager;
    if (!UI) return;

    UI.Panels = UI.Panels || {};
    UI.Panels.Tech = {
        isVisible: false,
        currentCategory: 'resource',

        // Mapping des onglets UI vers les clés TECH_TREES
        categoryMapping: {
            'farming': 'farming',
            'food': 'food',
            'resource': 'resource',
            'people': 'citizen',
            'infrastructure': 'infrastructure',
            'health': 'health',
            'industry': 'industry',
            'exploration': 'exploration'
        },

        init: function () {
            // Initialisation si besoin
        },

        onShow: function () {
            this.isVisible = true;
            this.render();
        },

        onHide: function () {
            this.isVisible = false;
        },

        setCategory: function (category) {
            console.log("🔬 Tech Category: " + category);
            this.currentCategory = category;
            this.render();
        },

        render: function () {
            this.updateTabs();
            this.renderContent();
        },

        updateTabs: function () {
            const tabs = document.querySelectorAll('#tech-tabs .tab-btn');
            tabs.forEach(btn => {
                const category = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
                btn.classList.toggle('active', category === this.currentCategory);
            });
        },

        /**
         * Récupère les chaînes d'évolution depuis Config.TECH_TREES
         * @param {string} uiCategory - La catégorie UI (resource, people, etc.)
         * @returns {Array} Tableau de chaînes d'évolution
         */
        getEvolutionChains: function (uiCategory) {
            const techTreeKey = this.categoryMapping[uiCategory] || uiCategory;
            const techTrees = (window.Config && window.Config.TECH_TREES) ? window.Config.TECH_TREES : {};
            const tree = techTrees[techTreeKey];

            if (!tree || !tree.chains) {
                return [];
            }

            // Convertit les chains en format compatible (tableau de tableaux de IDs)
            return tree.chains.map(chain => chain.levels);
        },

        renderContent: function () {
            const container = document.getElementById('tech-list');
            if (!container) return;
            container.innerHTML = '';

            // Charge dynamiquement depuis TECH_TREES
            const chains = this.getEvolutionChains(this.currentCategory);
            const techTreeKey = this.categoryMapping[this.currentCategory] || this.currentCategory;
            const techTree = (window.Config && window.Config.TECH_TREES) ? window.Config.TECH_TREES[techTreeKey] : null;

            if (chains.length === 0) {
                const treeName = techTree ? techTree.name : this.currentCategory;
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; padding: 40px; text-align: center; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px dashed rgba(255,255,255,0.1); width: 100%;">
                        <div style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;">🧪</div>
                        <h3 style="color: var(--frost-blue); margin-bottom: 10px; text-transform: uppercase;">Arbre : ${treeName}</h3>
                        <p style="color: var(--text-dim); font-style: italic;">Aucune technologie disponible pour cet onglet.</p>
                    </div>
                `;
                return;
            }

            // Récupère les métadonnées des chaînes pour les titres
            const chainsMeta = techTree ? techTree.chains : [];

            chains.forEach((chain, index) => {
                const chainMeta = chainsMeta[index] || {};
                const col = document.createElement('div');
                col.className = 'tech-column';

                // Ajoute un en-tête de chaîne si disponible
                if (chainMeta.name) {
                    const header = document.createElement('div');
                    header.className = 'tech-chain-header';
                    header.innerHTML = `
                        <span class="chain-name">${chainMeta.name}</span>
                        ${chainMeta.description ? `<span class="chain-desc">${chainMeta.description}</span>` : ''}
                    `;
                    col.appendChild(header);
                }

                chain.forEach(techId => {
                    const techData = this.getTechData(techId);
                    if (!techData) return;

                    const item = document.createElement('div');
                    item.className = 'tech-item';
                    // Simulation d'un état débloqué pour le premier élément
                    if (chain.indexOf(techId) === 0) item.classList.add('unlocked');

                    item.innerHTML = `
                        <div class="tech-icon">${techData.icon}</div>
                        <div class="tech-name">${techData.name}</div>
                    `;

                    col.appendChild(item);
                });

                container.appendChild(col);
            });
        },

        getTechData: function (id) {
            // Cherche dans Config.BUILDINGS ou BUILDING_CATEGORIES
            const buildings = (window.Config && window.Config.BUILDINGS) ? window.Config.BUILDINGS : {};
            if (buildings[id]) return buildings[id];

            // fallback sur BUILDING_CATEGORIES
            const cats = (window.Config && window.Config.BUILDING_CATEGORIES) ? window.Config.BUILDING_CATEGORIES : {};
            for (const cat in cats) {
                if (cats[cat][id]) return cats[cat][id];
            }

            return null;
        }
    };

    // Raccourci Global
    window.setTechCategory = (c) => UI.Panels.Tech.setCategory(c);

})();
