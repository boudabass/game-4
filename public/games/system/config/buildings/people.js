window.Config = window.Config || {};
window.Config.BUILDING_CATEGORIES = window.Config.BUILDING_CATEGORIES || {};

window.Config.BUILDING_CATEGORIES.people = {
    tent: {
        name: "Tente",
        category: "People",
        icon: "⛺",
        width: 2, height: 2,
        cost: { wood: 10 },
        capacity: 10,
        insulation: 1,
        upgrade: "bunkhouse",
        description: "Abri basique pour citoyens."
    },
    bunkhouse: {
        name: "Baraquement",
        category: "People",
        icon: "🏠",
        width: 2, height: 2,
        cost: { wood: 20, iron: 10 },
        capacity: 10,
        insulation: 2,
        upgrade: "house",
        description: "Logement mieux isolé."
    },
    house: {
        name: "Maison",
        category: "People",
        icon: "🏡",
        width: 2, height: 2,
        cost: { wood: 35, iron: 25 },
        capacity: 10,
        insulation: 3,
        description: "Habitat confortable et chaud."
    },
    child_shelter: {
        name: "Refuge pour enfants",
        category: "People",
        icon: "👶",
        width: 3, height: 3,
        cost: { wood: 20, iron: 5 },
        capacity: 15,
        insulation: 2,
        description: "Protège les enfants durant la journée."
    }
};
