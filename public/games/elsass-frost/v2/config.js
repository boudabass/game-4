/*
 * config.js — Elsass Frost v2
 * Tout l'équilibrage du jeu est ici. Les taux de production/consommation
 * sont exprimés PAR JOUR de jeu (la simulation les répartit par minute).
 */
window.EFConfig = {

    // ---------- GRILLE ----------
    GRID_SIZE: 40,        // 40x40 cases
    TILE: 32,             // taille d'une case en unités monde

    // ---------- TEMPS ----------
    START_HOUR: 8,
    WORK_START: 8,        // heures de travail : production active
    WORK_END: 18,
    // Vitesse : minutes de jeu écoulées par seconde réelle, par niveau
    SPEED_MINUTES_PER_SEC: { 1: 10, 2: 25, 3: 60 },

    // ---------- SAISONS ----------
    // 1 saison = 1 jour de jeu (24h). Année = 4 jours.
    // temp : température de base l'année 1 ; driftPerYear : aggravation annuelle
    // (l'hiver est le "boss" : chaque hiver est plus rude que le précédent).
    // prod : multiplicateurs de production par bâtiment (1 = normal).
    // sickMult : facteur de risque de maladie ; arrivals : des survivants arrivent.
    SEASONS: [
        {
            id: "spring", name: "Printemps", icon: "🌱",
            temp: -5, driftPerYear: -3, noise: 3,
            sickMult: 1.5,            // le dégel apporte les épidémies
            arrivals: 1.0,
            prod: { hothouse: 1.25 },
            groundTint: [204, 214, 200]
        },
        {
            id: "summer", name: "Été", icon: "☀️",
            temp: 6, driftPerYear: -2, noise: 3,
            sickMult: 0.7,
            arrivals: 1.0,
            prod: { hothouse: 1.5, sawmill: 1.25, hunters: 0.75 },
            groundTint: [206, 210, 184]
        },
        {
            id: "autumn", name: "Automne", icon: "🍂",
            temp: -12, driftPerYear: -3, noise: 4,
            sickMult: 1.0,
            arrivals: 0.5,
            prod: { hunters: 1.5 },
            groundTint: [214, 208, 192]
        },
        {
            id: "winter", name: "Hiver", icon: "❄️",
            temp: -35, driftPerYear: -10, noise: 5,
            sickMult: 1.25,
            arrivals: 0,              // personne ne voyage sous la tempête
            prod: { coal_mine: 0.75, sawmill: 0.75, hunters: 0.5 },
            groundTint: [222, 230, 238]
        }
    ],
    // Variation au fil de la journée (nuit plus froide, après-midi plus doux)
    DIURNAL: { NIGHT: -4, AFTERNOON: 2 },

    // ---------- GÉNÉRATEUR ----------
    GENERATOR: {
        RADIUS: 9,                            // rayon de chaleur en cases
        HEAT_BY_LEVEL: { 0: 0, 1: 15, 2: 25, 3: 35 },
        COAL_BY_LEVEL: { 0: 0, 1: 50, 2: 120, 3: 210 } // charbon / jour
    },
    STEAM_HUB: { RADIUS: 5, HEAT: 20, COAL_PER_DAY: 30 },
    INSULATION_HEAT: 5,          // chaleur gagnée par niveau d'isolation

    // Paliers de température intérieure (ressentie dans le bâtiment)
    // clé = seuil minimum ; utilisé du plus chaud au plus froid
    TEMP_LEVELS: [
        { min: 5,    id: "comfy",  label: "Confortable", sickPerDay: 0    },
        { min: -5,   id: "cool",   label: "Frais",       sickPerDay: 0.01 },
        { min: -15,  id: "cold",   label: "Froid",       sickPerDay: 0.05 },
        { min: -30,  id: "vcold",  label: "Très froid",  sickPerDay: 0.15 },
        { min: -999, id: "icy",    label: "Glacial",     sickPerDay: 0.35 }
    ],

    // ---------- POPULATION ----------
    START_POP: { workers: 25, engineers: 8, children: 7 },
    RATION_PER_CITIZEN: 1,       // ration consommée par citoyen à 18h
    HOMELESS_SICK_PER_DAY: 0.45, // proba/jour de tomber malade sans abri
    UNTREATED_DEATH_PER_DAY: 0.18, // proba/jour de mourir malade non soigné
    HEAL_COMFY_BONUS: 0.15,      // guérison passive si logement confortable
    NEWCOMERS_EVERY_MIN: 3,      // arrivées de survivants tous les 3 à 5 jours
    NEWCOMERS_EVERY_MAX: 5,
    NEWCOMERS_MIN_HOPE: 25,      // pas d'arrivées si l'espoir est trop bas

    // ---------- MORAL ----------
    HOPE_START: 60,
    DISCONTENT_START: 15,
    MORAL: {                     // impacts par événement ou par jour
        DEATH_HOPE: -4, DEATH_DISCONTENT: 3,
        DEATH_HOPE_CEMETERY: -1, DEATH_DISCONTENT_CEMETERY: 1,
        HUNGER_HOPE: -6, HUNGER_DISCONTENT: 6,     // par jour de disette
        HOMELESS_HOPE: -3, HOMELESS_DISCONTENT: 3, // par jour avec sans-abri
        SICK_MANY_DISCONTENT: 2,   // par jour si +25% de malades
        ALL_FED_HOPE: 1,           // par jour si tout le monde mange
        ALL_HOUSED_HOPE: 0.5,      // par jour si tout le monde est logé
        GENERATOR_OFF_HOPE: -5,    // par jour générateur éteint
        CALM_DISCONTENT: -3        // par jour si personne n'a faim ni ne dort dehors
    },

    // ---------- STOCKAGE ----------
    BASE_STORAGE: 600,           // cap de base par ressource
    DEPOT_STORAGE: 400,          // cap ajouté par dépôt

    // ---------- ROUTES ----------
    ROAD_COST_WOOD: 1,
    ROAD_BONUS: 0.25,            // +25% de production si relié au générateur

    // ---------- SCORE (équation unique du classement) ----------
    // SCORE = jours x 100 + tâches réussies x 200 + pic de population x 25
    //         + bâtiments construits (total) x 15
    SCORE_WEIGHTS: { days: 100, tasks: 200, peakPop: 25, built: 15 },

    // ---------- BÂTIMENTS ----------
    // rate = production PAR JOUR (pendant les heures de travail, au prorata
    // du staff). consume = consommation PAR JOUR. staffType : workers|engineers
    BUILDINGS: {
        generator: {
            name: "Générateur", cat: "Tech", icon: "🔥", w: 3, h: 3,
            unique: true, noBuild: true, noDemolish: true,
            desc: "Le cœur de la ville. Réglez sa puissance, alimentez-le en charbon."
        },
        steam_hub: {
            name: "Borne de vapeur", cat: "Tech", icon: "♨️", w: 2, h: 2,
            cost: { wood: 20, steel: 10 },
            desc: "Diffuse la chaleur du réseau dans un rayon de 5 cases. Consomme du charbon."
        },
        tent: {
            name: "Tente", cat: "Logement", icon: "⛺", w: 2, h: 2,
            cost: { wood: 12 }, capacity: 10, insulation: 1,
            desc: "Abri basique pour 10 citoyens. Isolation faible."
        },
        bunkhouse: {
            name: "Baraquement", cat: "Logement", icon: "🏠", w: 2, h: 2,
            cost: { wood: 25, steel: 8 }, capacity: 10, insulation: 2,
            desc: "Logement correct pour 10 citoyens."
        },
        house: {
            name: "Maison", cat: "Logement", icon: "🏡", w: 2, h: 2,
            cost: { wood: 40, steel: 20 }, capacity: 10, insulation: 3,
            desc: "Habitat bien isolé pour 10 citoyens."
        },
        medical_post: {
            name: "Poste médical", cat: "Santé", icon: "⚕️", w: 2, h: 2,
            cost: { wood: 25 }, staff: 5, staffType: "engineers",
            healPerDay: 4, insulation: 2,
            desc: "Soigne 4 malades par jour (à plein effectif d'ingénieurs)."
        },
        hospital: {
            name: "Hôpital", cat: "Santé", icon: "🏥", w: 3, h: 3,
            cost: { wood: 40, steel: 25, cores: 1 }, staff: 10, staffType: "engineers",
            healPerDay: 10, insulation: 3,
            desc: "Soigne 10 malades par jour. Nécessite un noyau de vapeur."
        },
        cookhouse: {
            name: "Cuisine", cat: "Nourriture", icon: "🍲", w: 3, h: 2,
            cost: { wood: 20 }, staff: 5, staffType: "workers",
            rate: { rations: 50 }, consume: { rawFood: 25 }, insulation: 1,
            desc: "Transforme 25 vivres en 50 rations par jour."
        },
        hunters: {
            name: "Chasseurs", cat: "Nourriture", icon: "🏹", w: 3, h: 2,
            cost: { wood: 35 }, staff: 10, staffType: "workers",
            rate: { rawFood: 40 }, nightShift: true, insulation: 2,
            desc: "Ramènent 40 vivres par nuit. Travaillent la nuit, insensibles au froid."
        },
        hothouse: {
            name: "Serre", cat: "Nourriture", icon: "🌿", w: 3, h: 2,
            cost: { wood: 25, steel: 10, cores: 1 }, staff: 8, staffType: "engineers",
            rate: { rawFood: 55 }, insulation: 2,
            desc: "Produit 55 vivres par jour. Nécessite un noyau de vapeur."
        },
        sawmill: {
            name: "Scierie", cat: "Ressources", icon: "🪚", w: 3, h: 2,
            cost: { wood: 15 }, staff: 10, staffType: "workers",
            rate: { wood: 60 }, insulation: 1,
            desc: "Débite les arbres gelés : 60 bois par jour."
        },
        charcoal_kiln: {
            name: "Charbonnière", cat: "Ressources", icon: "🪵", w: 2, h: 2,
            cost: { wood: 20 }, staff: 8, staffType: "workers",
            rate: { coal: 70 }, consume: { wood: 20 }, insulation: 1,
            desc: "Brûle 20 bois pour produire 70 charbon par jour."
        },
        coal_mine: {
            name: "Mine de charbon", cat: "Ressources", icon: "⛏️", w: 3, h: 3,
            cost: { wood: 30, steel: 20, cores: 1 }, staff: 12, staffType: "workers",
            rate: { coal: 150 }, insulation: 2,
            desc: "Extrait 150 charbon par jour. Nécessite un noyau de vapeur."
        },
        steelworks: {
            name: "Aciérie", cat: "Ressources", icon: "🏭", w: 3, h: 3,
            cost: { wood: 35, steel: 10, cores: 1 }, staff: 10, staffType: "workers",
            rate: { steel: 35 }, consume: { wood: 15 }, insulation: 2,
            desc: "Produit 35 acier par jour à partir de 15 bois."
        },
        depot: {
            name: "Dépôt", cat: "Stockage", icon: "📦", w: 2, h: 2,
            cost: { wood: 30, steel: 10 }, storage: 400, insulation: 0,
            desc: "Augmente la capacité de stockage de 400 par ressource."
        },
        pub: {
            name: "Pub", cat: "Moral", icon: "🍺", w: 3, h: 2,
            cost: { wood: 30, steel: 10 }, staff: 4, staffType: "workers",
            moralPerDay: { hope: 3, discontent: -3 }, insulation: 2,
            desc: "Remonte le moral : +3 espoir, -3 mécontentement par jour."
        },
        cemetery: {
            name: "Cimetière", cat: "Moral", icon: "⚰️", w: 2, h: 2,
            cost: { wood: 15 },
            desc: "Des funérailles dignes : les décès pèsent beaucoup moins sur le moral."
        }
    },

    // Bâtiments disponibles dès le début ; les autres sont débloqués
    // par les tâches principales (voir TASKS.unlocks).
    START_UNLOCKED: ["tent", "cookhouse", "hunters", "sawmill", "charcoal_kiln", "medical_post"],

    // Ordre des catégories dans le menu construction
    CATEGORIES: ["Logement", "Nourriture", "Ressources", "Santé", "Tech", "Moral", "Stockage"],

    // ---------- RESSOURCES DE DÉPART ----------
    START_RES: { coal: 320, wood: 220, steel: 80, cores: 2, rawFood: 140, rations: 120 },

    // ---------- TÂCHES (le moteur de la partie) ----------
    // Chaque saison apporte 1 tâche principale + 1 secondaire (bonus).
    // Réussir une principale débloque des bâtiments. Rater une tâche applique
    // une pénalité EN RAPPORT avec la tâche + un coup au moral. La partie ne
    // se perd que par les jauges (espoir 0, mécontentement 100, ville morte).
    //
    // Types : stock (avoir N d'une ressource — réussite immédiate dès atteinte),
    //   build (avoir N bâtiments d'un type), pop (population totale),
    //   housed (zéro sans-abri), sickmax (à la FIN de la saison : malades <= N%),
    //   nohunger (à la FIN de la saison : personne n'a eu faim ce jour),
    //   hopemin / discmax (à la FIN de la saison : jauge au bon niveau).
    // scale : cible = base + perYear x (année-1) + perPop x population.
    TASKS: {
        // Années 1 et 2 : scénario écrit (index = (année-1) x 4 + saison)
        script: [
            // ---- ANNÉE 1 ----
            { // Printemps
                main: { icon: "🏠", title: "Des toits pour tous", type: "housed",
                    desc: "Personne ne doit dormir dehors avant la fin du printemps.",
                    unlocks: ["bunkhouse"],
                    penalty: { sick: 6, hope: -8, discontent: 8 }, reward: { hope: 6 } },
                side: { icon: "⚕️", title: "Un poste médical", type: "build",
                    building: "medical_post", base: 1,
                    desc: "Construis un poste médical.", reward: { hope: 4 } }
            },
            { // Été
                main: { icon: "🍲", title: "Les réserves de l'été", type: "stock",
                    res: "rations", base: 160, perPop: 0.5,
                    desc: "Profite de l'été pour remplir le garde-manger.",
                    unlocks: ["hothouse", "depot"],
                    penalty: { res: { rations: -40 }, hope: -8, discontent: 10 }, reward: { hope: 6 } },
                side: { icon: "🪵", title: "Du bois pour l'hiver", type: "stock",
                    res: "wood", base: 260,
                    desc: "Stocke du bois avant les grands froids.", reward: { hope: 4 } }
            },
            { // Automne
                main: { icon: "⚫", title: "Le charbon de l'hiver", type: "stock",
                    res: "coal", base: 420, perPop: 1,
                    desc: "L'hiver arrive : remplis les réserves de charbon.",
                    unlocks: ["steam_hub", "house"],
                    penalty: { res: { coal: -60 }, hope: -10, discontent: 8 }, reward: { hope: 8 } },
                side: { icon: "🪵", title: "Deuxième charbonnière", type: "build",
                    building: "charcoal_kiln", base: 2,
                    desc: "Double la production de charbon.", reward: { hope: 4 } }
            },
            { // Hiver
                main: { icon: "🤒", title: "Tenir bon", type: "sickmax", base: 25,
                    desc: "Finis l'hiver avec moins de 25% de malades.",
                    unlocks: ["coal_mine"],
                    penalty: { deaths: 2, hope: -10, discontent: 6 }, reward: { hope: 10 } },
                side: { icon: "🍽️", title: "Le ventre plein", type: "nohunger",
                    desc: "Personne ne doit avoir faim durant l'hiver.", reward: { hope: 5 } }
            },
            // ---- ANNÉE 2 ----
            { // Printemps
                main: { icon: "👥", title: "La ville grandit", type: "pop", base: 55,
                    desc: "Accueille et garde 55 citoyens en vie.",
                    unlocks: ["hospital"],
                    penalty: { hope: -8, discontent: 6 }, reward: { hope: 6 } },
                side: { icon: "🍺", title: "Un lieu pour souffler", type: "build",
                    building: "pub", base: 1, unlocks: ["pub"],
                    desc: "Le pub est maintenant constructible : bâtis-le.", reward: { hope: 5 } }
            },
            { // Été
                main: { icon: "🍲", title: "Grandes réserves", type: "stock",
                    res: "rations", base: 260, perPop: 1,
                    desc: "Une grande ville a un grand appétit.",
                    unlocks: ["steelworks"],
                    penalty: { res: { rations: -60 }, hope: -8, discontent: 10 }, reward: { hope: 6 } },
                side: { icon: "🔩", title: "Réserve d'acier", type: "stock",
                    res: "steel", base: 130,
                    desc: "L'acier manquera plus que tout.", reward: { hope: 4 } }
            },
            { // Automne
                main: { icon: "⚫", title: "La grande réserve", type: "stock",
                    res: "coal", base: 620, perPop: 1.5,
                    desc: "Cet hiver sera pire. Beaucoup plus de charbon.",
                    unlocks: ["cemetery"],
                    penalty: { res: { coal: -100 }, hope: -10, discontent: 10 }, reward: { hope: 8 } },
                side: { icon: "♨️", title: "Réseau de vapeur", type: "build",
                    building: "steam_hub", base: 2,
                    desc: "Étends la chaleur avec 2 bornes de vapeur.", reward: { hope: 4 } }
            },
            { // Hiver
                main: { icon: "🤒", title: "Le grand froid", type: "sickmax", base: 20,
                    desc: "Finis l'hiver avec moins de 20% de malades.",
                    penalty: { deaths: 3, hope: -12, discontent: 8 }, reward: { hope: 10 } },
                side: { icon: "💙", title: "Garder la foi", type: "hopemin", base: 55,
                    desc: "Termine l'hiver avec au moins 55 d'espoir.", reward: { hope: 5 } }
            }
        ],
        // Année 3 et suivantes : tâches génériques mises à l'échelle
        generic: [
            { // Printemps
                main: { icon: "👥", title: "Toujours plus nombreux", type: "popgrow", base: 8,
                    desc: "Gagne 8 habitants avant la fin du printemps.",
                    penalty: { hope: -8, discontent: 6 }, reward: { hope: 6 } },
                side: { icon: "🤒", title: "Ville saine", type: "sickmax", base: 10,
                    desc: "Finis le printemps avec moins de 10% de malades.", reward: { hope: 4 } }
            },
            { // Été
                main: { icon: "🍲", title: "Réserves d'été", type: "stock",
                    res: "rations", base: 150, perYear: 90, perPop: 1,
                    desc: "Remplis le garde-manger, encore.",
                    penalty: { res: { rations: -80 }, hope: -8, discontent: 10 }, reward: { hope: 6 } },
                side: { icon: "🪵", title: "Bois d'hiver", type: "stock",
                    res: "wood", base: 200, perYear: 80,
                    desc: "Le bois part vite quand tout gèle.", reward: { hope: 4 } }
            },
            { // Automne
                main: { icon: "⚫", title: "Charbon, toujours", type: "stock",
                    res: "coal", base: 400, perYear: 220, perPop: 1.5,
                    desc: "Chaque hiver est pire que le précédent.",
                    penalty: { res: { coal: -120 }, hope: -10, discontent: 10 }, reward: { hope: 8 } },
                side: { icon: "🏗️", title: "Toujours bâtir", type: "buildany", base: 2,
                    desc: "Construis 2 nouveaux bâtiments cette saison.", reward: { hope: 4 } }
            },
            { // Hiver
                main: { icon: "🤒", title: "Survivre, encore", type: "sickmax", base: 25,
                    desc: "Finis l'hiver avec moins de 25% de malades.",
                    penalty: { deaths: 3, hope: -12, discontent: 8 }, reward: { hope: 10 } },
                side: { icon: "😠", title: "Garder le calme", type: "discmax", base: 45,
                    desc: "Termine l'hiver sous 45 de mécontentement.", reward: { hope: 5 } }
            }
        ]
    },

    // ---------- ÉVÉNEMENTS À CHOIX (dilemmes) ----------
    // Tirés au sort certains jours à 10h. effects : deltas appliqués.
    EVENTS: [
        {
            id: "refugees", icon: "🚶", title: "Des réfugiés aux portes", season: "spring",
            text: "Un groupe de survivants transis demande asile. Les accueillir mettra nos réserves à l'épreuve.",
            a: { label: "Les accueillir", effects: { pop: 8, hope: 6, rations: -15 } },
            b: { label: "Les refouler", effects: { hope: -8, discontent: 6 } }
        },
        {
            id: "strike", icon: "✊", title: "Grève à la production",
            text: "Épuisés par le froid, des ouvriers cessent le travail et réclament des rations doublées.",
            a: { label: "Céder (rations -30)", effects: { rations: -30, hope: 4, discontent: -6 } },
            b: { label: "Refuser", effects: { discontent: 10, hope: -3 } }
        },
        {
            id: "coal_theft", icon: "🕵️", title: "Vol de charbon",
            text: "Quelqu'un pille la réserve de charbon la nuit. Une fouille générale trouverait le coupable, mais braquerait la ville.",
            a: { label: "Fouille générale", effects: { discontent: 8, coal: 25 } },
            b: { label: "Fermer les yeux", effects: { coal: -35, hope: -2 } }
        },
        {
            id: "preacher", icon: "📢", title: "Un prêcheur de rue",
            text: "Un homme harangue la foule : « Cette ville est maudite ! ». Certains l'écoutent.",
            a: { label: "Le laisser parler", effects: { hope: -6 } },
            b: { label: "Le faire taire", effects: { discontent: 7, hope: 2 } }
        },
        {
            id: "sick_child", icon: "🧒", title: "L'enfant malade",
            text: "Un enfant gravement malade a besoin de soins prioritaires. D'autres attendent aussi.",
            a: { label: "Le soigner d'abord", effects: { hope: 6, sick: 1 } },
            b: { label: "Suivre la file", effects: { hope: -4, discontent: 3 } }
        },
        {
            id: "old_stash", icon: "🎒", title: "Cache découverte", season: "autumn",
            text: "Des éclaireurs ont trouvé une cache sous la neige. L'expédition serait risquée par ce froid.",
            a: { label: "Envoyer une équipe", effects: { wood: 40, coal: 40, sick: 2 } },
            b: { label: "Trop risqué", effects: { hope: -2 } }
        },
        {
            id: "rumor", icon: "🗣️", title: "Rumeur de terres chaudes",
            text: "Une rumeur enfle : il existerait un endroit épargné par le froid. Des familles veulent partir.",
            a: { label: "Les retenir", effects: { discontent: 8 } },
            b: { label: "Les laisser partir", effects: { pop: -5, hope: -5 } }
        },
        {
            id: "double_shift", icon: "⏰", title: "Prime de nuit",
            text: "Le contremaître propose des rations bonus contre du travail de nuit à la mine.",
            a: { label: "Accepter (rations -20)", effects: { rations: -20, coal: 60, discontent: 4 } },
            b: { label: "Refuser", effects: {} }
        }
        ,
        {
            id: "avalanche", icon: "🏔️", title: "Avalanche !", season: "winter",
            text: "Une avalanche a enseveli l'entrée de la mine avec des ouvriers à l'intérieur. Les secours seraient éprouvants par ce froid.",
            a: { label: "Envoyer les secours", effects: { sick: 3, hope: 8 } },
            b: { label: "Attendre le redoux", effects: { hope: -8, discontent: 6, coal: -40 } }
        },
        {
            id: "harvest", icon: "🌾", title: "Récolte exceptionnelle", season: "summer",
            text: "Les cueilleurs reviennent les bras chargés : la belle saison a été généreuse. La ville réclame une fête.",
            a: { label: "Organiser une fête", effects: { rations: -20, hope: 10, discontent: -6 } },
            b: { label: "Tout mettre en réserve", effects: { rawFood: 50, discontent: 4 } }
        },
        {
            id: "meltwater", icon: "💧", title: "La fonte des neiges", season: "spring",
            text: "L'eau de fonte s'infiltre dans les entrepôts. On ne pourra pas tout protéger à temps.",
            a: { label: "Sauver le charbon", effects: { wood: -35 } },
            b: { label: "Sauver le bois", effects: { coal: -35 } }
        }
    ],
    EVENT_CHANCE: 0.45,   // proba qu'un dilemme survienne un jour donné
    EVENT_FIRST_DAY: 3    // pas d'événement avant le jour 3
};
