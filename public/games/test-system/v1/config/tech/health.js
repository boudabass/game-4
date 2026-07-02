// public/games/system/config/tech/health.js
// Configuration de l'arbre technologique pour l'onglet Santé

window.Config = window.Config || {};
window.Config.TECH_TREES = window.Config.TECH_TREES || {};

window.Config.TECH_TREES.health = {
    name: "Santé",
    icon: "🏥",
    uiCategory: "health",
    chains: [
        {
            id: "medical",
            name: "Soins Médicaux",
            description: "Traite les malades et les blessés",
            levels: ['medical_post', 'hospital']
        },
        {
            id: "care",
            name: "Convalescence",
            description: "Hébergement pour les malades de longue durée",
            levels: ['care_house', 'house_of_healing']
        }
    ]
};
