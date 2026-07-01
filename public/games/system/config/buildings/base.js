window.Config = window.Config || {};
window.Config.BUILDING_CATEGORIES = window.Config.BUILDING_CATEGORIES || {};

window.Config.BUILDING_CATEGORIES.base = {
    generator: {
        name: "Générateur",
        category: "base",
        icon: "🔥",
        width: 3, height: 3,
        cost: { iron: 50 },
        product: { heat: 4 },
        consume: { coal: 10 },
        description: "Le cœur de la ville.",
        isUnique: true,
        hidden: true // Hidden from construction menu by default
    }
};
