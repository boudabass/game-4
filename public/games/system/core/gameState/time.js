// public/games/system/core/gameState/time.js
// Méthodes de manipulation du temps

(function () {
    if (!window.GameState) return;

    window.GameState.getTimeString = function () {
        return `${this.hour}:${this.minute.toString().padStart(2, '0')}`;
    };

    window.GameState.advanceTime = function (minutes) {
        this.minute += minutes;
        while (this.minute >= 60) {
            this.minute -= 60;
            this.hour++;
        }
        if (this.hour >= 24) {
            this.hour = 0;
            this.day++;
            console.log(`🌅 Jour ${this.day} !`);
        }
    };

    console.log("🕒 GameState Time Module Loaded");
})();
