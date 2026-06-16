window.Config = window.Config || {};
window.Config.BUILDING_CATEGORIES = window.Config.BUILDING_CATEGORIES || {};

window.Config.BUILDING_CATEGORIES.world = {
    outpost_depot: {
        name: "Dépôt d’avant-poste",
        category: "World",
        icon: "🏕️",
        width: 4, height: 4,
        cost: { wood: 25, iron: 45 },
        insulation: 0,
        description: "Permet de créer une connexion avec un avant-poste éloigné."
    },
    evacuation_centre: {
        name: "Centre d’évacuation",
        category: "World",
        icon: "🚢",
        width: 4, height: 4,
        cost: { wood: 25, iron: 45 },
        staff: {},
        staff_max: 0,
        insulation: 1,
        description: "Permet d’envoyer toute la colonie vers un autre lieu."
    },
    transport_depot: {
        name: "Dépôt de transport",
        category: "World",
        icon: "🚛",
        width: 5, height: 4,
        cost: { wood: 45, iron: 20 },
        insulation: 1,
        description: "Gère l’envoi des ressources vers un autre lieu."
    }
};
