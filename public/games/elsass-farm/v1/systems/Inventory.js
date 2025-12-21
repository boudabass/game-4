// systems/Inventory.js
// Système d'inventaire - Graines, Outils et Loot

window.Inventory = {
    // Structure de l'inventaire joueur
    player: {
        // Graines (16 slots fixes par saison)
        seeds: {
            SPRING: [
                { id: 'potato', name: 'Pomme de terre', icon: '🥔', qty: 10 },
                { id: 'leek', name: 'Poireau', icon: '🧅', qty: 5 },
                { id: 'cabbage', name: 'Chou', icon: '🥬', qty: 5 },
                { id: 'radish', name: 'Radis', icon: '🌱', qty: 8 }
            ],
            SUMMER: [
                { id: 'blueberry', name: 'Bleuets', icon: '🫐', qty: 0 },
                { id: 'beans', name: 'Haricots', icon: '🫘', qty: 0 },
                { id: 'pepper', name: 'Piment', icon: '🌶️', qty: 0 },
                { id: 'melon', name: 'Melon', icon: '🍈', qty: 0 }
            ],
            AUTUMN: [
                { id: 'eggplant', name: 'Aubergine', icon: '🍆', qty: 0 },
                { id: 'pumpkin', name: 'Potiron', icon: '🎃', qty: 0 },
                { id: 'squash', name: 'Citrouille', icon: '🎃', qty: 0 },
                { id: 'mushroom', name: 'Champignon', icon: '🍄', qty: 0 }
            ],
            WINTER: [
                { id: 'garlic', name: 'Ail', icon: '🧄', qty: 0 },
                { id: 'artichoke', name: 'Artichaut', icon: '🌿', qty: 0 },
                { id: 'winter_empty1', name: '?', icon: '❓', qty: 0 },
                { id: 'winter_empty2', name: '?', icon: '❓', qty: 0 }
            ]
        },

        // Outils (6 slots avec niveaux)
        tools: [
            { id: 'watering_can', name: 'Arrosoir', icon: '💧', level: 1 },
            { id: 'pickaxe', name: 'Pioche', icon: '⛏️', level: 1 },
            { id: 'axe', name: 'Hache', icon: '🪓', level: 1 },
            { id: 'sword', name: 'Épée', icon: '🗡️', level: 1 },
            { id: 'wand', name: 'Baguette', icon: '✨', level: 1 },
            { id: 'special', name: 'Spécial', icon: '🔧', level: 0 }
        ],

        // Loot (24 slots : 6 catégories x 4 items)
        loot: {
            WOOD: [
                { id: 'log', name: 'Bûches', icon: '🪵', qty: 0 },
                { id: 'coal', name: 'Charbon', icon: '💎', qty: 0 },
                { id: 'plank', name: 'Planche', icon: '🪵', qty: 0 },
                { id: 'stick', name: 'Bâton', icon: '🥢', qty: 0 }
            ],
            STONE: [
                { id: 'stone', name: 'Pierre', icon: '🪨', qty: 0 },
                { id: 'concrete', name: 'Béton', icon: '🧱', qty: 0 },
                { id: 'brick', name: 'Brique', icon: '🧱', qty: 0 },
                { id: 'gravel', name: 'Gravier', icon: '⚪', qty: 0 }
            ],
            METAL: [
                { id: 'iron_ore', name: 'Fer (Minerai)', icon: '🪨', qty: 0 },
                { id: 'iron_ingot', name: 'Fer (Lingot)', icon: '🥈', qty: 0 },
                { id: 'copper_ore', name: 'Cuivre (Minerai)', icon: '🪨', qty: 0 },
                { id: 'copper_ingot', name: 'Cuivre (Lingot)', icon: '🥉', qty: 0 }
            ],
            MACHINES: [
                { id: 'workbench', name: 'Établi', icon: '🔨', qty: 0 },
                { id: 'furnace', name: 'Four', icon: '🔥', qty: 0 },
                { id: 'herbalist', name: 'Herbaliste', icon: '⚗️', qty: 0 },
                { id: 'research', name: 'Recherche', icon: '🔬', qty: 0 }
            ],
            NATURE: [
                { id: 'berry', name: 'Baies', icon: '🫐', qty: 0 },
                { id: 'mushroom', name: 'Champignon', icon: '🍄', qty: 0 },
                { id: 'herb', name: 'Herbe', icon: '🌿', qty: 0 },
                { id: 'flower', name: 'Fleur', icon: '🌸', qty: 0 }
            ],
            POTIONS: [
                { id: 'potion_health', name: 'Santé', icon: '❤️', qty: 0 },
                { id: 'potion_energy', name: 'Énergie', icon: '⚡', qty: 0 },
                { id: 'potion_speed', name: 'Vitesse', icon: '👟', qty: 0 },
                { id: 'potion_force', name: 'Force', icon: '💪', qty: 0 }
            ]
        }
    },

    // Outil actuellement sélectionné (-1 = aucun)
    selectedToolIndex: 0,

    // Graine actuellement sélectionnée (-1 = aucun)
    selectedSeedIndex: 0,

    // --- Méthodes d'accès ---

    // Récupère l'outil sélectionné
    getSelectedTool: function () {
        return this.player.tools[this.selectedToolIndex];
    },

    // Récupère les graines de la saison actuelle
    getCurrentSeasonSeeds: function () {
        return this.player.seeds[GameState.season] || [];
    },

    // Récupère la graine sélectionnée
    getSelectedSeed: function () {
        const seeds = this.getCurrentSeasonSeeds();
        return seeds[this.selectedSeedIndex] || null;
    },

    // --- Actions ---

    // Sélectionner un outil
    selectTool: function (index) {
        if (index >= -1 && index < this.player.tools.length) {
            this.selectedToolIndex = index;
            if (index !== -1) console.log(`🔧 Outil sélectionné: ${this.getSelectedTool().name}`);
            if (window.QuickAction && QuickAction.refresh) QuickAction.refresh();
            return true;
        }
        return false;
    },

    // Sélectionner une graine
    selectSeed: function (index) {
        const seeds = this.getCurrentSeasonSeeds();
        if (index >= -1 && index < seeds.length) {
            this.selectedSeedIndex = index;
            const seed = this.getSelectedSeed();
            if (seed && seed.name) {
                console.log(`🌱 Graine sélectionnée: ${seed.name}`);
            }
            if (window.QuickAction && QuickAction.refresh) QuickAction.refresh();
            return true;
        }
        return false;
    },

    // Consommer une graine (lors de la plantation)
    useSeed: function (seedId) {
        for (const season in this.player.seeds) {
            const seeds = this.player.seeds[season];
            const seed = seeds.find(s => s.id === seedId);
            if (seed && seed.qty > 0) {
                seed.qty--;
                console.log(`📦 -1 ${seed.name} (reste: ${seed.qty})`);
                if (window.QuickAction && QuickAction.refresh) QuickAction.refresh();
                return true;
            }
        }
        return false;
    },

    // Ajouter au loot (lors de la récolte)
    addLoot: function (itemId, quantity) {
        for (const category in this.player.loot) {
            const items = this.player.loot[category];
            const item = items.find(i => i.id === itemId);
            if (item) {
                item.qty += quantity;
                console.log(`📦 +${quantity} ${item.name} (total: ${item.qty})`);
                return true;
            }
        }
        // Si l'item n'existe pas dans le loot, essayer HARVEST
        const harvest = this.player.loot.HARVEST;
        const existing = harvest.find(i => i.id === itemId);
        if (existing) {
            existing.qty += quantity;
            console.log(`📦 +${quantity} ${existing.name} (total: ${existing.qty})`);
            return true;
        }

        console.warn(`Item ${itemId} non trouvé dans l'inventaire loot`);
        return false;
    },

    // Vérifier si le joueur a des graines de ce type
    hasSeed: function (seedId) {
        for (const season in this.player.seeds) {
            const seed = this.player.seeds[season].find(s => s.id === seedId);
            if (seed && seed.qty > 0) return true;
        }
        return false;
    },

    // --- Pour la sauvegarde ---

    // Exporte l'inventaire pour sauvegarde
    export: function () {
        return {
            seeds: this.player.seeds,
            tools: this.player.tools,
            loot: this.player.loot,
            selectedToolIndex: this.selectedToolIndex,
            selectedSeedIndex: this.selectedSeedIndex
        };
    },

    // Importe l'inventaire depuis une sauvegarde
    import: function (data) {
        if (data.seeds) this.player.seeds = data.seeds;
        if (data.tools) this.player.tools = data.tools;
        if (data.loot) this.player.loot = data.loot;
        if (data.selectedToolIndex !== undefined) this.selectedToolIndex = data.selectedToolIndex;
        if (data.selectedSeedIndex !== undefined) this.selectedSeedIndex = data.selectedSeedIndex;
        console.log("📦 Inventaire importé");
    }
};

console.log("✅ Inventory.js chargé");
