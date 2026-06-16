// public/games/system/core/ui/panels/build.js
// Gestion du Menu de Construction (Shelf)

(function () {
    const UI = window.UIManager;
    if (!UI) return;

    UI.Panels = UI.Panels || {};
    UI.Panels.Build = {
        isVisible: false,
        selectedCategory: null,
        currentCategory: 'all',

        init: function () {
            // Initialisation si besoin
        },

        toggle: function () {
            window.UIManager.toggleShelf('build-shelf');
        },

        onShow: function () {
            this.isVisible = true;
            this.render(this.currentCategory);
        },

        onHide: function () {
            this.isVisible = false;
            // Nettoyer la sélection visuelle
            this.updateSelection(null);

            if (window.BuildingSystem) {
                BuildingSystem.cancelPlacement();
            }
        },

        render: function (category) {
            this.currentCategory = category || this.currentCategory;
            const container = document.getElementById('buildings-row');
            if (!container) return;
            container.innerHTML = '';

            const buildings = (window.Config && window.Config.BUILDINGS) ? window.Config.BUILDINGS : {};
            for (const [id, data] of Object.entries(buildings)) {
                if (data.hidden && !window.Config.debugMode) continue;
                if (this.currentCategory !== 'all' && data.category !== this.currentCategory) continue;
                if (data.category === 'special') continue;

                const itemWrap = document.createElement('div');
                itemWrap.className = 'build-item-container';
                itemWrap.id = `build-item-${id}`;
                itemWrap.dataset.id = id;

                // Gestionnaires touch-friendly
                let touchHandled = false;
                itemWrap.ontouchend = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    touchHandled = true;
                    this.handleBuildClick(id, data);
                    setTimeout(() => { touchHandled = false; }, 300);
                };
                itemWrap.onclick = () => {
                    if (!touchHandled) {
                        this.handleBuildClick(id, data);
                    }
                };

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

            this.updateTabs(this.currentCategory);
        },

        updateTabs: function (category) {
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.id === `tab-${category}`);
            });
        },

        filter: function (category) {
            console.log("🏗️ Filter Buildings: " + category);
            this.render(category);
        },

        handleBuildClick: function (id, data) {
            const item = document.getElementById(`build-item-${id}`);
            const isRoad = id === 'road';

            // Si data n'est pas fourni (cas de la route codée en dur dans index.html)
            if (!data && isRoad) {
                const buildings = (window.Config && window.Config.BUILDINGS) ? window.Config.BUILDINGS : {};
                data = buildings['road'] || { name: "Route", description: "Permet de relier les bâtiments.", cost: { wood: 0 }, icon: "🟫" };
            }

            // SIMPLIFICATION MOBILE-FIRST : Single Tap → Start Build immédiatement
            this.updateSelection(id);
            this.updateInfoPane(data);
            this.startBuild(id);

            // Fermeture automatique du menu pour dégager la vue
            this.toggle();

            // Feedback optionnel
            console.log("📱 Mobile Workflow: Item Selected -> Build Started -> Menu Closed");
        },

        updateInfoPane: function (data) {
            const pane = document.getElementById('build-info-pane');
            if (!pane) return;

            let costHtml = '';
            if (data.cost) {
                Object.entries(data.cost).forEach(([res, qty]) => {
                    costHtml += `
                        <div class="cost-square">
                            <span class="cost-qty">${qty}</span>
                            <span class="cost-name">${res}</span>
                        </div>
                    `;
                });
            }

            // Ajout de l'outil si nécessaire
            if (data.required_tool) {
                costHtml += `
                    <div class="cost-square tool-square">
                        <span class="cost-qty">1</span>
                        <span class="cost-name">${data.required_tool}</span>
                    </div>
                `;
            }

            pane.innerHTML = `
                <div class="info-line-1">${data.name}</div>
                <div class="info-line-2">${data.description || 'Pas de description.'}</div>
                <div class="info-line-3">
                    <div class="cost-grid">
                        ${costHtml}
                    </div>
                </div>
            `;
        },

        startBuild: function (id) {
            console.log("🔨 Start Build: " + id);
            // On peut garder la sélection active visuellement
            if (window.BuildingSystem) {
                BuildingSystem.startPlacement(id);
            }
        },

        updateSelection: function (selectedId) {
            document.querySelectorAll('.build-item-container').forEach(item => {
                if (item.id === `build-item-${selectedId}` || item.dataset.id === selectedId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    };

    // Raccourcis Global
    UI.filterBuildings = (c) => UI.Panels.Build.filter(c);
    window.filterBuildings = (c) => UI.Panels.Build.filter(c);
    UI.updateBuildingSelection = (id) => UI.Panels.Build.updateSelection(id);
    window.toggleBuildMenu = () => UI.Panels.Build.toggle();

})();
