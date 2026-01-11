window.GameState = {
    // Ressources
    coal: 0,
    wood: 0,
    iron: 0,
    steamCores: 0,
    rawFood: 0,
    foodRations: 0,
    prostheses: 0,

    // Social
    hope: 50, // 0-100
    discontent: 0, // 0-100
    population: 25,
    maxPopulation: 125,

    // Temps
    day: 1,
    hour: 8,
    minute: 0,
    temperature: -20,

    // État du jeu
    isPaused: false,
    gameSpeed: 1, // 0=Pause, 1=1x, 2=2x, 3=3x

    // Initialisation
    init: function () {
        this.reset();
    },

    reset: function () {
        this.coal = Config.INITIAL_COAL;
        this.wood = Config.INITIAL_WOOD;
        this.iron = Config.INITIAL_IRON;
        this.steamCores = Config.INITIAL_STEAM_CORES;
        this.rawFood = Config.INITIAL_RAW_FOOD;
        this.foodRations = Config.INITIAL_FOOD_RATIONS;
        this.prostheses = Config.INITIAL_PROSTHESES;

        this.hope = 50;
        this.discontent = 10;
        this.population = 25;
        this.maxPopulation = 125;

        this.day = 1;
        this.hour = 8;
        this.minute = 0;
        this.temperature = -20;
        this.isPaused = false;

        console.log("GameState reset complet pour v1.1.");
        this.updateHUD();
    },

    // Méthodes de modification
    addResource: function (type, amount) {
        if (this[type] !== undefined) {
            this[type] += amount;
            if (this[type] < 0) this[type] = 0;
            if (this[type] > Config.MAX_RESOURCE) this[type] = Config.MAX_RESOURCE;
            this.updateHUD();
            return true;
        }
        return false;
    },

    consumeResource: function (type, amount) {
        if (this[type] >= amount) {
            this[type] -= amount;
            this.updateHUD();
            return true;
        }
        return false;
    },

    // Mise à jour HUD
    updateHUD: function () {
        // Ressources
        const resources = ['coal', 'wood', 'iron', 'steamCores', 'rawFood', 'foodRations', 'prostheses'];
        resources.forEach(res => {
            const el = document.getElementById(`val-${res}`);
            if (el) el.innerText = Math.floor(this[res]);
        });

        // Température
        const tempEl = document.getElementById('val-temp');
        if (tempEl) tempEl.innerText = this.temperature;

        // Population
        const popEl = document.getElementById('val-pop');
        if (popEl) popEl.innerText = this.population;
        const popMaxEl = document.getElementById('val-pop-max');
        if (popMaxEl) popMaxEl.innerText = this.maxPopulation;

        // Jauges Sociales
        const hopeFill = document.getElementById('fill-hope');
        if (hopeFill) hopeFill.style.width = this.hope + '%';

        const discFill = document.getElementById('fill-discontent');
        if (discFill) discFill.style.width = this.discontent + '%';
    }
};
