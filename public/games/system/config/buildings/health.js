window.Config = window.Config || {};
window.Config.BUILDING_CATEGORIES = window.Config.BUILDING_CATEGORIES || {};

window.Config.BUILDING_CATEGORIES.health = {
    medical_post: {
        name: "Poste médical",
        category: "Health",
        icon: "⚕️",
        width: 3, height: 3,
        cost: { wood: 25 },
        staff: { engineers: 5 },
        staff_max: 5,
        product: { health: 4 },
        capacity: 5,
        insulation: 1,
        upgradeTo: 'hospital',
        description: "Soins médicaux basiques pour les malades."
    },
    hospital: {
        name: "Hôpital",
        category: "Health",
        icon: "🏥",
        width: 4, height: 4,
        cost: { wood: 30, iron: 20, steamCores: 1 },
        staff: { engineers: 10 },
        staff_max: 10,
        product: { health: 8 },
        capacity: 10,
        insulation: 2,
        description: "Traite les malades rapidement et en sécurité."
    },
    care_house: {
        name: "Maison de repos",
        category: "Health",
        icon: "🛏️",
        width: 3, height: 3,
        cost: { wood: 25, iron: 5 },
        product: { health: 1 },
        capacity: 20,
        insulation: 2,
        upgradeTo: 'house_of_healing',
        description: "Accueille les amputés et les malades graves."
    },
    house_of_healing: {
        name: "Maison de soins",
        category: "Health",
        icon: "⛪",
        width: 4, height: 3,
        cost: { wood: 35, iron: 10 },
        staff: { workers: 10, engineers: 10, children: 10 },
        staff_max: 10,
        product: { health: 2 },
        capacity: 10,
        insulation: 2,
        description: "Centre de soins religieux pour les malades."
    }
};
