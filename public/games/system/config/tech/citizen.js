// public/games/system/config/tech/citizen.js
// Configuration de l'arbre technologique pour l'onglet Citoyen

window.Config = window.Config || {};
window.Config.TECH_TREES = window.Config.TECH_TREES || {};

window.Config.TECH_TREES.citizen = {
    name: "Citoyen",
    icon: "👥",
    // Mapping vers la catégorie UI du panneau tech
    uiCategory: "people",

    chains: [
        {
            id: "housing",
            name: "Logement",
            description: "Amélioration des habitations pour vos citoyens",
            levels: ['tent', 'bunkhouse', 'house']
        }
        // Futures chaînes à ajouter ici:
        // {
        //     id: "child_care",
        //     name: "Garde d'enfants",
        //     description: "Structures pour la protection des enfants",
        //     levels: ['child_shelter', ...]
        // }
    ]
};
