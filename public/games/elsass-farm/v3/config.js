// config.js — Elsass Farm (v3, pré-production)
// Aucune taille écran en dur : le canvas remplit l'iframe, le HUD utilise u().
// Le MONDE, lui, est en unités fixes (tuiles de 64) vues à travers la caméra.
window.FarmConfig = {
    title: "Elsass Farm",

    grid: { cols: 28, rows: 18, tileSize: 64 },

    // Personnage : tuile de départ + vitesse (tuiles/seconde).
    player: { c: 14, r: 9, speed: 3.5 },

    // Zone d'action : 1 = les 8 tuiles autour du personnage.
    actionRange: 1,

    // Obstacles (décor). "rect" = zone bloquée c,r → c+w,r+h.
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
    },

    // Assets Tiny Farm (chargés dans preload())
    // Base path relative à sketch.js → ../../system/assets/
    assets: {
        base: "../../system/assets/Assets_pack/tri/",

        // Sol (ground tiles)
        sol: [
            "sol/farm_sol_butte_seul_v1.png",
            "sol/farm_sol_butte_seul_v2.png",
            "sol/farm_sol_butte_vert_haut_v1.png",
            "sol/farm_sol_butte_vert_centre_v1.png",
            "sol/farm_sol_butte_vert_bas_v1.png"
        ],

        // Décor (plantes, arbres, buissons)
        decor: [
            "decor/farm_herbe_touffe.png",
            "decor/farm_arbre_sapin_jeune.png",
            "decor/farm_arbre_sapin_moyen.png",
            "decor/farm_arbre_sapin_mature.png",
            "decor/farm_buisson_baies.png",
            "decor/farm_tournesol.png",
            "decor/farm_ble_mure.png",
            "decor/farm_carotte_mure.png",
            "decor/farm_tomate_mure.png",
            "decor/farm_chou_mure.png",
            "decor/farm_mais_mure.png",
            "decor/farm_aubergine_mure.png"
        ],

        // Personnage joueur
        perso: [
            "perso/farm_fermier_brun.png",
            "perso/farm_fermier_chapeau.png"
        ],

        // Bâtiments (grange, éléments de construction)
        batiment: [
            "batiment/farm_grange_mur_brique1_centre.png",
            "batiment/farm_grange_mur_brique1_gauche.png",
            "batiment/farm_grange_mur_brique1_droit.png",
            "batiment/farm_grange_mur_haut_centre.png",
            "batiment/farm_grange_mur_haut_gauche.png",
            "batiment/farm_grange_mur_haut_droit.png",
            "batiment/farm_grange_toit_haut_centre.png",
            "batiment/farm_grange_toit_haut_gauche.png",
            "batiment/farm_grange_toit_haut_droit.png",
            "batiment/farm_grange_toit_bas_centre.png",
            "batiment/farm_grange_toit_bas_gauche.png",
            "batiment/farm_grange_toit_bas_droit.png",
            "batiment/farm_grange_porte_gauche.png",
            "batiment/farm_grange_porte_droit.png",
            "batiment/farm_grange_fenetre.png"
        ],

        // Objets farm
        objet: [
            "objet/farm_hache.png",
            "objet/farm_pelle.png",
            "objet/farm_seau_vide.png",
            "objet/farm_seau_eau.png",
            "objet/farm_seau_lait.png",
            "objet/farm_pot_lait.png",
            "objet/farm_pain.png"
        ]
    }
};
