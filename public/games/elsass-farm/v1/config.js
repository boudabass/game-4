// Configuration globale du jeu Elsass Farm
const Config = {
    // Monde
    worldWidth: 3000, // Largeur totale du monde (pour la caméra)
    worldHeight: 3000, // Hauteur totale du monde
    
    // Temps (1 minute réelle = 1 heure en jeu)
    time: {
        realMinutePerHour: 1, // 1 minute réelle = 1 heure jeu
        startHour: 6,
        maxHour: 26, // 2 AM the next day (24 + 2)
        
        // Saisons
        daysPerSeason: 28,
        seasons: ['Printemps', 'Été', 'Automne', 'Hiver']
    },
    
    // Énergie
    energy: {
        max: 100,
        cost: {
            plant: 4,
            water: 2,
            harvest: 1,
            chop: 8, // Hache/Pioche
            sprint: 0.5 // par seconde
        }
    },
    
    // Couleurs (Stardew style)
    colors: {
        background: '#1a1a1a',
        player: '#34d399', // Vert
        platform: '#6b7280', // Gris
        coin: '#fbbf24', // Ambre
        text: 255
    },
    
    // Farming Nord
    farm: {
        gridSize: 10,
        tileSize: 64,
        growthDays: 4 // J0 planté, J1-3 poussant, J4 prêt
    }
};