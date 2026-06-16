// public/games/system/config/tech/food.js
// Configuration de l'arbre technologique pour l'onglet Alimentation

window.Config = window.Config || {};
window.Config.TECH_TREES = window.Config.TECH_TREES || {};

window.Config.TECH_TREES.food = {
    name: "Alimentation",
    icon: "🍲",
    uiCategory: "food",
    chains: [
        {
            id: "processing",
            name: "Transformation",
            description: "Transforme les ressources brutes en repas",
            levels: ['cookhouse', 'restaurant']
        },
        {
            id: "gathering",
            name: "Collecte de base",
            description: "Récolte de nourriture dans la nature",
            levels: ['gatherers', 'hunters']
        }
    ]
};
