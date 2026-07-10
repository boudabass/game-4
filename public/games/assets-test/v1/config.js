/*
 * config.js — Assets Test (outil interne, jeu masqué du catalogue)
 * Sert à parcourir/valider/classer les packs Kenney de Assets_pack/
 * (voir documentation/ASSETS_TEST.md).
 */
window.ATConfig = {
    title: "Assets Test",

    // Statuts de tri d'un fichier
    STATUS: {
        ok:  { label: "Validé",     color: "#22c55e" },
        mod: { label: "À modifier", color: "#f59e0b" },
        ko:  { label: "Rejeté",     color: "#ef4444" }
    },

    // Catégories de classement (destination dans assets/ une fois trié).
    // Liste modifiable ici, sans toucher au reste du code.
    CATEGORIES: ["sol", "decor", "batiment", "perso", "objet", "ui", "vehicule", "eau", "son", "autre"],

    // Raisons possibles quand un fichier est "À modifier"
    REASONS: ["recolorer", "redecouper", "redimensionner", "detourer", "style", "autre"],

    // Tailles de tuile proposées pour la grille de découpe
    TILE_SIZES: [8, 16, 24, 32, 48, 64],

    // Extensions considérées comme images (affichables)
    IMG_EXT: ["png", "jpg", "jpeg", "gif", "webp"],
    // Extensions audio (testables à l'écoute)
    SND_EXT: ["ogg", "mp3", "wav"],

    // Limites de chargement des vignettes
    MAX_CACHE: 400,      // images gardées en mémoire
    MAX_LOADING: 8,      // chargements simultanés

    colors: {
        bg: "#0f172a", panel: "#1e293b", panelHi: "#334155",
        text: "#e2e8f0", textDim: "#94a3b8",
        accent: "#4f46e5", ok: "#22c55e", warn: "#f59e0b", err: "#ef4444",
        checkA: "#9ca3af", checkB: "#6b7280"
    }
};
