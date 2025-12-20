// Configuration Globale Elsass Farm
const Config = {
    debug: true,
    
    // Affichage
    canvasWidth: 800,
    canvasHeight: 600,
    bgColor: '#2c3e50', // Couleur de fond (Hiver/Nuit par défaut)
    
    // Grille Isométrique
    grid: {
        cols: 10,
        rows: 10,
        tileSize: 64, // Largeur visuelle d'une tuile
        originX: 400, // Centre X du canvas
        originY: 150  // Offset Y du haut de la grille
    },
    
    // Couleurs Tiles (Placeholder avant assets)
    colors: {
        ground: '#7f8c8d',
        grass: '#27ae60',
        water: '#2980b9',
        highlight: 'rgba(255, 255, 255, 0.3)'
    }
};

// Espace de nom global pour le jeu
window.ElsassFarm = {
    state: null,
    systems: {},
    entities: []
};