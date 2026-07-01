// public/games/system/config/tech/exploration.js
// Configuration de l'arbre technologique pour l'onglet Exploration

window.Config = window.Config || {};
window.Config.TECH_TREES = window.Config.TECH_TREES || {};

window.Config.TECH_TREES.exploration = {
    name: "Exploration",
    icon: "🧭",
    // Mapping vers la catégorie UI du panneau tech
    uiCategory: "exploration",

    chains: [
        {
            id: "base",
            name: "Base de départ",
            description: "Bâtiments essentiels pour l'exploration",
            levels: ['beacon']
        },
        {
            id: "outpost",
            name: "Avant-poste",
            description: "Établissement de postes extérieurs",
            levels: ['outpost_depot', 'evacuation_centre', 'transport_depot']
        }
    ]
};
