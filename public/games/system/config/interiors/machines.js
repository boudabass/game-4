window.Config = window.Config || {};
window.Config.INTERIOR_ITEMS = window.Config.INTERIOR_ITEMS || {};

window.Config.INTERIOR_ITEMS.machines = [
    {
        id: "sprinkler",
        name: "Arroseur",
        description: "Arrose les 4 carreaux adjacents chaque matin.",
        icon: "🚿",
        category: "farming",
        cost: { copper_bar: 1, iron_bar: 1 },
        source: "Farming Level 2",
        width: 1, height: 1
    },
    {
        id: "quality_sprinkler",
        name: "Arroseur de qualité",
        description: "Arrose les 8 carreaux adjacents chaque matin.",
        icon: "🚿",
        category: "farming",
        cost: { iron_bar: 1, gold_bar: 1, refined_quartz: 1 },
        source: "Farming Level 6",
        width: 1, height: 1
    },
    {
        id: "iridium_sprinkler",
        name: "Arroseur en iridium",
        description: "Arrose les 24 carreaux adjacents chaque matin.",
        icon: "🚿",
        category: "farming",
        cost: { gold_bar: 1, iridium_bar: 1, battery_pack: 1 },
        source: "Farming Level 9",
        width: 1, height: 1
    },
    {
        id: "bee_house",
        name: "Ruche",
        description: "À mettre pour qu’elle produise du miel délicieux !",
        icon: "🐝",
        category: "farming",
        cost: { wood: 40, coal: 8, iron_bar: 1, maple_syrup: 1 },
        source: "Farming Level 3",
        width: 1, height: 1
    },
    {
        id: "loom",
        name: "Métier à tisser",
        description: "Transforme la laine brute en tissu fin.",
        icon: "🧶",
        category: "production",
        cost: { wood: 60, fiber: 30, pine_tar: 1 },
        source: "Farming Level 7",
        width: 2, height: 1
    },
    {
        id: "fish_smoker",
        name: "Fumoir à poisson",
        description: "Crée du poisson fumé (vaut 2x plus).",
        icon: "🐟",
        category: "production",
        cost: { hardwood: 10, sea_jelly: 1, river_jelly: 1, cave_jelly: 1 },
        source: "Poissonnerie (10 000po)",
        width: 1, height: 1
    },
    {
        id: "charcoal_kiln",
        name: "Fourneau à charbon",
        description: "Transforme 10 bois en 1 charbon.",
        icon: "🔥",
        category: "production",
        cost: { wood: 20, gold_bar: 1 },
        source: "Foraging Level 4",
        width: 1, height: 1
    },
    {
        id: "crystalarium",
        name: "Cristalarium",
        description: "Copie les gemmes insérées.",
        icon: "💎",
        category: "production",
        cost: { stone: 99, gold_bar: 5, iridium_bar: 2, battery_pack: 1 },
        source: "Mining Level 9",
        width: 1, height: 1
    },
    {
        id: "furnace",
        name: "Fournaise",
        description: "Fond le minerai en lingots.",
        icon: "🔥",
        category: "production",
        cost: { copper_ore: 20, stone: 25 },
        source: "Clint (Event)",
        width: 1, height: 1
    },
    {
        id: "heavy_furnace",
        name: "Gros Fourneau",
        description: "Fond 5 lingots à la fois.",
        icon: "🌋",
        category: "production",
        cost: { furnace: 2, iron_bar: 3, stone: 50 },
        source: "Mining Mastery",
        width: 2, height: 2
    },
    {
        id: "recycling_machine",
        name: "Machine de recyclage",
        description: "Recycle les déchets.",
        icon: "♻️",
        category: "production",
        cost: { wood: 25, stone: 25, iron_bar: 1 },
        source: "Fishing Level 4",
        width: 1, height: 1
    },
    {
        id: "seed_maker",
        name: "Machine à graines",
        description: "Produit des graines à partir de récoltes.",
        icon: "🌱",
        category: "production",
        cost: { wood: 25, coal: 10, gold_bar: 1 },
        source: "Farming Level 9",
        width: 1, height: 1
    },
    {
        id: "mushroom_log",
        name: "Bûche à champignons",
        description: "Produit des champignons.",
        icon: "🍄",
        category: "production",
        cost: { hardwood: 10, moss: 10 },
        source: "Foraging Level 4",
        width: 2, height: 1
    },
    {
        id: "bait_maker",
        name: "Fabricant d'appâts",
        description: "Crée des appâts spécifiques.",
        icon: "🪱",
        category: "production",
        cost: { iron_bar: 3, coral: 3, sea_urchin: 1 },
        source: "Fishing Level 6",
        width: 1, height: 1
    }
];
