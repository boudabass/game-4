window.TimeManager = {
    accumulation: 0,

    update: function () {
        if (GameState.isPaused || GameState.gameSpeed === 0) return;

        // Calcul du multiplicateur de vitesse
        // Vitesse 1 = 60 frames pour 1 min in-game
        // Vitesse 2 = 30 frames
        // Vitesse 3 = 15 frames
        let framesPerMinute = 60;
        if (GameState.gameSpeed === 2) framesPerMinute = 20;
        if (GameState.gameSpeed === 3) framesPerMinute = 5;

        if (frameCount % framesPerMinute === 0) {
            GameState.minute += Config.MINUTES_PER_TICK;

            if (GameState.minute >= 60) {
                GameState.minute = 0;
                GameState.hour++;

                if (GameState.hour >= 24) {
                    GameState.hour = 0;
                    GameState.day++;
                    this.onNewDay();
                }

                this.onNewHour();
            }

            this.updateTimeHUD();
            GameState.updateHUD(); // Pour les ressources
        }
    },

    updateTimeHUD: function () {
        // Mise à jour Horloge
        const clockEl = document.getElementById('clock');
        if (clockEl) {
            const h = GameState.hour.toString().padStart(2, '0');
            const m = GameState.minute.toString().padStart(2, '0');
            clockEl.innerText = `${h}:${m}`;

            // Mode Nuit : Assombrir la top-bar entre 20h et 8h
            const bar = document.getElementById('time-weather-bar');
            if (bar) {
                if (GameState.hour >= 20 || GameState.hour < 8) {
                    bar.style.background = "rgba(5, 8, 15, 0.9)";
                } else {
                    bar.style.background = "var(--ui-bg)";
                }
            }
        }

        // Mise à jour Jour
        const dayEl = document.getElementById('day-counter');
        if (dayEl) dayEl.innerText = `JOUR ${GameState.day}`;

        // Mise à jour Temp au centre de la nouvelle barre (Phase 10 : Gauge Circulaire)
        const tempValEl = document.getElementById('central-temp-val');
        if (tempValEl) {
            tempValEl.innerText = `${GameState.temperature}°`;
            // Code couleur dynamique
            if (GameState.temperature <= -60) tempValEl.style.color = "#a855f7"; // Violet
            else if (GameState.temperature <= -30) tempValEl.style.color = "#3b82f6"; // Bleu vif
            else tempValEl.style.color = "white";
        }
    },

    onNewHour: function () {
        ResourceManager.consume('coal', 1);
    },

    onNewDay: function () {
        console.log("Nouveau jour : " + GameState.day);
        if (GameState.day % 3 === 0) {
            GameState.temperature -= 5;
            this.triggerTempAlert();
        }
        SaveManager.save();
    },

    triggerTempAlert: function () {
        const bar = document.getElementById('time-weather-bar');
        if (bar) {
            bar.style.borderColor = "var(--accent-blue)";
            bar.classList.add('pulse-alert');
            setTimeout(() => bar.classList.remove('pulse-alert'), 3000);
        }
    }
};
