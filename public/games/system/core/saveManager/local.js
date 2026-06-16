// public/games/system/core/saveManager/local.js
// Persistance via localStorage

(function () {
    if (!window.SaveManager) return;

    window.SaveManager.saveLocal = function (data) {
        try {
            const json = JSON.stringify(data);
            localStorage.setItem(this.SAVE_KEY, json);
            console.log("💾 Local save OK");
            return true;
        } catch (e) {
            console.error("❌ Local save error:", e);
            return false;
        }
    };

    window.SaveManager.getLocal = function () {
        const json = localStorage.getItem(this.SAVE_KEY);
        if (!json) return null;
        try {
            return JSON.parse(json);
        } catch (e) {
            console.error("❌ Local read error:", e);
            return null;
        }
    };

    window.SaveManager.clearLocal = function () {
        localStorage.removeItem(this.SAVE_KEY);
    };

    console.log("📂 SaveManager Local Module Loaded");
})();
