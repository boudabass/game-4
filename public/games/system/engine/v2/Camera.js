/*
 * Engine.Camera (socle partagé v2)
 * Caméra 2D : suit une cible (lerp doux), zoom par paliers (boutons + / −,
 * jamais de pincement requis — pilier 100 % clic/tap).
 *
 * Utilisation dans draw() :
 *   push(); Engine.Camera.apply();   // dessiner le MONDE ici
 *   pop();                           // puis le HUD en coordonnées écran
 *
 * Conversion d'un clic écran -> monde : Engine.Camera.screenToWorld(mx, my).
 */
(function () {
    window.Engine = window.Engine || {};

    window.Engine.Camera = {
        x: 0, y: 0,        // point du monde affiché au centre de l'écran
        zoom: 1,
        minZoom: 0.5,
        maxZoom: 2.5,
        zoomStep: 1.25,    // facteur appliqué à chaque clic + / −
        lerp: 0.12,        // douceur du suivi (0..1, 1 = instantané)

        _worldW: 0, _worldH: 0, // bornes optionnelles (clamp)

        configure: function (opts) {
            opts = opts || {};
            if (typeof opts.minZoom === "number") this.minZoom = opts.minZoom;
            if (typeof opts.maxZoom === "number") this.maxZoom = opts.maxZoom;
            if (typeof opts.zoomStep === "number") this.zoomStep = opts.zoomStep;
            if (typeof opts.lerp === "number") this.lerp = opts.lerp;
            if (typeof opts.zoom === "number") this.zoom = opts.zoom;
            return this;
        },

        // Bornes du monde (en unités monde) pour ne pas montrer le vide.
        setWorldBounds: function (w, h) { this._worldW = w; this._worldH = h; },

        // Place la caméra immédiatement (spawn, chargement de sauvegarde).
        snapTo: function (wx, wy) { this.x = wx; this.y = wy; this._clamp(); },

        // Suit une cible en douceur — à appeler à chaque frame.
        follow: function (wx, wy) {
            this.x += (wx - this.x) * this.lerp;
            this.y += (wy - this.y) * this.lerp;
            this._clamp();
        },

        zoomIn: function () { this.setZoom(this.zoom * this.zoomStep); },
        zoomOut: function () { this.setZoom(this.zoom / this.zoomStep); },
        setZoom: function (z) {
            this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, z));
            this._clamp();
        },

        // Applique la transformation p5 (à l'intérieur d'un push()/pop()).
        apply: function () {
            translate(width / 2, height / 2);
            scale(this.zoom);
            translate(-this.x, -this.y);
        },

        screenToWorld: function (sx, sy) {
            return {
                x: (sx - width / 2) / this.zoom + this.x,
                y: (sy - height / 2) / this.zoom + this.y
            };
        },

        worldToScreen: function (wx, wy) {
            return {
                x: (wx - this.x) * this.zoom + width / 2,
                y: (wy - this.y) * this.zoom + height / 2
            };
        },

        // Garde la vue dans les bornes du monde (si définies et si possible).
        _clamp: function () {
            if (!this._worldW || !this._worldH || typeof width === "undefined") return;
            var halfW = width / 2 / this.zoom;
            var halfH = height / 2 / this.zoom;
            // Si le monde est plus petit que l'écran, on centre.
            if (this._worldW <= halfW * 2) this.x = this._worldW / 2;
            else this.x = Math.min(this._worldW - halfW, Math.max(halfW, this.x));
            if (this._worldH <= halfH * 2) this.y = this._worldH / 2;
            else this.y = Math.min(this._worldH - halfH, Math.max(halfH, this.y));
        }
    };
})();
