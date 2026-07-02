// public/games/system/config/main.js
// Paramètres globaux du système

window.Config = window.Config || {};

// Fusionner les paramètres globaux
Object.assign(window.Config, {
    DEBUG_MODE: true,
    showGrid: true,

    // Grille et Tuiles
    GRID_SIZE: 40,
    TILE_SIZE: 40,

    // Temps
    START_DAY: 1,
    START_HOUR: 8,
    MINUTES_PER_TICK: 1,

    // Caméra (Valeurs par défaut)
    zoom: {
        min: 0.5,
        max: 3.0,
        start: 1.0,
        sensitivity: 0.001
    },

    // Assets
    assets: {
        groundPath: '/games/system/assets/ground/',
        groundPrefix: 'FieldsTile_',
        groundCount: 64
    }
});

console.log("⚙️ Config Main Loaded");
