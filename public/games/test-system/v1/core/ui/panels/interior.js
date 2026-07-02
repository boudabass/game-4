/*
    system/core/ui/panels/interior.js
    Gère l'interface utilisateur du mode Intérieur (Panel de construction).
*/

window.InteriorUI = {
    currentCategory: 'machines', // machines, storage, decoration
    selectedItem: null,
    buildMode: false,

    init: function () {
        // Initialisé par InteriorRenderer ou UIManager
        console.log("InteriorUI Initialized");
        this.buildMode = false;
    },

    toggleBuildMode: function () {
        this.buildMode = !this.buildMode;

        const sidebar = document.querySelector('.interior-sidebar');
        const gridContainer = document.querySelector('.interior-grid-container');
        const toggleBtn = document.getElementById('int-build-toggle');

        if (this.buildMode) {
            if (sidebar) sidebar.classList.remove('hidden-sidebar');
            if (gridContainer) gridContainer.classList.add('build-active');
            if (toggleBtn) {
                toggleBtn.classList.add('active');
                toggleBtn.innerHTML = '🔨 ON';
            }
        } else {
            if (sidebar) sidebar.classList.add('hidden-sidebar');
            if (gridContainer) gridContainer.classList.remove('build-active');
            if (this.selectedItem) this.selectItem(null); // Deselect item
            if (toggleBtn) {
                toggleBtn.classList.remove('active');
                toggleBtn.innerHTML = '🔨 OFF';
            }
        }
    },

    // Génère le HTML du panel latéral
    getSidebarHTML: function () {
        return `
            <div class="interior-sidebar hidden-sidebar">
                <div class="interior-category-tabs">
                    <button class="int-tab active" onclick="InteriorUI.setCategory('machines')" title="Machines">
                        🔧
                    </button>
                    <button class="int-tab" onclick="InteriorUI.setCategory('storage')" title="Stockage">
                        📦
                    </button>
                    <button class="int-tab" onclick="InteriorUI.setCategory('decoration')" title="Décoration">
                        🎨
                    </button>
                </div>
                <div class="interior-content-col">
                    <div class="interior-section-title" id="int-cat-title">MACHINES</div>
                    
                    <div class="interior-preview-panel" id="interior-preview">
                        <div class="placeholder-text">Sélectionnez un objet</div>
                    </div>

                    <div id="interior-items-list" class="interior-items-list scrollable-x">
                        <!-- Items injectés ici -->
                    </div>
                </div>
            </div>
        `;
    },

    setCategory: function (cat) {
        this.currentCategory = cat;

        // Update Tabs UI
        const tabs = document.querySelectorAll('.int-tab');
        tabs.forEach(t => t.classList.remove('active'));

        // Simple mapping pour les index de tabs, ou via dataset plus tard
        if (cat === 'machines') tabs[0]?.classList.add('active');
        if (cat === 'storage') tabs[1]?.classList.add('active');
        if (cat === 'decoration') tabs[2]?.classList.add('active');

        // Update Title
        const items = this.getItemsForCategory(cat);
        const titleEl = document.getElementById('int-cat-title');
        if (titleEl) {
            const titles = { 'machines': 'MACHINES', 'storage': 'STOCKAGE', 'decoration': 'DÉCOR' };
            titleEl.textContent = titles[cat];
        }

        this.renderItems(items);
    },

    getItemsForCategory: function (cat) {
        // Récupère les items depuis la config globale
        // Config.INTERIOR_ITEMS est structuré par catégorie: machines, storage, decoration

        if (!window.Config || !window.Config.INTERIOR_ITEMS) return [];

        // La config utilise des clés minuscules: machines, storage, decoration
        // cat est passé en minuscule par les boutons (onclick="InteriorUI.setCategory('machines')")

        return window.Config.INTERIOR_ITEMS[cat] || [];
    },

    renderItems: function (items) {
        const container = document.getElementById('interior-items-list');
        if (!container) return;

        container.innerHTML = '';

        if (!items || items.length === 0) {
            container.innerHTML = '<div class="empty-msg">Aucun item</div>';
            return;
        }

        items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'interior-item-card';
            if (this.selectedItem && this.selectedItem.id === item.id) {
                el.classList.add('selected');
            }

            el.innerHTML = `
                <div class="item-icon">${item.icon || '📦'}</div>
                <div class="item-name">${item.name}</div>
            `;

            el.onclick = () => this.selectItem(item);
            container.appendChild(el);
        });
    },

    selectItem: function (item) {
        this.selectedItem = item;

        // Highlight visuel
        const cards = document.querySelectorAll('.interior-item-card');
        cards.forEach(c => c.classList.remove('selected'));
        // Astuce: on pourrait garder une ref vers l'élément DOM, mais le re-render est rapide

        // Update Preview Panel
        this.renderPreview(item);

        // Notifier le système de placement
        if (window.InteriorSystem) {
            window.InteriorSystem.startPlacement(item);
        }
    },

    renderPreview: function (item) {
        const pan = document.getElementById('interior-preview');
        if (!pan) return;

        if (!item) {
            pan.innerHTML = '<div class="placeholder-text">Sélectionnez un objet</div>';
            return;
        }

        // Génération liste coûts
        let costsHtml = '';
        if (item.cost) {
            for (const [res, qty] of Object.entries(item.cost)) {
                costsHtml += `<div class="cost-row"><span class="res-name">${res}</span> <span class="res-val">${qty}</span></div>`;
            }
        }

        pan.innerHTML = `
            <div class="preview-header">
                <span class="preview-icon">${item.icon || '📦'}</span>
                <span class="preview-name">${item.name}</span>
            </div>
            <div class="preview-desc">${item.description || ''}</div>
            <div class="preview-costs">
                ${costsHtml}
            </div>
            <div class="preview-actions">
                <button class="place-btn" onclick="InteriorUI.confirmPlacement()">PLACER</button>
            </div>
        `;
    },

    confirmPlacement: function () {
        // Déclenché par le bouton UI (alternative au clic grille)
        console.log("Placement via bouton UI demandé");
        // Le vrai placement se fait souvent au clic sur la grille, 
        // mais ce bouton peut servir de validation si on pré-place "fantôme".
        // Pour l'instant, on laisse le InteriorRenderer gérer le clic grille.
    }
};
