window.SaveManager = {
    SAVE_KEY: 'elsass-frost-save',

    save: function () {
        const data = {
            coal: GameState.coal,
            wood: GameState.wood,
            food: GameState.food,
            hope: GameState.hope,
            discontent: GameState.discontent,
            day: GameState.day,
            hour: GameState.hour,
            minute: GameState.minute,
            temperature: GameState.temperature,
            savedAt: new Date().toISOString()
        };

        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
            console.log("✅ Sauvegarde effectuée.");
            return true;
        } catch (e) {
            console.error("Erreur sauvegarde:", e);
            return false;
        }
    },

    load: function () {
        const json = localStorage.getItem(this.SAVE_KEY);
        if (json) {
            try {
                const data = JSON.parse(json);
                // Restaurer les valeurs
                if (data.coal !== undefined) GameState.coal = data.coal;
                if (data.wood !== undefined) GameState.wood = data.wood;
                if (data.food !== undefined) GameState.food = data.food;
                if (data.hope !== undefined) GameState.hope = data.hope;
                if (data.discontent !== undefined) GameState.discontent = data.discontent;

                if (data.day !== undefined) GameState.day = data.day;
                if (data.hour !== undefined) GameState.hour = data.hour;
                if (data.minute !== undefined) GameState.minute = data.minute;
                if (data.temperature !== undefined) GameState.temperature = data.temperature;

                console.log("✅ Chargement terminé.");
                GameState.updateHUD();
                return true;
            } catch (e) {
                console.error("Erreur chargement:", e);
            }
        }
        return false;
    }
};
