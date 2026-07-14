/*
 * Engine.Loader (socle partagé v2)
 * Petit écran de chargement + progression. Générique, sans logique de jeu.
 * Namespace dédié (window.Engine) pour ne PAS entrer en conflit avec les
 * anciens window.LoadingManager encore présents dans certains jeux.
 *
 * DOM optionnel attendu dans index.html :
 *   #engine-loader            (conteneur plein écran)
 *   #engine-loader-bar        (barre de progression, on ajuste sa largeur %)
 *   #engine-loader-status     (texte de statut)
 */
(function () {
    window.Engine = window.Engine || {};

    window.Engine.Loader = {
        total: 1,
        done: 0,

        // Déclare le nombre d'étapes prévues (pour la barre).
        start: function (totalSteps) {
            this.total = Math.max(1, totalSteps || 1);
            this.done = 0;
            this._render("Initialisation...");
        },

        // Avance d'une étape et met à jour le message.
        step: function (message) {
            this.done = Math.min(this.done + 1, this.total);
            this._render(message);
        },

        _render: function (message) {
            var bar = document.getElementById("engine-loader-bar");
            var status = document.getElementById("engine-loader-status");
            var pct = Math.round((this.done / this.total) * 100);
            if (bar) bar.style.width = pct + "%";
            if (status && message) status.textContent = "[" + pct + "%] " + message;
        },

        // Masque l'écran de chargement et signale à la plateforme que le jeu est prêt.
        finish: function () {
            this.done = this.total;
            this._render("Prêt.");
            var el = document.getElementById("engine-loader");
            if (el) el.style.display = "none";
            if (window.GameSystem && window.GameSystem.Lifecycle) {
                window.GameSystem.Lifecycle.notifyReady();
            }
        }
    };

    console.log("🧩 Engine.Loader v2 chargé");
})();
