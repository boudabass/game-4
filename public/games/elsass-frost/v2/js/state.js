/*
 * state.js — État global de la partie (sérialisable tel quel).
 * Aucune logique de simulation ici : uniquement les données + reset.
 */
window.EFState = {
    // Ressources
    res: { coal: 0, wood: 0, steel: 0, cores: 0, rawFood: 0, rations: 0 },

    // Population
    pop: { workers: 0, engineers: 0, children: 0 },
    sick: 0,             // malades (toutes catégories)
    deathsTotal: 0,

    // Moral (0-100)
    hope: 60,
    discontent: 15,

    // Temps
    day: 1,
    hour: 8,
    minute: 0,
    speed: 1,            // 0 = pause
    lastSpeed: 1,        // pour reprendre après pause

    // Météo : température extérieure du jour + prévisions
    outsideTemp: -20,
    forecast: [],        // [{day, temp}...] 5 jours à venir
    weather: null,       // état interne du générateur météo (voir time.js)

    // Générateur
    generatorLevel: 1,   // 0-3

    // Bâtiments posés : [{type, x, y, staff, on}]
    buildings: [],
    roads: [],           // [{x, y}]

    // Statistiques pour le score
    peakPop: 0,
    builtTotal: 0,

    // Tâches (voir tasks.js) et bâtiments débloqués
    tasks: null,
    tasksDone: 0,
    unlocked: [],

    // Événements
    lastEventDay: 0,
    usedEvents: [],      // ids récents pour éviter les répétitions
    pendingEvent: null,  // dilemme en attente de choix (met le jeu en pause)

    // Drapeaux journaliers (réinitialisés chaque matin)
    flags: { hungerToday: false, homelessToday: false },

    // Fin de partie
    gameOver: false,
    gameOverReason: "",

    reset: function () {
        const C = window.EFConfig;
        this.res = Object.assign({}, C.START_RES);
        this.pop = Object.assign({}, C.START_POP);
        this.sick = 0;
        this.deathsTotal = 0;
        this.hope = C.HOPE_START;
        this.discontent = C.DISCONTENT_START;
        this.day = 1;
        this.hour = C.START_HOUR;
        this.minute = 0;
        this.speed = 1;
        this.lastSpeed = 1;
        this.outsideTemp = C.SEASONS[0].temp;
        this.forecast = [];
        this.weather = null;
        this.generatorLevel = 1;
        this.buildings = [];
        this.roads = [];
        this.peakPop = this.totalPop();
        this.builtTotal = 0;
        this.tasks = null;
        this.tasksDone = 0;
        this.unlocked = C.START_UNLOCKED.slice();
        this.lastEventDay = 0;
        this.usedEvents = [];
        this.pendingEvent = null;
        this.flags = { hungerToday: false, homelessToday: false };
        this.gameOver = false;
        this.gameOverReason = "";

        // Générateur préplacé au centre de la grille
        const g = Math.floor(C.GRID_SIZE / 2) - 1;
        this.buildings.push({ type: "generator", x: g, y: g, staff: 0, on: true });
    },

    totalPop: function () {
        return this.pop.workers + this.pop.engineers + this.pop.children;
    },

    // Capacité de stockage courante (base + dépôts)
    storageCap: function () {
        const C = window.EFConfig;
        const depots = this.buildings.filter(b => b.type === "depot").length;
        return C.BASE_STORAGE + depots * C.DEPOT_STORAGE;
    },

    // Ajoute une ressource en respectant le plafond (les noyaux ignorent le cap)
    addRes: function (key, amount) {
        const cap = key === "cores" ? 99 : this.storageCap();
        this.res[key] = Math.max(0, Math.min(cap, this.res[key] + amount));
    },

    // Staff encore disponible d'un type donné
    freeStaff: function (type) {
        let used = 0;
        for (const b of this.buildings) {
            const def = window.EFConfig.BUILDINGS[b.type];
            if (def.staff && def.staffType === type) used += b.staff;
        }
        // Les malades ne travaillent pas : on retire les malades au prorata
        const total = this.pop[type];
        const adults = this.pop.workers + this.pop.engineers;
        const sickShare = adults > 0 ? Math.round(this.sick * (total / Math.max(1, adults))) : 0;
        return Math.max(0, total - sickShare) - used;
    }
};
