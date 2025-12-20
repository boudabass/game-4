const Config = {
    debug: true,
    
    // Monde
    worldWidth: 3000,
    worldHeight: 3000,
    worldMargin: 100, // Marge de vide visible autour du monde
    
    // Caméra
    zoom: {
        min: 0.5,
        max: 3.0,
        start: 1.0,
        sensitivity: 0.001
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