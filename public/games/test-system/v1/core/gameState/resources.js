// public/games/system/core/gameState/resources.js
// Logique de gestion de l'énergie et de l'or

(function () {
    if (!window.GameState) return;

    window.GameState.spendEnergy = function (amount) {
        if (this.energy >= amount) {
            this.energy -= amount;
            return true;
        }
        return false;
    };

    window.GameState.restoreEnergy = function (amount) {
        this.energy = Math.min(this.energy + amount, this.maxEnergy);
    };

    window.GameState.hasResources = function (costs) {
        if (!costs) return true;
        for (let res in costs) {
            if ((this[res] || 0) < costs[res]) return false;
        }
        return true;
    };

    window.GameState.consumeResources = function (costs) {
        if (!costs) return;
        for (let res in costs) {
            this[res] = (this[res] || 0) - costs[res];
        }
    };

    window.GameState.addResources = function (resources) {
        if (!resources) return;
        for (let res in resources) {
            this[res] = (this[res] || 0) + resources[res];
        }
    };

    console.log("💰 GameState Resources Module Loaded (with Generic Support)");
})();
