// core/GameState.js
// État global du jeu - Source unique de vérité pour toutes les données

window.GameState = {
    // --- États du Jeu ---
    GAME_STATE: {
        MENU: 'MENU',
        PLAYING: 'PLAYING',
        PAUSED: 'PAUSED',
        GAMEOVER: 'GAMEOVER'
    },
    currentState: 'MENU',

    // --- Ressources Joueur ---
    energy: 0,        // Limite de clics
    maxEnergy: Config.initialEnergy,
    gold: 0,          // Monnaie du jeu
    score: 0,         // Score actuel
    chrono: 0,        // Temps restant en secondes

    // --- Logique de Puzzle ---
    selectedTile: null, // { col, row, itemId } de l'item sélectionné
    
    // --- Inventaire Power-ups ---
    // Stock total (5x5)
    powerUpStock: {}, // { 'bomb_3x3': 2, 'energy_30': 3, ... }
    
    // Slots équipés (5 slots pour la Ligne 2)
    equippedSlots: [
        { id: 'bomb_3x3', icon: '💣' }, // Slot 1 (Explosion)
        { id: 'energy_30', icon: '⚡' }, // Slot 2 (Énergie)
        { id: 'tornado_6x6', icon: '🌪️' }, // Slot 3 (Zone)
        { id: 'line_h', icon: '➡️' }, // Slot 4 (Lignes)
        { id: 'time_10s', icon: '🕒' }  // Slot 5 (Bonus)
    ],
    
    // Power-up actuellement actif (en mode GLOW)
    activePowerUpIndex: -1, // Index du slot Ligne 2 (0-4)
    
    // --- Méthodes utilitaires ---

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

    // Réinitialise l'état pour une nouvelle partie
    reset: function () {
        this.energy = Config.initialEnergy;
        this.gold = 100; // Donner un peu d'or pour commencer
        this.score = 0;
        this.chrono = Config.levelTime;
        this.selectedTile = null;
        this.activePowerUpIndex = -1;
        this.currentState = this.GAME_STATE.PLAYING; // Démarrage direct en PLAYING
        
        // Initialisation du stock de power-ups (donner quelques items de base)
        this.powerUpStock = {
            'bomb_3x3': 2,
            'energy_30': 3,
            'tornado_6x6': 1,
            'line_h': 0,
            'time_10s': 3
        };
    }
};

console.log("✅ GameState.js chargé");