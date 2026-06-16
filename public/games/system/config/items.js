window.Config = window.Config || {};

// Agrégation de tous les items
window.Config.ITEM_DEFINITIONS = {};

// Cette fonction sera appelée pour fusionner les catégories chargées
window.Config.initItems = function () {
    if (window.Config.ITEM_CATEGORIES) {
        for (const cat in window.Config.ITEM_CATEGORIES) {
            Object.assign(window.Config.ITEM_DEFINITIONS, window.Config.ITEM_CATEGORIES[cat]);
        }
    }
    console.log("📦 Items Initialized:", Object.keys(window.Config.ITEM_DEFINITIONS).length);
};
