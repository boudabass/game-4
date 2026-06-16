// public/games/system/core/gameState/data.js
// Définition des propriétés d'état de base

(function () {
    if (!window.GameState) return;

    // Propriétés par défaut
    const defaults = {
        energy: 100,
        maxEnergy: 100,
        gold: 0,
        day: 1,
        hour: 6,
        minute: 0,
        season: 'SPRING', // SPRING, SUMMER, AUTUMN, WINTER
        currentZoneId: 'default'
    };

    // Mélanger les propriétés dans GameState
    Object.assign(window.GameState, defaults);

    // Ajouter une méthode de reset spécifique aux données
    window.GameState.data = {
        reset: function () {
            Object.assign(window.GameState, defaults);
        }
    };

    console.log("📊 GameState Data Module Loaded");
})();
