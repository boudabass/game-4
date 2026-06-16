window.Config.TECH_TREES.resource = {
    name: "Ressources",
    icon: "⛏️",
    // Mapping vers la catégorie UI du panneau tech
    uiCategory: "resource",

    chains: [
        {
            id: "coal_surface",
            name: "Collecte Charbon",
            description: "Extracteurs de surface pour le charbon",
            levels: ['coal_thumper', 'steam_coal_thumper']
        },
        {
            id: "wood_surface",
            name: "Collecte Bois",
            description: "Scieries et collecte de bois de surface",
            levels: ['sawmill', 'steam_sawmill']
        },
        {
            id: "steel_surface",
            name: "Collecte Acier",
            description: "Extracteurs de surface pour le fer/acier",
            levels: ['steel_thumper', 'steam_steel_thumper']
        }
    ]
};
