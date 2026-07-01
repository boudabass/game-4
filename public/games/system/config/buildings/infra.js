window.Config = window.Config || {};
window.Config.BUILDING_CATEGORIES = window.Config.BUILDING_CATEGORIES || {};

window.Config.BUILDING_CATEGORIES.infra = {
    road: {
        name: "Route",
        category: "infra",
        icon: "🟫",
        width: 1, height: 1,
        cost: { wood: 1 },
        description: "Connecte les bâtiments.",
        hidden: true
    },
    pub: {
        name: "Pub",
        category: "infra",
        icon: "🍺",
        width: 3, height: 3,
        cost: { wood: 20, iron: 10 },
        product: { hope: 2, discontent: -2 },
        capacity: 10,
        insulation: 2,
        description: "Lieu de détente et de réconfort."
    },
    fighting_arena: {
        name: "Arène de combat",
        category: "infra",
        icon: "🥊",
        width: 3, height: 3,
        cost: { wood: 15 },
        product: { hope: 1, discontent: -1 },
        capacity: 10,
        insulation: 1,
        description: "Organise des combats pour calmer les esprits."
    },
    administration: {
        name: "Administration",
        category: "infra",
        icon: "🏛️",
        width: 4, height: 4,
        cost: { wood: 25, iron: 15 },
        capacity: 10,
        insulation: 1,
        description: "Centre de gestion et de communication."
    }
};
