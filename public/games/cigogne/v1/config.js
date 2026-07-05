// config.js — constantes du jeu Cigogne (test physique + image)
window.CigogneConfig = {
    title: "Cigogne",
    gravity: 0.5,      // accélération verticale (px/frame^2, à l'échelle u())
    flap: -8,           // impulsion du saut
    pipeGapPct: 28,      // largeur de l'ouverture en % de la hauteur écran
    pipeSpeed: 3,        // vitesse de défilement des obstacles
    pipeSpawnMs: 1600,   // intervalle d'apparition des obstacles
    birdSizePct: 8,      // taille de la cigogne en % du plus petit côté
    colors: {
        bg: "#87ceeb",
        pipe: "#2f855a",
        pipeEdge: "#22543d",
        text: "#0f172a",
        button: "#4f46e5",
        buttonText: "#ffffff"
    }
};
