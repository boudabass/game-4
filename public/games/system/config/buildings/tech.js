window.Config = window.Config || {};
window.Config.BUILDING_CATEGORIES = window.Config.BUILDING_CATEGORIES || {};

window.Config.BUILDING_CATEGORIES.tech = {
    reaserchlab: {
        name: "Laboratoire",
        category: "Tech",
        icon: "🧪",
        width: 3, height: 3,
        cost: { wood: 15, iron: 5 },
        slots: 2,
        required_tool: 'toolbox',
        product: { science: 1 },
        insulation: 2,
        description: "Laboratoire de nouvelles technologies et améliorations."
    },
    workshop: {
        name: "Atelier",
        category: "Tech",
        icon: "🧰",
        width: 3, height: 3,
        cost: { wood: 15, iron: 5 },
        slots: 1,
        required_tool: 'toolbox',
        product: { science: 1 },
        insulation: 2,
        description: "Laboratoire de nouvelles technologies et améliorations."
    },
    steam_hub: {
        name: "Foyer de vapeur",
        category: "Tech",
        icon: "🔥",
        width: 1, height: 1,
        cost: { iron: 20 },
        slots: 0,
        product: { heat: 3 },
        insulation: 0,
        upgrade: 'advanced_steam_hub',
        description: "Crée une petite zone chauffée. Consomme 3 charbon/heure."
    },
    advanced_steam_hub: {
        name: "Foyer de vapeur avancé",
        category: "Tech",
        icon: "🔥",
        width: 1, height: 1,
        cost: { iron: 50 },
        slots: 0,
        product: { heat: 7 },
        insulation: 0,
        description: "Crée une grande zone chauffée. Consomme 7 charbon/heure."
    },
    beacon: {
        name: "Balise",
        category: "Tech",
        icon: "📡",
        width: 4, height: 4,
        cost: { wood: 20, iron: 35 },
        slots: 1,
        // required_tool ? Binculars ?
        insulation: 0,
        description: "Permet d’envoyer des éclaireurs pour explorer le monde."
    },
    factory: {
        name: "Usine",
        category: "Tech",
        icon: "🏭",
        width: 4, height: 4,
        cost: { wood: 30, iron: 15, steam_core: 1 },
        slots: 1,
        required_tool: 'toolbox',
        product: { prosteses: 1, automaton: 1 },
        insulation: 2,
        description: "Usine spécialisée dans la production d’automates et dispositifs avancés."
    }
};
