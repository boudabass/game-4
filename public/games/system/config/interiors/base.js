/*
    Config des Intérieurs de base.
    Définit les layouts par défaut si aucun prefab n'est dispo.
*/

window.Config = window.Config || {};
window.Config.INTERIORS = window.Config.INTERIORS || {};

// Exemple de config pour une "house" (si elle existe)
window.Config.INTERIORS['house'] = {
    id: 'house_interior',
    layout: [], // Vide = Grille vide
    fixed: false
};

// Config par défaut générique (fallback)
window.Config.INTERIORS['default'] = {
    id: 'default_interior',
    layout: [],
    fixed: false
};
