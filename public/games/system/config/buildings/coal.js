window.Config = window.Config || {};
window.Config.BUILDING_CATEGORIES = window.Config.BUILDING_CATEGORIES || {};

window.Config.BUILDING_CATEGORIES.coal = {
    coal_thumper: {
        name: "Extracteur de charbon",
        category: "Coal",
        icon: "⚒️",
        width: 2, height: 2,
        cost: { wood: 15 },
        slots: 1,
        required_tool: 'pickaxe',
        product: { coal: 10 },
        insulation: 1,
        upgradeTo: 'steam_coal_thumper',
        requiresZone: 'coal_stack',
        description: "Pompe le charbon du sol."
    },
    steam_coal_thumper: {
        name: "Extracteur de charbon à vapeur",
        category: "Coal",
        icon: "🌋",
        width: 2, height: 2,
        cost: { wood: 35, iron: 25 },
        slots: 2,
        required_tool: 'pickaxe',
        product: { coal: 30 },
        insulation: 2,
        requiresZone: 'coal_stack',
        description: "Pompe du charbon avec vapeur."
    },
    coal_mine: {
        name: "Mine de charbon",
        category: "Coal",
        icon: "⛏️",
        width: 5, height: 5,
        cost: { wood: 25, iron: 10, steamCores: 1 },
        slots: 2,
        required_tool: 'pickaxe',
        product: { coal: 6 },
        insulation: 1,
        upgradeTo: 'steam_coal_mine',
        requiresZone: 'coal_wall',
        description: "Extrait du charbon du sol."
    },
    steam_coal_mine: {
        name: "Mine de charbon à vapeur",
        category: "Coal",
        icon: "🏗️",
        width: 5, height: 5,
        cost: { wood: 25, iron: 40, steamCores: 2 },
        slots: 2,
        required_tool: 'pickaxe',
        product: { coal: 12 },
        insulation: 2,
        upgradeTo: 'advanced_coal_mine',
        requiresZone: 'coal_wall',
        description: "Mine de charbon sous vapeur."
    },
    advanced_coal_mine: {
        name: "Mine de charbon avancée",
        category: "Coal",
        icon: "⚙️",
        width: 5, height: 5,
        cost: { wood: 40, iron: 80, steamCores: 3 },
        slots: 3,
        required_tool: 'pickaxe',
        product: { coal: 20 },
        insulation: 3,
        requiresZone: 'coal_wall',
        description: "Extraction rapide du charbon."
    },
    charcoal_kiln: {
        name: "Four à charbon",
        category: "Coal",
        icon: "🔥",
        width: 3, height: 3,
        cost: { wood: 30, iron: 30 },
        slots: 1,
        required_tool: 'pickaxe',
        product: { coal: 1 },
        consume: { wood: 1 },
        insulation: 2,
        description: "Transforme le bois en charbon."
    }
};
