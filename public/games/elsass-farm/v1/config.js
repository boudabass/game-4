const Config = {
    debug: true,
    
    // Taille de la zone de jeu (fixe pour chaque vue)
    zoneWidth: 800,
    zoneHeight: 600,
    
    // Caméra
    zoom: {
        min: 0.5,
        max: 3.0,
        start: 1.0,
        sensitivity: 0.001
    },
    
    // Définition des 9 Zones (3x3)
    zones: [
        // Ligne 1 (Nord)
        { id: 'N_W', name: 'Mine', bgColor: '#34495e' },
        { id: 'N_C', name: 'Montagne', bgColor: '#7f8c8d' },
        { id: 'N_E', name: 'Forêt', bgColor: '#27ae60' },
        // Ligne 2 (Centre)
        { id: 'C_W', name: 'Ville', bgColor: '#95a5a6' },
        { id: 'C_C', name: 'Ferme Principale', bgColor: '#2ecc71' }, // Zone de départ
        { id: 'C_E', name: 'Riviere', bgColor: '#3498db' },
        // Ligne 3 (Sud)
        { id: 'S_W', name: 'Marais', bgColor: '#16a085' },
        { id: 'S_C', name: 'Champs Sud', bgColor: '#f39c12' },
        { id: 'S_E', name: 'Plage', bgColor: '#f1c40f' }
    ],
    
    // Couleurs
    colors: {
        gridLines: 'rgba(255, 255, 255, 0.1)'
    }
};

window.ElsassFarm = {
    state: {
        currentZoneId: 'C_C' // Démarrage sur la Ferme Principale
    }
};