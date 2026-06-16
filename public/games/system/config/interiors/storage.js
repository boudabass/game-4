window.Config = window.Config || {};
window.Config.INTERIOR_ITEMS = window.Config.INTERIOR_ITEMS || {};

window.Config.INTERIOR_ITEMS.storage = [
    {
        id: "chest",
        name: "Coffre",
        description: "Stockage standard.",
        icon: "🧰",
        category: "storage",
        cost: { wood: 50 },
        source: "Start",
        width: 1, height: 1
    },
    {
        id: "stone_chest",
        name: "Coffre en pierre",
        description: "Stockage en pierre.",
        icon: "🧰",
        category: "storage",
        cost: { stone: 50 },
        source: "Robin Quest",
        width: 1, height: 1
    },
    {
        id: "big_chest",
        name: "Grand coffre",
        description: "Double capacité.",
        icon: "🧰",
        category: "storage",
        cost: { wood: 120, copper_bar: 2 },
        source: "Shop (5000g)",
        width: 1, height: 1
    },
    {
        id: "big_stone_chest",
        name: "Grand coffre en pierre",
        description: "Double capacité en pierre.",
        icon: "🧰",
        category: "storage",
        cost: { stone: 250 },
        source: "Dwarf (5000g)",
        width: 1, height: 1
    }
];
