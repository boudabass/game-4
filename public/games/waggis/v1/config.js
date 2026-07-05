// config.js — constantes du jeu Waggis (style Frogger / Crossy Road, vue du dessus)
window.WaggisConfig = {
    title: "Waggis",
    cols: 9,               // nombre de colonnes de la grille
    checkpointEvery: 6,    // une ligne sûre forcée tous les N rangs
    waterMaxStreak: 2,     // pas plus de N lignes d'eau consécutives
    bretzelChance: 0.35,   // proba d'un bretzel sur une ligne sûre/route
    bretzelPoints: 3,
    colors: {
        bg: "#cfe8f0",
        safe: "#e9f5e1",
        safeEdge: "#c9e6b8",
        road: "#5f6b73",
        roadLine: "#e8c948",
        water: "#3f8fd1",
        waterEdge: "#2f6ea3",
        barrel: "#7a3a28",
        barrelBand: "#3a2416",
        vestRed: "#c1272d",
        shirt: "#f5f0e6",
        pants: "#2b3a42",
        skin: "#eab98c",
        hat: "#1c1c1c",
        nose: "#d1495b",
        text: "#0f172a",
        button: "#4f46e5",
        buttonText: "#ffffff",
        bretzel: "#8a5a2b"
    }
};
