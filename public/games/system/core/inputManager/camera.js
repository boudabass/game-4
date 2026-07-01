// public/games/system/core/inputManager/camera.js
// Contraintes et gestion caméra

(function () {
    if (!window.InputManager) return;

    window.InputManager.constrainCamera = function (camera, width, height, zoneConfig) {
        if (!camera || !zoneConfig) return;

        const margin = zoneConfig.margin || 0;
        const zWidth = zoneConfig.width || 1000;
        const zHeight = zoneConfig.height || 1000;
        const zoom = camera.zoom || 1.0;

        const halfW = zWidth / 2;
        const halfH = zHeight / 2;

        const minX = -halfW - margin + (width / 2) / zoom;
        const maxX = halfW + margin - (width / 2) / zoom;
        const minY = -halfH - margin + (height / 2) / zoom;
        const maxY = halfH + margin - (height / 2) / zoom;

        if (minX > maxX) camera.x = 0;
        else camera.x = Math.max(minX, Math.min(camera.x, maxX));

        if (minY > maxY) camera.y = 0;
        else camera.y = Math.max(minY, Math.min(camera.y, maxY));
    };

    console.log("📸 InputManager Camera Module Loaded");
})();
