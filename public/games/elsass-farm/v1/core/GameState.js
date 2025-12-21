// core/GameState.js
// État global du jeu - Source unique de vérité pour toutes les données

window.GameState = {
    // --- Ressources Joueur ---
    energy: 100,      // Énergie max 100, coût par action
    maxEnergy: 100,
    gold: 0,          // Monnaie du jeu

    // --- Temps ---
    day: 1,           // Jour actuel
    hour: 6,          // Heure (6-24)
    minute: 0,        // Minutes (0-59)
    season: 'SPRING', // SPRING, SUMMER, AUTUMN, WINTER

    // --- Zone ---
    currentZoneId: 'C_C',  // Zone de départ (Ferme Principale)

    // --- Méthodes utilitaires ---

    // Formatte l'heure pour affichage HUD
    getTimeString: function () {
        return `${this.hour}:${this.minute.toString().padStart(2, '0')}`;
    },

    // Dépense de l'énergie (retourne false si pas assez)
    spendEnergy: function (amount) {
        if (this.energy >= amount) {
            this.energy -= amount;
            return true;
        }
        console.warn(`Pas assez d'énergie! Requis: ${amount}, Disponible: ${this.energy}`);
        return false;
    },

    // Récupération d'énergie
    restoreEnergy: function (amount) {
        this.energy = Math.min(this.energy + amount, this.maxEnergy);
    },

    // Ajoute de l'or
    addGold: function (amount) {
        this.gold += amount;
    },

    // Dépense de l'or (retourne false si pas assez)
    spendGold: function (amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        console.warn(`Pas assez d'or! Requis: ${amount}, Disponible: ${this.gold}`);
        return false;
    },

    // Avance le temps
    advanceTime: function (minutes) {
        this.minute += minutes;
        while (this.minute >= 60) {
            this.minute -= 60;
            this.hour++;
        }
        // TODO: Gérer le passage de jour si hour >= 24
    },

    // Réinitialise l'état pour une nouvelle partie
    reset: function () {
        this.energy = 100;
        this.gold = 0;
        this.day = 1;
        this.hour = 6;
        this.minute = 0;
        this.season = 'SPRING';
        this.currentZoneId = 'C_C';
    }
};

// Migration: Synchroniser avec l'ancien système ElsassFarm.state
// Ceci assure la compatibilité pendant la transition
Object.defineProperty(window.ElsassFarm.state, 'currentZoneId', {
    get: function () { return window.GameState.currentZoneId; },
    set: function (val) { window.GameState.currentZoneId = val; }
});

console.log("✅ GameState.js chargé");
