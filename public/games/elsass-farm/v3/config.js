// config.js — Prototype gray-box Elsass Farm (v3, pré-production)
// Aucune taille écran en dur : le canvas remplit l'iframe, le HUD utilise u().
// Le MONDE, lui, est en unités fixes (tuiles de 64) vues à travers la caméra.
window.FarmConfig = {
    title: "Elsass Farm — gray-box",

    grid: { cols: 28, rows: 18, tileSize: 64 },

    // Personnage : tuile de départ + vitesse (tuiles/seconde).
    player: { c: 14, r: 9, speed: 3.5 },

    // Zone d'action : 1 = les 8 tuiles autour du personnage.
    actionRange: 1,

    // Obstacles gray-box (à contourner). "rect" = zone bloquée c,r → c+w,r+h.
    obstacles: {
        rects: [
            { c: 4,  r: 3,  w: 4, h: 3 },   // future mare
            { c: 20, r: 12, w: 5, h: 2 },   // future grange
            { c: 11, r: 14, w: 2, h: 2 }    // futur rocher
        ],
        singles: [
            { c: 9,  r: 6 }, { c: 10, r: 6 }, { c: 17, r: 4 },
            { c: 18, r: 8 }, { c: 6,  r: 11 }, { c: 22, r: 5 },
            { c: 15, r: 12 }, { c: 3,  r: 15 }
        ]
    },

    colors: {
        bg: "#1a2c1a",          // hors monde
        ground: "#2e4a2e",      // sol
        gridLine: "rgba(255,255,255,0.10)",
        blocked: "rgba(130,130,130,0.85)",
        player: "#ffb74d",
        zone: "rgba(255,235,59,0.55)",
        path: "rgba(255,235,59,0.8)",
        actionFlash: "rgba(102,187,106,0.75)",
        moveMarker: "rgba(79,195,247,0.9)",
        hudText: "#e2e8f0",
        hudPanel: "rgba(15,23,42,0.75)",
        button: "#4f46e5",
        buttonText: "#ffffff"
    }
};
