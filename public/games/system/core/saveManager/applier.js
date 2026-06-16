// public/games/system/core/saveManager/applier.js
// Logique d'application et de sérialisation

(function () {
    if (!window.SaveManager) return;

    // Rassemble toutes les données du jeu
    window.SaveManager.gatherData = function () {
        const data = {
            gameState: {
                energy: GameState.energy,
                gold: GameState.gold,
                day: GameState.day,
                hour: GameState.hour,
                minute: GameState.minute,
                season: GameState.season,
                currentZoneId: GameState.currentZoneId
            },
            savedAt: new Date().toISOString()
        };

        // Permettre aux extensions de rajouter des données
        if (this.onGatherData) {
            this.onGatherData(data);
        }

        return data;
    };

    // Applique les données au GameState et autres
    window.SaveManager.applyData = function (saveData) {
        if (!saveData || !saveData.gameState) return;

        const gs = saveData.gameState;
        if (gs.energy !== undefined) GameState.energy = gs.energy;
        if (gs.gold !== undefined) GameState.gold = gs.gold;
        if (gs.day !== undefined) GameState.day = gs.day;
        if (gs.hour !== undefined) GameState.hour = gs.hour;
        if (gs.minute !== undefined) GameState.minute = gs.minute;
        if (gs.season !== undefined) GameState.season = gs.season;
        if (gs.currentZoneId !== undefined) GameState.currentZoneId = gs.currentZoneId;

        // Permettre aux extensions d'appliquer leurs données
        if (this.onApplyData) {
            this.onApplyData(saveData);
        }

        console.log("✅ Save data applied");
    };

    // Méthode de chargement intelligente (Local vs Cloud)
    window.SaveManager.load = async function () {
        const localData = this.getLocal();
        const cloudData = await this.getCloud();

        let finalData = null;
        const localTime = localData ? new Date(localData.savedAt).getTime() : 0;
        const cloudTime = cloudData ? new Date(cloudData.savedAt).getTime() : 0;

        if (localTime >= cloudTime && localData) {
            finalData = localData;
            console.log("📄 Loading from Local storage");
        } else if (cloudData) {
            finalData = cloudData;
            console.log("☁️ Loading from Cloud storage");
            this.saveLocal(cloudData); // Sync local
        }

        if (finalData) {
            this.applyData(finalData);
            return true;
        }

        console.log("🆕 No save found, starting fresh");
        return false;
    };

    console.log("🧪 SaveManager Applier Module Loaded");
})();
