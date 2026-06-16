// public/games/system/config/tech/infrastructure.js
// Configuration de l'arbre technologique pour l'onglet Infrastructure

window.Config = window.Config || {};
window.Config.TECH_TREES = window.Config.TECH_TREES || {};

window.Config.TECH_TREES.infrastructure = {
    name: "Infrastructure",
    icon: "🏗️",
    // Mapping vers la catégorie UI du panneau tech
    uiCategory: "infrastructure",

    chains: [
        {
            id: "storage",
            name: "Stockage",
            description: "Dépôts de ressources",
            levels: ['resource_depot', 'large_resource_depot']
        },
        {
            id: "research",
            name: "Recherche",
            description: "Laboratoires de recherche",
            levels: ['workshop', 'reaserchlab']
        },
        {
            id: "steam",
            name: "Vapeur",
            description: "Distribution de chaleur",
            levels: ['steam_hub', 'advanced_steam_hub']
        }
    ]
};
