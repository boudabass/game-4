// public/games/system/core/ui/layers.js
// Centralisation des profondeurs (Z-Index)

(function () {
    console.log("📑 UI Layers Module Loaded");

    window.UILayers = {
        BACKGROUND: 0,
        GAME: 10,
        PLAYER: 100,
        HUD: 500,
        UX_SHORTCUTS: 600,
        MODAL_OVERLAY: 10000,
        MODAL_CONTENT: 10001,
        TOOLTIP: 20000,
        SYSTEM_BAR: 30000,
        LOADER: 40000
    };

    // Injection automatique des variables CSS pour les Z-Index
    const style = document.createElement('style');
    style.id = 'dyad-z-index-vars';
    let css = ':root {\n';
    for (const [key, value] of Object.entries(window.UILayers)) {
        css += `  --z-${key.toLowerCase().replace(/_/g, '-')}: ${value};\n`;
    }
    css += '}';
    style.innerHTML = css;
    document.head.appendChild(style);
})();
