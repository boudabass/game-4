const Config = {
    debug: true,
    
    // Monde
    worldWidth: 3000,
    worldHeight: 3000,
    
    // Caméra
    zoom: {
        min: 0.5,  // Dézoom max (voir large)
        max: 3.0,  // Zoom max (pixel art détaillé)
        start: 1.0,
        sensitivity: 0.001 // Vitesse du zoom molette
    },
    
    // Couleurs
    colors: {
        background: '#2c3e50',
        gridLines: 'rgba(255, 255, 255, 0.1)'
    }
};

window.ElsassFarm = {
    state: null
};