// core/TimeManager.js
// Gestion du temps, jour/nuit et saisons

window.TimeManager = {
    // Constantes
    MINUTES_PER_REAL_SECOND: 1,  // 1 seconde réelle = 1 minute en jeu
    MAX_HOUR: 24,

    // États des périodes
    PERIODS: {
        MORNING: { start: 6, end: 8, name: 'Matin' },
        DAY: { start: 8, end: 18, name: 'Jour' },
        EVENING: { start: 18, end: 20, name: 'Soir' },
        NIGHT: { start: 20, end: 6, name: 'Nuit' }
    },

    // Saisons
    SEASONS: ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'],
    DAYS_PER_SEASON: 28,

    // Retourne la période actuelle
    getCurrentPeriod: function () {
        const hour = GameState.hour;
        if (hour >= 6 && hour < 8) return this.PERIODS.MORNING;
        if (hour >= 8 && hour < 18) return this.PERIODS.DAY;
        if (hour >= 18 && hour < 20) return this.PERIODS.EVENING;
        return this.PERIODS.NIGHT;
    },

    // Vérifie si c'est la nuit
    isNight: function () {
        const hour = GameState.hour;
        return hour >= 20 || hour < 6;
    },

    // Avance le temps de X minutes
    advanceMinutes: function (minutes) {
        GameState.minute += minutes;

        while (GameState.minute >= 60) {
            GameState.minute -= 60;
            GameState.hour++;

            if (GameState.hour >= this.MAX_HOUR) {
                this.advanceDay();
            }
        }

        // Mettre à jour le HUD
        if (window.refreshHUD) window.refreshHUD();
    },

    // Passe au jour suivant
    advanceDay: function () {
        // Déclencher la croissance des plantes AVANT de reset l'heure
        if (window.GridSystem) {
            GridSystem.processNightCycle();
        }

        GameState.hour = 6;
        GameState.minute = 0;
        GameState.day++;

        // Vérifier changement de saison
        if (GameState.day > this.DAYS_PER_SEASON) {
            this.advanceSeason();
        }

        console.log(`🌅 Nouveau jour: Jour ${GameState.day} - ${GameState.season}`);

        // Refresh HUD explicitement pour le jour
        if (window.refreshHUD) window.refreshHUD();
    },

    // Passe à la saison suivante
    advanceSeason: function () {
        GameState.day = 1;
        const currentIndex = this.SEASONS.indexOf(GameState.season);
        const nextIndex = (currentIndex + 1) % this.SEASONS.length;
        GameState.season = this.SEASONS[nextIndex];

        console.log(`🍂 Nouvelle saison: ${GameState.season}`);
    },

    // Simule le sommeil (+8 heures)
    sleep: function () {
        console.log("💤 Repos...");
        GameState.restoreEnergy(GameState.maxEnergy);
        this.advanceMinutes(8 * 60); // +8 heures

        // Sauvegarder automatiquement
        if (window.SaveManager) {
            SaveManager.save();
        }
    }
};

console.log("✅ TimeManager.js chargé");
