// public/games/system/core/saveManager/cloud.js
// Synchronisation Cloud

(function () {
    if (!window.SaveManager) return;

    window.SaveManager.saveCloud = async function (data) {
        if (!window.GameSystem || !window.GameSystem.Save) {
            console.warn("⚠️ GameSystem.Save not available");
            return false;
        }
        return await window.GameSystem.Save.write(data);
    };

    window.SaveManager.getCloud = async function () {
        if (!window.GameSystem || !window.GameSystem.Save) {
            console.warn("⚠️ GameSystem.Save not available");
            return null;
        }
        return await window.GameSystem.Save.read();
    };

    console.log("☁️ SaveManager Cloud Module Loaded");
})();
