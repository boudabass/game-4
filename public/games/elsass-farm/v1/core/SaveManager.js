// core/SaveManager.js
// Gestion de la persistance via le GameSystem Hub

window.SaveManager = {
    // Clé de sauvegarde
    SAVE_KEY: 'elsass-farm-save',

    // Sauvegarde l'état actuel
    save: function () {
        const saveData = {
            // État du joueur
            energy: GameState.energy,
            gold: GameState.gold,

            // Temps
            day: GameState.day,
            hour: GameState.hour,
            minute: GameState.minute,
            season: GameState.season,

            // Position
            currentZoneId: GameState.currentZoneId,

            // Grilles de farming
            grids: window.GridSystem ? GridSystem.export() : {},

            // Inventaire
            inventory: window.Inventory ? Inventory.export() : {},

            // Métadonnées
            savedAt: new Date().toISOString(),
            version: '1.1'
        };

        // Essayer d'utiliser le GameSystem Hub si disponible
        if (window.GameSystem && window.GameSystem.Storage) {
            window.GameSystem.Storage.save(this.SAVE_KEY, saveData);
            console.log("💾 Sauvegarde via GameSystem Hub");
        } else {
            // Fallback localStorage
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            console.log("💾 Sauvegarde via localStorage");
        }

        return true;
    },

    // Charge une sauvegarde existante
    load: function () {
        let saveData = null;

        // Essayer d'utiliser le GameSystem Hub si disponible
        if (window.GameSystem && window.GameSystem.Storage) {
            saveData = window.GameSystem.Storage.load(this.SAVE_KEY);
        } else {
            // Fallback localStorage
            const stored = localStorage.getItem(this.SAVE_KEY);
            if (stored) {
                saveData = JSON.parse(stored);
            }
        }

        if (saveData) {
            // Restaurer l'état
            GameState.energy = saveData.energy ?? 100;
            GameState.gold = saveData.gold ?? 0;
            GameState.day = saveData.day ?? 1;
            GameState.hour = saveData.hour ?? 6;
            GameState.minute = saveData.minute ?? 0;
            GameState.season = saveData.season ?? 'SPRING';
            GameState.currentZoneId = saveData.currentZoneId ?? 'C_C';

            // Restaurer les grilles de farming
            if (saveData.grids && window.GridSystem) {
                GridSystem.import(saveData.grids);
            }

            // Restaurer l'inventaire
            if (saveData.inventory && window.Inventory) {
                Inventory.import(saveData.inventory);
            }

            console.log("📂 Sauvegarde chargée:", saveData.savedAt);

            // Rafraîchir le HUD
            if (window.refreshHUD) window.refreshHUD();

            return true;
        }

        console.log("📂 Aucune sauvegarde trouvée");
        return false;
    },

    // Supprime la sauvegarde
    clear: function () {
        if (window.GameSystem && window.GameSystem.Storage) {
            window.GameSystem.Storage.remove(this.SAVE_KEY);
        } else {
            localStorage.removeItem(this.SAVE_KEY);
        }
        console.log("🗑️ Sauvegarde effacée");
    },

    // Vérifie si une sauvegarde existe
    hasSave: function () {
        if (window.GameSystem && window.GameSystem.Storage) {
            return window.GameSystem.Storage.load(this.SAVE_KEY) !== null;
        }
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }
};

console.log("✅ SaveManager.js chargé");
