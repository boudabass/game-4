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

    // Assets — dossiers triés (source de vérité : /games/system/assets/catalogue.json)
    assets: {
        groundPath: '/games/system/assets/sol/',
        groundTiles: [
            'town_herbe_centre.png',    // herbe verte unie
            'town_herbe_centre_v2.png', // herbe avec touffes
            'town_herbe_fleurs.png'     // herbe avec fleurs jaunes scintillantes
        ]
    }
});

console.log("⚙️ Config Main Loaded");
