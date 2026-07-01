// public/games/system/core/loadingManager/ui.js
// Mise à jour de l'interface utilisateur

(function () {
    if (!window.LoadingManager) return;

    window.LoadingManager.onUpdate = function () {
        const bar = document.getElementById('loading-progress-fill');
        if (bar) bar.style.width = this.getPercentage() + '%';

        const historyEl = document.getElementById('loading-history');
        if (historyEl && this.history.length > 0) {
            const lastMsg = this.history[this.history.length - 1];
            const p = document.createElement('p');
            p.innerText = lastMsg;
            historyEl.appendChild(p);
            historyEl.scrollTop = historyEl.scrollHeight;
        }
    };

    window.LoadingManager.finish = function () {
        const screen = document.getElementById('loading-screen');
        if (screen) screen.style.display = 'none';

        const btn = document.getElementById('play-button');
        if (btn) btn.style.display = 'block';
    };

    console.log("🎨 LoadingManager UI Module Loaded");
})();
