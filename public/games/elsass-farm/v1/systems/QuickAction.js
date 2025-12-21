// systems/QuickAction.js
// Gère l'affichage et les interactions simplifiées des raccourcis (Seeds/Tools)

window.QuickAction = {
    // Rafraîchir l'affichage des raccourcis (Miroir de l'inventaire)
    refresh: function () {
        if (!window.Inventory) return;

        // 1. Graines (Bas Gauche)
        const seed = Inventory.getSelectedSeed();
        const scSeedZone = document.getElementById('sc-seeds');
        if (scSeedZone) {
            if (seed && seed.qty > 0 && Inventory.selectedSeedIndex !== -1) {
                scSeedZone.classList.remove('sc-empty');
                document.getElementById('sc-seed-icon').innerText = seed.icon;
                document.getElementById('sc-seed-qty').innerText = seed.qty;
                document.getElementById('sc-seed-circle').classList.add('selected');
            } else {
                scSeedZone.classList.add('sc-empty');
                document.getElementById('sc-seed-circle').classList.remove('selected');
            }
        }

        // 2. Outils (Bas Droite)
        const tool = Inventory.getSelectedTool();
        const scToolZone = document.getElementById('sc-tools');
        if (scToolZone) {
            if (tool && tool.level > 0 && Inventory.selectedToolIndex !== -1) {
                scToolZone.classList.remove('sc-empty');
                document.getElementById('sc-tool-icon').innerText = tool.icon;
                document.getElementById('sc-tool-lv').innerText = `Lv${tool.level}`;
                document.getElementById('sc-tool-circle').classList.add('selected');
            } else {
                scToolZone.classList.add('sc-empty');
                document.getElementById('sc-tool-circle').classList.remove('selected');
            }
        }
    },

    // Action lors du clic sur le cercle principal
    handleMainClick: function (tab) {
        if (typeof toggleInventory === 'function') {
            toggleInventory();
            if (typeof switchInvTab === 'function') {
                switchInvTab(tab);
            }
        }
    },

    // Désélectionner (Step 3 - Préparation)
    deselect: function (type) {
        if (!window.Inventory) return;
        if (type === 'seed') {
            Inventory.selectedSeedIndex = -1;
        } else if (type === 'tool') {
            Inventory.selectedToolIndex = -1;
        }
        this.refresh();
    }
};

console.log("✅ QuickAction.js chargé");
