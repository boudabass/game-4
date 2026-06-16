window.Config = window.Config || {};

// Agrégation de tous les bâtiments
window.Config.BUILDINGS = {};

// Cette fonction sera appelée pour fusionner les catégories chargées
window.Config.initBuildings = function () {
    if (window.Config.BUILDING_CATEGORIES) {
        for (const cat in window.Config.BUILDING_CATEGORIES) {
            Object.assign(window.Config.BUILDINGS, window.Config.BUILDING_CATEGORIES[cat]);
        }
    }
    console.log("🏗️ Buildings Initialized:", Object.keys(window.Config.BUILDINGS).length);
};
