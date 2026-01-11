const Config = {
    debug: true,
    showGrid: true, // Nouvel état

    // Taille de la zone de jeu (Calculé dynamiquement dans GridSystem)
    // zoneWidth: 672,
    // zoneHeight: 672,
    worldMargin: 64, // Marge réduite car grille plus petite

    // Zones de Transition (Portails) - Gardé pour la logique de clic, mais non dessiné
    portal: {
        size: 64 * 3,
        margin: 64 * 3,
        color: 'rgba(255, 255, 255, 0.0)' // Rendu invisible
    },

    // Caméra
    zoom: {
        min: 0.5,
        max: 3.0,
        start: 1.0,
        sensitivity: 0.001
    },

    // Définition des 9 Zones (3x3) - Couleurs Pastels
    zones: [
        // Ligne 1 (Nord)
        { id: 'N_W', name: 'Mine', bgColor: '#a4b0be' }, // Gris clair/bleuté
        { id: 'N_C', name: 'Montagne', bgColor: '#c8d6e5' }, // Gris très clair
        { id: 'N_E', name: 'Forêt', bgColor: '#7bed9f' }, // Vert menthe
        // Ligne 2 (Centre)
        { id: 'C_W', name: 'Ville', bgColor: '#f9ca24' }, // Jaune doux
        { id: 'C_C', name: 'Ferme Principale', bgColor: '#55efc4' }, // Turquoise clair (Zone de départ)
        { id: 'C_E', name: 'Riviere', bgColor: '#70a1ff' }, // Bleu ciel
        // Ligne 3 (Sud)
        { id: 'S_W', name: 'Marais', bgColor: '#ff7979' }, // Rouge/Rose doux
        { id: 'S_C', name: 'Champs Sud', bgColor: '#ffbe76' }, // Orange pêche
        { id: 'S_E', name: 'Plage', bgColor: '#ffeaa7' } // Jaune sable
    ],

    // Couleurs
    colors: {
        gridLines: 'rgba(0, 0, 0, 0.3)' // Noir semi-transparent
    },

    // === GRILLE MONDIALE ===
    GRID_SIZE: 41,              // Grille 41x41
    TILE_SIZE: 32,             // Taille d'une case en pixels

    // === ASSETS ===
    assets: {
        groundPath: '/games/system/assets/ground/',
        groundPrefix: 'FieldsTile_',
        groundCount: 64
    },

    // === MAP FIXE ===
    // Définit la map de base avec routes, bâtiments, zones vides
    // Types possibles : 'empty', 'road', 'building', 'field_zone'
    worldMap: null, // Sera initialisée dans GridSystem.init()

    // === ZONES MODIFIABLES ===
    // Rectangles où le joueur peut placer des champs, machines, etc.
    modifiableZones: [
        {
            col: 10,
            row: 10,
            width: 5,
            height: 5,
            name: 'Zone de Champs Principale',
            allowedTypes: ['planted', 'growing', 'ready'] // Types de cellules autorisés
        }
        // Ajouter d'autres zones selon le game design
    ],

    // === SYSTÈME DE PERSONNAGE ===
    showWorldGrid: true,        // Afficher la grille mondiale (debug)
    enablePlayerMovement: true, // Activer le déplacement du joueur
    playerStartPos: { col: 20, row: 20 }, // Position de départ du joueur (centre de 41x41)

    // === FARMING (conservé pour compatibilité) ===
    GROWTH_DURATION: 10,        // Jours pour qu'une culture arrive à maturité

    // === DEFINITIONS D'ITEMS (Pour l'inventaire) ===
    // Évite de stocker les noms et icônes dans la sauvegarde
    ITEM_DEFINITIONS: {
        // Graines / Plantes
        potato: { name: 'Pomme de terre', icon: '🥔', season: 'SPRING' },
        leek: { name: 'Poireau', icon: '🧅', season: 'SPRING' },
        cabbage: { name: 'Chou', icon: '🥬', season: 'SPRING' },
        radish: { name: 'Radis', icon: '🌱', season: 'SPRING' },
        blueberry: { name: 'Bleuets', icon: '🫐', season: 'SUMMER' },
        beans: { name: 'Haricots', icon: '🫘', season: 'SUMMER' },
        pepper: { name: 'Piment', icon: '🌶️', season: 'SUMMER' },
        melon: { name: 'Melon', icon: '🍈', season: 'SUMMER' },
        eggplant: { name: 'Aubergine', icon: '🍆', season: 'AUTUMN' },
        pumpkin: { name: 'Potiron', icon: '🎃', season: 'AUTUMN' },
        squash: { name: 'Citrouille', icon: '🎃', season: 'AUTUMN' },
        mushroom: { name: 'Champignon', icon: '🍄', season: 'AUTUMN' },
        garlic: { name: 'Ail', icon: '🧄', season: 'WINTER' },
        artichoke: { name: 'Artichaut', icon: '🌿', season: 'WINTER' },

        // Outils
        watering_can: { name: 'Arrosoir', icon: '💧' },
        pickaxe: { name: 'Pioche', icon: '⛏️' },
        axe: { name: 'Hache', icon: '🪓' },
        sword: { name: 'Épée', icon: '🗡️' },
        wand: { name: 'Baguette', icon: '✨' },
        special: { name: 'Spécial', icon: '🔧' },

        // Loot / Ressources
        log: { name: 'Bûches', icon: '🪵' },
        coal: { name: 'Charbon', icon: '💎' },
        plank: { name: 'Planche', icon: '🪵' },
        stick: { name: 'Bâton', icon: '🥢' },
        stone: { name: 'Pierre', icon: '🪨' },
        concrete: { name: 'Béton', icon: '🧱' },
        brick: { name: 'Brique', icon: '🧱' },
        gravel: { name: 'Gravier', icon: '⚪' },
        iron_ore: { name: 'Fer (Minerai)', icon: '🪨' },
        iron_ingot: { name: 'Fer (Lingot)', icon: '🥈' },
        copper_ore: { name: 'Cuivre (Minerai)', icon: '🪨' },
        copper_ingot: { name: 'Cuivre (Lingot)', icon: '🥉' },
        workbench: { name: 'Établi', icon: '🔨' },
        furnace: { name: 'Four', icon: '🔥' },
        herbalist: { name: 'Herbaliste', icon: '⚗️' },
        research: { name: 'Recherche', icon: '🔬' },
        wild_berry: { name: 'Baies Sauvages', icon: '🫐' },
        wild_mushroom: { name: 'Champi. Sauvage', icon: '🍄' },
        herb: { name: 'Herbe', icon: '🌿' },
        flower: { name: 'Fleur', icon: '🌸' },
        potion_health: { name: 'Santé', icon: '❤️' },
        potion_energy: { name: 'Énergie', icon: '⚡' },
        potion_speed: { name: 'Vitesse', icon: '👟' },
        potion_force: { name: 'Force', icon: '💪' }
    }
};

window.ElsassFarm = {
    state: {
        currentZoneId: 'C_C'
    }
};