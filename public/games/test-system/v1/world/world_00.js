window.World_00 = {
    // Configuration de la carte
    config: {
        GRID_SIZE: 41,
        TILE_SIZE: 32
    },

    // Éléments à placer
    elements: [
        {
            type: 'building',
            id: 'generator',
            col: 20, // cx = Math.floor(41 / 2) = 20
            row: 20, // cy = Math.floor(41 / 2) = 20
            w: 3,
            h: 3,
            is_map: true
        },
        {
            type: 'zone',
            id: 'natural',
            col: 24, // cx + 8 = 28
            row: 20, // cy = 20
            w: 4,
            h: 4,
            is_map: true,
            amount: 500
        },
        {
            type: 'building',
            id: 'gatherers',
            col: 24, // cx + 8 = 28
            row: 20, // cy = 20
            w: 4,
            h: 4,
        },
        {
            type: 'zone',
            id: 'wood_wall',
            col: 14, // cx + 8 = 28
            row: 20, // cy = 20
            w: 5,
            h: 5,
            is_map: true,
            amount: 5000
        },
        {
            type: 'zone',
            id: 'wood_stack',
            col: 20, // cx + 8 = 28
            row: 17, // cy = 20
            w: 2,
            h: 2,
            is_map: true,
            amount: 50
        },
        {
            type: 'zone',
            id: 'coal_wall',
            col: 14, // cx + 8 = 28
            row: 27, // cy = 20
            w: 5,
            h: 5,
            is_map: true,
            amount: 5000
        },
        {
            type: 'zone',
            id: 'coal_stack',
            col: 20, // cx + 8 = 28
            row: 24, // cy = 20
            w: 2,
            h: 2,
            is_map: true,
            amount: 500
        },
        {
            type: 'building',
            id: 'road',
            col: 19,
            row: 19,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 20,
            row: 19,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 21,
            row: 19,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 22,
            row: 19,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 23,
            row: 19,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 23,
            row: 20,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 23,
            row: 21,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 23,
            row: 22,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 23,
            row: 23,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 22,
            row: 23,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 21,
            row: 23,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 20,
            row: 23,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 19,
            row: 23,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 19,
            row: 22,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 19,
            row: 21,
            w: 1,
            h: 1,
            is_map: true
        },
        {
            type: 'building',
            id: 'road',
            col: 19,
            row: 20,
            w: 1,
            h: 1
        }
    ]
};
