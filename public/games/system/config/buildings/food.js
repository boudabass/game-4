window.Config = window.Config || {};
window.Config.BUILDING_CATEGORIES = window.Config.BUILDING_CATEGORIES || {};

window.Config.BUILDING_CATEGORIES.food = {
    cookhouse: {
        name: "Cuisine",
        category: "Food",
        icon: "🍲",
        width: 4, height: 3,
        cost: { wood: 20 },
        slots: 1,
        product: { ration: 20 },
        consume: { raw_food: 10 },
        insulation: 1,
        upgradeTo: 'restaurant',
        description: "Transforme la nourriture crue en rations."
    },
    restaurant: {
        name: "Restaurant",
        category: "Food",
        icon: "🍽️",
        width: 4, height: 3,
        cost: { wood: 20 },
        slots: 1,
        product: { ration: 20 },
        consume: { raw_food: 10 },
        insulation: 1,
        description: "Transforme la nourriture crue en rations."
    },
    gatherers: {
        name: "Cueilleurs",
        category: "Food",
        icon: "🌾",
        width: 4, height: 4,
        cost: { wood: 20 },
        slots: 1,
        required_tool: 'basket',
        product: { raw_food: 20 },
        insulation: 2,
        requiresZone: "natural",
        description: "Envoie des cueilleurs sur une zone naturelle de ressources."
    },
    fisher: {
        name: "Pêcheurs",
        category: "Food",
        icon: "🐟",
        width: 4, height: 4,
        cost: { wood: 20 },
        slots: 1,
        required_tool: 'fishing_rod',
        product: { raw_food: 20 },
        insulation: 2,
        requiresZone: "water",
        description: "Envoie des cueilleurs sur une zone naturelle de ressources."
    },
    hunters: {
        name: "Chasseurs",
        category: "Food",
        icon: "🏹",
        width: 4, height: 4,
        cost: { wood: 40, iron: 40 },
        slots: 1,
        required_tool: 'bow',
        product: { raw_food: 40 },
        insulation: 3,
        requiresZone: "forest",
        description: "Chasse aérienne fournissant plus de vivres."
    },
    hothouse: {
        name: "Serre",
        category: "Food",
        icon: "🌿",
        width: 4, height: 4,
        cost: { wood: 20, steamCores: 1 },
        slots: 1,
        required_tool: 'watering_can',
        product: { raw_food: 60 },
        insulation: 1,
        upgradeTo: 'industrial_hothouse',
        description: "Cultive des plantes pour obtenir de la nourriture. Donne accès à une zone 4x4."
    },
    industrial_hothouse: {
        name: "Serre industrielle",
        category: "Food",
        icon: "🏭",
        width: 4, height: 4,
        cost: { wood: 20, iron: 35, steamCores: 2 },
        slots: 2,
        required_tool: 'watering_can',
        product: { raw_food: 80 },
        insulation: 2,
        description: "Serre à vapeur efficace. Donne accès à une zone 4x4."
    }
};
