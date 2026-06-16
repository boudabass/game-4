// public/games/system/config/tech/industry.js
// Configuration de l'arbre technologique pour l'onglet Industrie

window.Config = window.Config || {};
window.Config.TECH_TREES = window.Config.TECH_TREES || {};

window.Config.TECH_TREES.industry = {
    name: "Industrie",
    icon: "🏭",
    // Mapping vers la catégorie UI du panneau tech
    uiCategory: "industry",

    chains: [
        {
            id: "coal_mining",
            name: "Mines de Charbon",
            description: "Extractions profondes de charbon",
            levels: ['coal_mine', 'steam_coal_mine', 'advanced_coal_mine']
        },
        {
            id: "wood_drilling",
            name: "Forage de Bois",
            description: "Foreuses de parois pour le bois",
            levels: ['wall_drill', 'steam_wall_drill', 'advanced_wall_drill']
        },
        {
            id: "steel_industry",
            name: "Fonderies d'Acier",
            description: "Transformation avancée de l'acier",
            levels: ['steelworks', 'steam_steelworks', 'advanced_steelworks']
        }
    ]
};
