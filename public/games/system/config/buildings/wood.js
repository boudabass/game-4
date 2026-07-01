window.Config = window.Config || {};
window.Config.BUILDING_CATEGORIES = window.Config.BUILDING_CATEGORIES || {};

window.Config.BUILDING_CATEGORIES.wood = {
    sawmill: {
        name: "Scierie",
        category: "Wood",
        icon: "🪚",
        width: 2, height: 2,
        cost: { wood: 10 },
        slots: 1,
        required_tool: 'axe',
        product: { wood: 1 },
        insulation: 1,
        upgrade: 'steam_sawmill',
        requiresZone: 'wood_stack',
        description: "Transforme les arbres gelés en bois utilisable."
    },
    steam_sawmill: {
        name: "Scierie à vapeur",
        category: "Wood",
        icon: "🪚",
        width: 2, height: 2,
        cost: { wood: 25, iron: 40 },
        slots: 2,
        required_tool: 'axe',
        product: { wood: 2 },
        insulation: 2,
        requiresZone: 'wood_stack',
        description: "Version améliorée de la scierie, plus efficace."
    },
    wall_drill: {
        name: "Foreuse murale",
        category: "Wood",
        icon: "🧱",
        width: 5, height: 5,
        cost: { wood: 20, steamCores: 1 },
        slots: 1,
        required_tool: 'axe', // Ou pickaxe? Axe pour bois.
        product: { wood: 3 },
        insulation: 1,
        upgrade: 'steam_wall_drill',
        requiresZone: 'wood_wall',
        description: "Foreuse creusant les murs gelés pour extraire du bois."
    },
    steam_wall_drill: {
        name: "Foreuse murale à vapeur",
        category: "Wood",
        icon: "🏗️",
        width: 5, height: 5,
        cost: { wood: 20, iron: 40, steamCores: 2 },
        slots: 2,
        required_tool: 'axe',
        product: { wood: 4 },
        insulation: 2,
        requiresZone: 'wood_wall',
        upgrade: 'advanced_wall_drill',
        description: "Utilise la vapeur pour forer plus vite et plus profondément."
    },
    advanced_wall_drill: {
        name: "Foreuse murale avancée",
        category: "Wood",
        icon: "⚙️",
        width: 5, height: 5,
        cost: { wood: 40, iron: 80, steamCores: 3 },
        slots: 3,
        required_tool: 'axe',
        product: { wood: 5 },
        insulation: 3,
        require_zone: 'wood_wall',
        description: "Foreuse de pointe exploitant les murs gelés plus efficacement."
    }
};
