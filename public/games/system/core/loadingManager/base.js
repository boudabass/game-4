// public/games/system/core/loadingManager/base.js
// Gestion de la progression du chargement

(function () {
    console.log("⌚ LoadingManager System Initializing...");

    window.LoadingManager = {
        totalSteps: 10,
        currentStep: 0,
        history: [],

        init: function (total) {
            this.totalSteps = total || 10;
            this.currentStep = 0;
            this.history = [];
        },

        advanceStep: function (message) {
            this.currentStep++;
            if (message) {
                this.history.push(message);
                console.log(`[Loading] ${message} (${this.getPercentage()}%)`);
            }
            if (this.onUpdate) this.onUpdate();
        },

        getPercentage: function () {
            return Math.floor((this.currentStep / this.totalSteps) * 100);
        }
    };
})();
