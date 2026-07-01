window.Config = window.Config || {};
window.Config.BUILDING_CATEGORIES = window.Config.BUILDING_CATEGORIES || {};

window.Config.BUILDING_CATEGORIES.resources = {
    resource_depot: {
        name: "Dépôt",
        category: "Storage",
        icon: "📦",
        width: 3, height: 3,
        cost: { wood: 40, iron: 20 },
        capacity: 1000,
        insulation: 0,
        description: "Stocke les ressources de la ville."
    },
    large_resource_depot: {
        name: "Grand dépôt",
        category: "Storage",
        icon: "🏣",
        width: 4, height: 4,
        cost: { wood: 150, iron: 75 },
        capacity: 4000,
        insulation: 0,
        description: "Stockage de ressources augmenté."
    }
};
