const Config = {
    debug: true,
    
    // Taille de la zone de jeu (chaque zone est un grand monde)
    zoneWidth: 3000,
    zoneHeight: 3000,
    worldMargin: 100, // Marge de vide visible autour du monde
    
    // Zones de Transition (Portails)
    portal: {
        size: 64 * 3, // 3 tuiles de large/haut
        margin: 64 * 3, // Marge pour centrer le portail
        color: 'rgba(255, 255, 255, 0.2)' // Couleur de la zone cliquable
    },
    
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
        { id: 'N_W', name: 'Mine', bgColor: '#34495e', neighbors: { E: 'N_C', S: 'C_W' } },
        { id: 'N_C', name: 'Montagne', bgColor: '#7f8c8d', neighbors: { W: 'N_W', E: 'N_E', S: 'C_C' } },
        { id: 'N_E', name: 'Forêt', bgColor: '#27ae60', neighbors: { W: 'N_C', S: 'C_E' } },
        // Ligne 2 (Centre)
        { id: 'C_W', name: 'Ville', bgColor: '#95a5a6', neighbors: { N: 'N_W', E: 'C_C', S: 'S_W' } },
        { id: 'C_C', name: 'Ferme Principale', bgColor: '#2ecc71', neighbors: { N: 'N_C', W: 'C_W', E: 'C_E', S: 'S_C' } }, // Zone de départ
        { id: 'C_E', name: 'Riviere', bgColor: '#3498db', neighbors: { N: 'N_E', W: 'C_C', S: 'S_E' } },
        // Ligne 3 (Sud)
        { id: 'S_W', name: 'Marais', bgColor: '#16a085', neighbors: { N: 'C_W', E: 'S_C' } },
        { id: 'S_C', name: 'Champs Sud', bgColor: '#f39c12', neighbors: { N: 'C_C', W: 'S_W', E: 'S_E' } },
        { id: 'S_E', name: 'Plage', bgColor: '#f1c40f', neighbors: { N: 'C_E', W: 'S_C' } }
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