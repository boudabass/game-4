/*
 * input.js — Caméra (pan/zoom/pinch) + interactions monde (tap).
 * Coordonnées : monde = grille * TILE. La caméra vise un point monde (cx, cy)
 * affiché au centre de l'écran avec un facteur zoom.
 */
window.EFCamera = {
    cx: 0, cy: 0, zoom: 1,
    MIN_ZOOM: 0.35, MAX_ZOOM: 2.5,

    center: function () {
        const C = window.EFConfig;
        const mid = (C.GRID_SIZE * C.TILE) / 2;
        this.cx = mid; this.cy = mid;
        // Zoom initial : ~14 cases visibles sur le petit côté
        const side = Math.min(window.innerWidth, window.innerHeight);
        this.zoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, side / (14 * C.TILE)));
    },

    worldToScreen: function (wx, wy) {
        return {
            x: (wx - this.cx) * this.zoom + window.innerWidth / 2,
            y: (wy - this.cy) * this.zoom + window.innerHeight / 2
        };
    },

    screenToWorld: function (sx, sy) {
        return {
            x: (sx - window.innerWidth / 2) / this.zoom + this.cx,
            y: (sy - window.innerHeight / 2) / this.zoom + this.cy
        };
    },

    screenToTile: function (sx, sy) {
        const w = this.screenToWorld(sx, sy);
        const T = window.EFConfig.TILE;
        return { x: Math.floor(w.x / T), y: Math.floor(w.y / T) };
    },

    pan: function (dxScreen, dyScreen) {
        this.cx -= dxScreen / this.zoom;
        this.cy -= dyScreen / this.zoom;
        this.clamp();
    },

    zoomAt: function (factor, sx, sy) {
        const before = this.screenToWorld(sx, sy);
        this.zoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.zoom * factor));
        const after = this.screenToWorld(sx, sy);
        this.cx += before.x - after.x;
        this.cy += before.y - after.y;
        this.clamp();
    },

    clamp: function () {
        const C = window.EFConfig;
        const max = C.GRID_SIZE * C.TILE;
        this.cx = Math.max(0, Math.min(max, this.cx));
        this.cy = Math.max(0, Math.min(max, this.cy));
    }
};

window.EFInput = {
    dragging: false,
    moved: false,
    lastX: 0, lastY: 0,
    pinchDist: 0,
    // Mode d'interaction : null | "build" | "road" | "demolish"
    mode: null,
    buildType: null,
    onTapTile: null,   // callback(tileX, tileY) fourni par main.js

    init: function (canvasEl) {
        const el = canvasEl;

        const start = (x, y) => {
            this.dragging = true; this.moved = false;
            this.lastX = x; this.lastY = y;
        };
        const move = (x, y) => {
            if (!this.dragging) return;
            const dx = x - this.lastX, dy = y - this.lastY;
            if (Math.abs(dx) + Math.abs(dy) > 4) this.moved = true;
            if (this.moved) window.EFCamera.pan(dx, dy);
            this.lastX = x; this.lastY = y;
        };
        const end = (x, y) => {
            if (this.dragging && !this.moved && this.onTapTile) {
                const t = window.EFCamera.screenToTile(x, y);
                this.onTapTile(t.x, t.y);
            }
            this.dragging = false; this.moved = false;
        };

        // Souris
        el.addEventListener("mousedown", e => start(e.clientX, e.clientY));
        window.addEventListener("mousemove", e => move(e.clientX, e.clientY));
        window.addEventListener("mouseup", e => end(e.clientX, e.clientY));

        // Molette = zoom
        el.addEventListener("wheel", e => {
            e.preventDefault();
            window.EFCamera.zoomAt(e.deltaY < 0 ? 1.12 : 0.89, e.clientX, e.clientY);
        }, { passive: false });

        // Tactile (1 doigt = pan/tap, 2 doigts = pinch zoom)
        el.addEventListener("touchstart", e => {
            if (e.touches.length === 1) {
                start(e.touches[0].clientX, e.touches[0].clientY);
            } else if (e.touches.length === 2) {
                this.dragging = false;
                this.pinchDist = this.dist2(e.touches);
            }
        }, { passive: true });

        el.addEventListener("touchmove", e => {
            e.preventDefault();
            if (e.touches.length === 1) {
                move(e.touches[0].clientX, e.touches[0].clientY);
            } else if (e.touches.length === 2) {
                const d = this.dist2(e.touches);
                if (this.pinchDist > 0) {
                    const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                    const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                    window.EFCamera.zoomAt(d / this.pinchDist, mx, my);
                }
                this.pinchDist = d;
            }
        }, { passive: false });

        el.addEventListener("touchend", e => {
            if (e.touches.length === 0) {
                end(this.lastX, this.lastY);
                this.pinchDist = 0;
            }
        });
    },

    dist2: function (touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.hypot(dx, dy);
    },

    setMode: function (mode, buildType) {
        this.mode = mode;
        this.buildType = buildType || null;
    }
};
