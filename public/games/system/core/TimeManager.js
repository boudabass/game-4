// public/games/system/core/TimeManager.js
// Gestionnaire de temps global pour p5.js

window.TimeManager = {
    MINUTES_PER_REAL_SECOND: 1,
    lastCheck: 0,
    isActive: true,

    init: function (config) {
        if (config && config.minutesPerSecond) {
            this.MINUTES_PER_REAL_SECOND = config.minutesPerSecond;
        }
        this.lastCheck = Date.now();
        console.log("⏰ TimeManager initialized");
    },

    update: function () {
        if (!this.isActive) return;

        const now = Date.now();
        if (now - this.lastCheck >= 1000) {
            this.lastCheck = now;
            if (window.GameState && typeof GameState.advanceTime === 'function') {
                GameState.advanceTime(this.MINUTES_PER_REAL_SECOND);
            }
        }
    },

    setSpeed: function (multiplier) {
        this.isActive = (multiplier > 0);
        // On peut imaginer scaler minutesPerSecond par le multiplicateur
        // Mais pour l'instant on garde la logique simple
        console.log("⏰ Vitesse réglée sur : " + multiplier);
    }
};

console.log("⏰ TimeManager Global Loaded");
