// systems/EditorManager.js
// Gestionnaire principal des outils d'édition

window.EditorManager = {
    // État global
    isEditorActive: false,
    activeEditor: null, // 'texture', 'mapVisual', 'mapSystem', 'mapLogic'

    // Liste des éditeurs disponibles
    editors: {
        texture: { name: "Éditeur de Textures", icon: "🎨", enabled: true },
        mapVisual: { name: "Éditeur Map Visuel", icon: "🗺️", enabled: false },
        mapSystem: { name: "Éditeur Map System", icon: "🏗️", enabled: false },
        mapLogic: { name: "Éditeur Map Logique", icon: "⚙️", enabled: false }
    },

    // Modules d'éditeurs enregistrés
    modules: {},

    /**
     * Enregistre un module d'éditeur
     * @param {string} id - Identifiant de l'éditeur
     * @param {object} module - Module avec init(), render(), destroy()
     */
    registerEditor: function (id, module) {
        this.modules[id] = module;
        console.log(`📝 Éditeur enregistré: ${id}`);
    },

    /**
     * Ouvre un éditeur
     * @param {string} editorId - Identifiant de l'éditeur à ouvrir
     */
    open: function (editorId) {
        if (!this.editors[editorId]) {
            console.error(`❌ Éditeur inconnu: ${editorId}`);
            return;
        }

        if (!this.editors[editorId].enabled) {
            console.warn(`⚠️ Éditeur désactivé: ${editorId}`);
            return;
        }

        // Fermer le modal DevTools
        if (typeof toggleDevTools === 'function') {
            toggleDevTools();
        }

        // Masquer le HUD du jeu
        this.hideGameUI();

        // Activer l'état éditeur
        this.isEditorActive = true;
        this.activeEditor = editorId;

        // Afficher le container de l'éditeur
        const container = document.getElementById('editor-container');
        if (container) {
            container.style.display = 'flex';
            container.innerHTML = this.renderEditorUI(editorId);
        }

        // Initialiser le module si disponible
        if (this.modules[editorId] && typeof this.modules[editorId].init === 'function') {
            this.modules[editorId].init();
        }

        console.log(`🔧 Éditeur ouvert: ${editorId}`);
    },

    /**
     * Ferme l'éditeur actif
     */
    close: function () {
        console.log("🔴 EditorManager.close() appelé");
        console.log("🔴 isEditorActive:", this.isEditorActive);
        console.log("🔴 activeEditor:", this.activeEditor);

        if (!this.isEditorActive) {
            console.log("🔴 Éditeur déjà fermé, retour");
            return;
        }

        // Détruire le module si disponible
        if (this.activeEditor && this.modules[this.activeEditor]) {
            if (typeof this.modules[this.activeEditor].destroy === 'function') {
                this.modules[this.activeEditor].destroy();
            }
        }

        // Masquer le container
        const container = document.getElementById('editor-container');
        console.log("🔴 Container trouvé:", container);
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
            console.log("🔴 Container masqué");
        }

        // Restaurer le HUD du jeu
        this.showGameUI();

        // Désactiver l'état éditeur
        this.isEditorActive = false;
        this.activeEditor = null;

        console.log(`🔧 Éditeur fermé`);
    },

    /**
     * Masque le HUD du jeu
     */
    hideGameUI: function () {
        const elements = ['sc-seeds', 'sc-tools', 'zoom-controls'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
    },

    /**
     * Restaure le HUD du jeu
     */
    showGameUI: function () {
        const elements = ['sc-seeds', 'sc-tools', 'zoom-controls'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = '';
        });
    },

    /**
     * Génère le HTML de base d'un éditeur
     * @param {string} editorId - Identifiant de l'éditeur
     * @returns {string} HTML
     */
    renderEditorUI: function (editorId) {
        const editor = this.editors[editorId];
        const editorName = editor ? `${editor.icon} ${editor.name}` : editorId;

        return `
            <div class="editor-header">
                <h2 class="editor-title">${editorName}</h2>
                <button class="hud-btn hud-btn-red editor-close-btn" onclick="event.stopPropagation(); EditorManager.close()">✕ Fermer</button>
            </div>
            <div class="editor-body" onclick="event.stopPropagation()">
                <div class="editor-sidebar" id="editor-sidebar">
                    <!-- Contenu généré par le module -->
                    <p style="color: #888; text-align: center;">Chargement...</p>
                </div>
                <div class="editor-main" id="editor-main">
                    <!-- Zone principale de l'éditeur -->
                    <p style="color: #888; text-align: center;">Sélectionnez un élément dans la sidebar</p>
                </div>
            </div>
        `;
    }
};

// Fonction globale pour ouvrir DevTools (pont pour index.html)
window.toggleDevTools = function () {
    if (window.UIManager) {
        UIManager.toggleDevTools();
    }
};
