window.Config = window.Config || {};
window.Config.INTERIOR_ITEMS = window.Config.INTERIOR_ITEMS || {};

window.Config.INTERIOR_ITEMS.decoration = [
    { id: "wood_floor", name: "Parquet", cost: { wood: 1 }, icon: "🪵" },
    { id: "rustic_plank_floor", name: "Sol de planches", cost: { wood: 1 }, icon: "🪵" },
    { id: "straw_floor", name: "Sol de paille", cost: { wood: 1, fiber: 1 }, icon: "🌾" },
    { id: "weathered_floor", name: "Sol patiné", cost: { wood: 1 }, icon: "🏚️" },
    { id: "crystal_floor", name: "Sol cristal", cost: { refined_quartz: 1 }, icon: "🔮" },
    { id: "stone_floor", name: "Sol pierre", cost: { stone: 1 }, icon: "🪨" },
    { id: "stone_walkway_floor", name: "Promenade pierre", cost: { stone: 1 }, icon: "🛤️" },
    { id: "brick_floor", name: "Sol brique", cost: { clay: 2, stone: 5 }, output: 5, icon: "🧱" },
    { id: "wood_path", name: "Chemin bois", cost: { wood: 1 }, icon: "🪵" },
    { id: "gravel_path", name: "Chemin gravier", cost: { stone: 1 }, icon: "🌑" },
    { id: "cobblestone_path", name: "Chemin pavé", cost: { stone: 1 }, icon: "🌑" },
    { id: "stepping_stone_path", name: "Pas japonais", cost: { stone: 1 }, icon: "🌑" },
    { id: "crystal_path", name: "Chemin cristal", cost: { refined_quartz: 1 }, icon: "🔮" }
];

// Add default size for decoration (usually 1x1 floor)
window.Config.INTERIOR_ITEMS.decoration.forEach(item => {
    item.category = "decoration";
    item.width = 1;
    item.height = 1;
    item.isFloor = true; // Special flag for flooring
});
