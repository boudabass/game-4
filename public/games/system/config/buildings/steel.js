window.Config = window.Config || {};
window.Config.BUILDING_CATEGORIES = window.Config.BUILDING_CATEGORIES || {};

window.Config.BUILDING_CATEGORIES.steel = {
    steel_thumper: {
        name: "Extracteur d'acier",
        category: "Steel",
        icon: "⛏️",
        width: 2, height: 2,
        cost: { wood: 15 },
        slots: 1,
        required_tool: 'pickaxe',
        product: { coal: 10 },
        insulation: 1,
        upgradeTo: 'steam_steel_thumper',
        requiresZone: 'steel_stack',
        description: "extrait le fer."
    },
    steam_steel_thumper: {
        name: "Extracteur d'acier à vapeur",
        category: "Steel",
        icon: "🌋",
        width: 2, height: 2,
        cost: { wood: 35, iron: 25 },
        slots: 2,
        required_tool: 'pickaxe',
        product: { coal: 30 },
        insulation: 2,
        requiresZone: 'steel_stack',
        description: "extrait le fer avec vapeur."
    },
    steelworks: {
        name: "Fonderie d'acier",
        category: "Steel",
        icon: "⚒️",
        width: 4, height: 4,
        cost: { wood: 25 },
        slots: 1,
        required_tool: 'sieve',
        product: { iron: 1 },
        insulation: 1,
        description: "Extrait et traite le minerai."
    },
    steam_steelworks: {
        name: "Fonderie d'acier à vapeur",
        category: "Steel",
        icon: "🏭",
        width: 4, height: 4,
        cost: { wood: 40, iron: 15 },
        slots: 2,
        required_tool: 'sieve',
        product: { iron: 2 },
        insulation: 2,
        description: "Fonderie plus efficace à vapeur."
    },
    advanced_steelworks: {
        name: "Fonderie d'acier avancée",
        category: "Steel",
        icon: "⚙️",
        width: 4, height: 4,
        cost: { wood: 80, iron: 40 },
        slots: 3,
        required_tool: 'sieve', // Ou auto ?
        product: { iron: 3 },
        insulation: 3,
        description: "Fonderie moderne à haut rendement."
    }
};
