// public/games/system/config/tech/farming.js
// Configuration de l'arbre technologique pour l'onglet Jardinnage

window.Config = window.Config || {};
window.Config.TECH_TREES = window.Config.TECH_TREES || {};

window.Config.TECH_TREES.farming = {
    name: "Jardinage",
    icon: "🌿",
    // Mapping vers la catégorie UI du panneau tech
    uiCategory: "farming",

    chains: [
        {
            id: "hothouse",
            name: "Serres",
            description: "Culture de plantes en intérieur",
            levels: ['hothouse', 'industrial_hothouse']
        }
    ]
};
