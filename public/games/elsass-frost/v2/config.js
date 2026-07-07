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

    // ---------- MÉTÉO (sans fin, difficulté croissante) ----------
    WEATHER: {
        START_TEMP: -20,
        DRIFT_PER_DAY: -1.2,      // tendance de fond (moyenne)
        NOISE: 3,                 // variation aléatoire jour à jour
        STORM_EVERY_MIN: 5,       // une tempête tous les 5 à 9 jours
        STORM_EVERY_MAX: 9,
        STORM_BASE_DROP: 14,      // intensité de la 1re tempête
        STORM_GROWTH: 4,          // chaque tempête est plus violente
        STORM_DURATION: 2         // en jours
    },

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
    // SCORE = jours survécus x 100 + pic de population x 25
    //         + bâtiments construits (total) x 15
    SCORE_WEIGHTS: { days: 100, peakPop: 25, built: 15 },

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

    // Ordre des catégories dans le menu construction
    CATEGORIES: ["Logement", "Nourriture", "Ressources", "Santé", "Tech", "Moral", "Stockage"],

    // ---------- RESSOURCES DE DÉPART ----------
    START_RES: { coal: 320, wood: 220, steel: 80, cores: 2, rawFood: 140, rations: 120 },

    // ---------- ÉVÉNEMENTS À CHOIX (dilemmes) ----------
    // Tirés au sort certains jours à 10h. effects : deltas appliqués.
    EVENTS: [
        {
            id: "refugees", icon: "🚶", title: "Des réfugiés aux portes",
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
            id: "old_stash", icon: "🎒", title: "Cache découverte",
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
    ],
    EVENT_CHANCE: 0.45,   // proba qu'un dilemme survienne un jour donné
    EVENT_FIRST_DAY: 3    // pas d'événement avant le jour 3
};
