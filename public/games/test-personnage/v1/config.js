window.Config = {
    // Ressources Initiales
    INITIAL_COAL: 1000,
    INITIAL_WOOD: 1000,
    INITIAL_IRON: 1000,
    INITIAL_STEAM_CORES: 5,
    INITIAL_RAW_FOOD: 1000,
    INITIAL_FOOD_RATIONS: 500,
    INITIAL_PROSTHESES: 0,

    // Paramètres de Morale
    INITIAL_HOPE: 50, // %
    INITIAL_DISCONTENT: 10, // %

    // Temps
    START_DAY: 1,
    START_HOUR: 8,
    MINUTES_PER_TICK: 1,

    // Limites
    MAX_RESOURCE: 9999,

    // Grille (v1.1 : 40x40)
    GRID_SIZE: 40,
    TILE_SIZE: 40, // Cellules plus petites pour la nouvelle échelle

    // Bâtiments
    BUILDINGS: {
        // --- CENTRAL ---
        generator: {
            name: "Générateur",
            category: "Tech",
            icon: "🔥",
            width: 3, height: 3,
            cost: { iron: 50 },
            product: { heat: 4 },
            consume: { coal: 10 },
            description: "Le cœur de la ville.",
            isUnique: true
        },

        // --- POPULATION (2x2) ---
        tent: {
            name: "Tente",
            category: "People",
            icon: "⛺",
            width: 2, height: 2,
            cost: { wood: 10 },
            capacity: 10,
            insulation: 1,
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
        },
        cemetery: {
            name: "Cimetière",
            category: "People",
            icon: "⚰️",
            width: 2, height: 2,
            cost: { wood: 10 },
            capacity: 10,
            insulation: 1,
            description: "Lieu pour enterrer les morts dignement."
        },
        pub: {
            name: "Pub",
            category: "People",
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
            category: "People",
            icon: "🥊",
            width: 2, height: 2,
            cost: { wood: 15 },
            product: { hope: 1, discontent: -1 },
            capacity: 10,
            insulation: 1,
            description: "Organise des combats pour calmer les esprits."
        },
        administration: {
            name: "Administration",
            category: "People",
            icon: "🏛️",
            width: 3, height: 3,
            cost: { wood: 25, iron: 15 },
            capacity: 10,
            insulation: 1,
            description: "Centre de gestion et de communication."
        },

        // --- SANTÉ (2x2, 3x3, 3x2) ---
        medical_post: {
            name: "Poste médical",
            category: "Health",
            icon: "⚕️",
            width: 2, height: 2,
            cost: { wood: 25 },
            staff: { engineers: 5 },
            staff_max: 5,
            product: { health: 4 },
            capacity: 5,
            insulation: 1,
            description: "Soins médicaux basiques pour les malades."
        },
        hospital: {
            name: "Hôpital",
            category: "Health",
            icon: "🏥",
            width: 3, height: 3,
            cost: { wood: 30, iron: 20, steamCores: 1 },
            staff: { engineers: 10 },
            staff_max: 10,
            product: { health: 8 },
            capacity: 10,
            insulation: 2,
            description: "Traite les malades rapidement et en sécurité."
        },
        house_of_healing: {
            name: "Maison de soins",
            category: "Health",
            icon: "⛪",
            width: 3, height: 2,
            cost: { wood: 35, iron: 10 },
            staff: { workers: 10, engineers: 10, children: 10 },
            staff_max: 10,
            product: { health: 2 },
            capacity: 10,
            insulation: 2,
            description: "Centre de soins religieux pour les malades."
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
            description: "Accueille les amputés et les malades graves."
        },

        // --- NOURRITURE (3x2) ---
        cookhouse: {
            name: "Cuisine",
            category: "Food",
            icon: "🍲",
            width: 3, height: 2,
            cost: { wood: 20 },
            staff: { workers: 5, engineers: 5, children: 5 },
            staff_max: 5,
            product: { ration: 20 },
            consume: { food: 10 },
            insulation: 1,
            description: "Transforme la nourriture crue en rations."
        },
        gatherers: {
            name: "Cueilleurs",
            category: "Food",
            icon: "🌾",
            width: 3, height: 2,
            cost: { wood: 20 },
            staff: { workers: 15 },
            staff_max: 15,
            product: { food: 20 },
            insulation: 2,
            description: "Envoie des chasseurs ramener de la nourriture."
        },
        hunters: {
            name: "Chasseurs",
            category: "Food",
            icon: "🏹",
            width: 3, height: 2,
            cost: { wood: 40, iron: 40 },
            staff: { workers: 15 },
            staff_max: 15,
            product: { food: 40 },
            insulation: 3,
            description: "Chasse aérienne fournissant plus de vivres."
        },
        hothouse: {
            name: "Serre",
            category: "Food",
            icon: "🌿",
            width: 3, height: 2,
            cost: { wood: 20, steamCores: 1 },
            staff: { workers: 10, engineers: 10, children: 10 },
            staff_max: 10,
            product: { ration: 60 },
            insulation: 1,
            description: "Cultive des plantes pour obtenir de la nourriture."
        },
        industrial_hothouse: {
            name: "Serre industrielle",
            category: "Food",
            icon: "🏭",
            width: 3, height: 2,
            cost: { wood: 20, iron: 35, steamCores: 2 },
            staff: { workers: 10, engineers: 10, children: 10 },
            staff_max: 10,
            product: { ration: 80 },
            insulation: 2,
            description: "Serre à vapeur efficace pour la production alimentaire."
        },

        // --- RESSOURCES ---
        resource_depot: {
            name: "Dépôt",
            category: "Storage",
            icon: "📦",
            width: 2, height: 2,
            cost: { wood: 40, iron: 20 },
            capacity: 1000,
            insulation: 0,
            description: "Stocke les ressources de la ville."
        },
        large_resource_depot: {
            name: "Grand dépôt",
            category: "Storage",
            icon: "🏗️",
            width: 3, height: 3,
            cost: { wood: 150, iron: 75 },
            capacity: 4000,
            insulation: 0,
            description: "Stockage de ressources augmenté."
        },
        gathering_post: {
            name: "Poste de collecte",
            category: "Storage",
            icon: "🪵",
            width: 2, height: 2,
            cost: { wood: 15, iron: 5 },
            staff: { workers: 10, engineers: 10 },
            staff_max: 10,
            product: { wood: 2, iron: 1, coal: 3 },
            capacity: 100,
            insulation: 1,
            description: "Regroupe les ressources à proximité."
        },

        // --- BOIS ---

        sawmill: {
            name: "Scierie",
            category: "Wood",
            icon: "🪚",
            width: 3, height: 3,
            cost: { wood: 10 },
            staff: { workers: 10, engineers: 10, children: 10 },
            staff_max: 10,
            product: { wood: 1 },
            insulation: 1,
            description: "Transforme les arbres gelés en bois utilisable."
        },
        steam_sawmill: {
            name: "Scierie à vapeur",
            category: "Wood",
            icon: "🪚",
            width: 3, height: 3,
            cost: { wood: 25, iron: 40 },
            staff: { workers: 10 },
            staff_max: 10,
            product: { wood: 2 },
            insulation: 2,
            description: "Version améliorée de la scierie, plus efficace."
        },
        wall_drill: {
            name: "Foreuse murale",
            category: "Wood",
            icon: "🧱",
            width: 4, height: 3,
            cost: { wood: 20, steamCores: 1 },
            staff: { workers: 10 },
            staff_max: 10,
            product: { wood: 3 },
            insulation: 1,
            description: "Foreuse creusant les murs gelés pour extraire du bois."
        },
        steam_wall_drill: {
            name: "Foreuse murale à vapeur",
            category: "Wood",
            icon: "🏗️",
            width: 4, height: 3,
            cost: { wood: 20, iron: 40, steamCores: 2 },
            staff: { workers: 10 },
            staff_max: 10,
            product: { wood: 4 },
            insulation: 2,
            description: "Utilise la vapeur pour forer plus vite et plus profondément."
        },
        advanced_wall_drill: {
            name: "Foreuse murale avancée",
            category: "Wood",
            icon: "⚙️",
            width: 4, height: 3,
            cost: { wood: 40, iron: 80, steamCores: 3 },
            staff: { workers: 10 },
            staff_max: 10,
            product: { wood: 5 },
            insulation: 3,
            description: "Foreuse de pointe exploitant les murs gelés plus efficacement."
        },

        // --- CHARBON ---
        coal_thumper: {
            name: "Extracteur de charbon",
            category: "Coal",
            icon: "⚒️",
            width: 3, height: 2,
            cost: { wood: 15 },
            staff: { workers: 10, engineers: 10, children: 10 },
            staff_max: 10,
            product: { coal: 10 },
            insulation: 1,
            description: "Pompe le charbon du sol."
        },
        steam_coal_thumper: {
            name: "Extracteur de charbon à vapeur",
            category: "Coal",
            icon: "🌋",
            width: 3, height: 2,
            cost: { wood: 35, iron: 25 },
            staff: { workers: 10 },
            staff_max: 10,
            product: { coal: 30 },
            insulation: 2,
            description: "Pompe du charbon avec vapeur."
        },
        coal_mine: {
            name: "Mine de charbon",
            category: "Coal",
            icon: "⛏️",
            width: 4, height: 2,
            cost: { wood: 25, iron: 10, steamCores: 1 },
            staff: { workers: 10, engineers: 10, children: 10 },
            staff_max: 10,
            product: { coal: 6 },
            insulation: 1,
            description: "Extrait du charbon du sol."
        },
        steam_coal_mine: {
            name: "Mine de charbon à vapeur",
            category: "Coal",
            icon: "🏗️",
            width: 4, height: 2,
            cost: { wood: 25, iron: 40, steamCores: 2 },
            staff: { workers: 10 },
            staff_max: 10,
            product: { coal: 12 },
            insulation: 2,
            description: "Mine de charbon sous vapeur."
        },
        advanced_coal_mine: {
            name: "Mine de charbon avancée",
            category: "Coal",
            icon: "⚙️",
            width: 4, height: 2,
            cost: { wood: 40, iron: 80, steamCores: 3 },
            staff: { workers: 10 },
            staff_max: 10,
            product: { coal: 20 },
            insulation: 3,
            description: "Extraction rapide du charbon."
        },
        charcoal_kiln: {
            name: "Four à charbon",
            category: "Coal",
            icon: "🔥",
            width: 3, height: 3,
            cost: { wood: 30, iron: 30 },
            staff: { workers: 5 },
            staff_max: 5,
            product: { charcoal: 1 },
            consume: { wood: 1 },
            insulation: 2,
            description: "Transforme le bois en charbon."
        },

        // --- ACIER ---

        steelworks: {
            name: "Fonderie d'acier",
            category: "Steel",
            icon: "⚒️",
            width: 3, height: 3,
            cost: { wood: 25 },
            staff: { workers: 10 },
            staff_max: 10,
            product: { iron: 1 },
            insulation: 1,
            description: "Extrait et traite le minerai."
        },
        steam_steelworks: {
            name: "Fonderie d'acier à vapeur",
            category: "Steel",
            icon: "🏭",
            width: 3, height: 3,
            cost: { wood: 40, iron: 15 },
            staff: { workers: 10 },
            staff_max: 10,
            product: { iron: 2 },
            insulation: 2,
            description: "Fonderie plus efficace à vapeur."
        },
        advanced_steelworks: {
            name: "Fonderie d'acier avancée",
            category: "Steel",
            icon: "⚙️",
            width: 3, height: 3,
            cost: { wood: 80, iron: 40 },
            staff: { workers: 10 },
            staff_max: 10,
            product: { iron: 3 },
            insulation: 3,
            description: "Fonderie moderne à haut rendement."
        },

        // --- TECH (2x2, 3x3) ---
        workshop: {
            name: "Atelier",
            category: "Tech",
            icon: "🧰",
            width: 3, height: 3,
            cost: { wood: 15, iron: 5 },
            staff: { engineers: 5 },
            staff_max: 5,
            product: { science: 1 },
            insulation: 2,
            description: "Laboratoire de nouvelles technologies et améliorations."
        },
        steam_hub: {
            name: "Noyau de vapeur",
            category: "Tech",
            icon: "🔥",
            width: 1, height: 1,
            cost: { iron: 20 },
            staff: {},
            staff_max: 0,
            product: { heat: 3 },
            insulation: 0,
            description: "Crée une petite zone chauffée, alimentée par le générateur. Consomme 3 charbon/heure."
        },
        beacon: {
            name: "Balise",
            category: "Tech",
            icon: "📡",
            width: 3, height: 3,
            cost: { wood: 20, iron: 35 },
            staff: { workers: 10 },
            staff_max: 10,
            insulation: 0,
            description: "Permet d’envoyer des éclaireurs pour explorer le monde."
        },
        factory: {
            name: "Usine",
            category: "Tech",
            icon: "🏭",
            width: 3, height: 3,
            cost: { wood: 30, iron: 15, steam_core: 1 },
            staff: { engineers: 5 },
            staff_max: 5,
            product: { prosteses: 1, automaton: 1 },
            insulation: 2,
            description: "Usine spécialisée dans la production d’automates et dispositifs avancés."
        },

        // --- MONDE ---
        outpost_depot: {
            name: "Dépôt d’avant-poste",
            category: "World",
            icon: "🏕️",
            width: 3, height: 3,
            cost: { wood: 25, iron: 45 },
            insulation: 0,
            description: "Permet de créer et maintenir une connexion avec un avant-poste de ressources éloigné."
        },
        evacuation_centre: {
            name: "Centre d’évacuation",
            category: "World",
            icon: "🚢",
            width: 3, height: 3,
            cost: { wood: 25, iron: 45 },
            staff: {},
            staff_max: 0,
            insulation: 1,
            description: "Permet d’envoyer toute ca colonie vers un utre lieu."
        },
        transport_depot: {
            name: "Dépôt de transport",
            category: "World",
            icon: "🚛",
            width: 4, height: 3,
            cost: { wood: 45, iron: 20 },
            insulation: 1,
            description: "Gère l’envoi des ressources vers un autre lieu."
        },

        // --- INFRA ---
        road: {
            name: "Route",
            category: "infra",
            icon: "🟫",
            width: 1, height: 1,
            cost: { wood: 1 }, // Par case
            description: "Connecte les bâtiments."
        }
    },

    // Debug
    DEBUG_MODE: true
};
