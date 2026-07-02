window.Config = window.Config || {};
window.Config.ITEM_CATEGORIES = window.Config.ITEM_CATEGORIES || {};

window.Config.ITEM_CATEGORIES.resources = {
    // Ressources principales (City Builder)
    wood: { name: "Bois", icon: "🪵", type: "resource", description: "Matériau de construction de base." },
    coal: { name: "Charbon", icon: "⚫", type: "resource", description: "Combustible pour le générateur." },
    iron: { name: "Métaux", icon: "🏗️", type: "resource", description: "Métal pour structures avancées." }, // Nommé 'iron' dans le code actuel (bâtiments)
    steam_cores: { name: "Noyau", icon: "🔋", type: "resource", description: "Technologie avancée rare." },

    // Nourriture
    raw_food: { name: "Vivres", icon: "🥩", type: "resource" },
    rations: { name: "Rations", icon: "🍲", type: "resource" },

    // Spécial
    prothesis: { name: "Prothèse", icon: "🦾", type: "item", description: "Prothèse pour amputés." },

    // Devises / Energie (Optionnel si géré par GameState, mais utile pour l'affichage unifié)
    gold: { name: "Or", icon: "💰", type: "currency" },
    energy: { name: "Énergie", icon: "⚡", type: "energy" }
};
