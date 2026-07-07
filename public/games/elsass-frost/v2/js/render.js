/*
 * render.js — Dessin du monde en p5 (mode global) :
 * sol enneigé, halo de chaleur, routes, bâtiments (emoji), fantôme de
 * placement, flocons. L'UI (HUD, menus) est en HTML par-dessus.
 */
window.EFRender = {
    flakes: [],

    initFlakes: function () {
        this.flakes = [];
        for (let i = 0; i < 60; i++) {
            this.flakes.push({
                x: Math.random(), y: Math.random(),
                s: 0.5 + Math.random(), v: 0.3 + Math.random() * 0.7
            });
        }
    },

    drawWorld: function () {
        const C = window.EFConfig, S = window.EFState, cam = window.EFCamera;
        const T = C.TILE, N = C.GRID_SIZE;

        background(16, 26, 38); // nuit polaire autour de la carte

        // --- Sol ---
        const p0 = cam.worldToScreen(0, 0);
        const size = N * T * cam.zoom;
        noStroke();
        // Teinte du sol selon la saison (hiver blanc, été plus végétal...)
        const tint = window.EFTime.seasonOf(S.day).groundTint;
        fill(tint[0], tint[1], tint[2]);
        rect(p0.x, p0.y, size, size);

        // --- Halo de chaleur du générateur ---
        const gen = S.buildings.find(b => b.type === "generator");
        if (gen && gen.on && S.generatorLevel > 0) {
            const gd = C.BUILDINGS.generator;
            const c = cam.worldToScreen((gen.x + gd.w / 2) * T, (gen.y + gd.h / 2) * T);
            const r = C.GENERATOR.RADIUS * T * cam.zoom;
            fill(255, 140, 50, 26);
            circle(c.x, c.y, r * 2);
            fill(255, 160, 60, 20);
            circle(c.x, c.y, r * 1.4);
        }
        for (const hub of S.buildings) {
            if (hub.type !== "steam_hub" || !hub.on) continue;
            const hd = C.BUILDINGS.steam_hub;
            const c = cam.worldToScreen((hub.x + hd.w / 2) * T, (hub.y + hd.h / 2) * T);
            const r = C.STEAM_HUB.RADIUS * T * cam.zoom;
            fill(255, 150, 60, 22);
            circle(c.x, c.y, r * 2);
        }

        // --- Quadrillage discret (seulement en mode construction) ---
        if (window.EFInput.mode) {
            stroke(150, 165, 180, 70);
            strokeWeight(1);
            for (let i = 0; i <= N; i++) {
                const a = cam.worldToScreen(i * T, 0);
                const b = cam.worldToScreen(i * T, N * T);
                line(a.x, a.y, b.x, b.y);
                const c = cam.worldToScreen(0, i * T);
                const d = cam.worldToScreen(N * T, i * T);
                line(c.x, c.y, d.x, d.y);
            }
            noStroke();
        }

        // --- Routes ---
        noStroke();
        fill(120, 105, 90);
        for (const r of S.roads) {
            const p = cam.worldToScreen(r.x * T, r.y * T);
            rect(p.x, p.y, T * cam.zoom + 0.5, T * cam.zoom + 0.5);
        }

        // --- Bâtiments ---
        textAlign(CENTER, CENTER);
        for (let i = 0; i < S.buildings.length; i++) {
            const b = S.buildings[i];
            const def = C.BUILDINGS[b.type];
            const p = cam.worldToScreen(b.x * T, b.y * T);
            const w = def.w * T * cam.zoom, h = def.h * T * cam.zoom;

            // Socle
            fill(58, 74, 92);
            stroke(30, 42, 56);
            strokeWeight(Math.max(1, cam.zoom));
            rect(p.x + 1, p.y + 1, w - 2, h - 2, 4 * cam.zoom);

            // Alerte : pas de staff sur un bâtiment qui en demande
            if (def.staff && b.staff === 0) {
                fill(220, 90, 60);
                noStroke();
                circle(p.x + w - 7 * cam.zoom, p.y + 7 * cam.zoom, 8 * cam.zoom);
            }
            noStroke();
            fill(255);
            textSize(Math.min(w, h) * 0.55);
            text(def.icon, p.x + w / 2, p.y + h / 2);
        }

        // --- Fantôme de placement ---
        this.drawGhost();

        // --- Flocons (au-dessus de tout le monde) ---
        this.drawFlakes();
    },

    drawGhost: function () {
        const I = window.EFInput;
        if (!I.mode || I.dragging) return;
        const cam = window.EFCamera, C = window.EFConfig, T = C.TILE;
        // Position : dernier point connu du pointeur
        const t = cam.screenToTile(I.lastX || windowWidth / 2, I.lastY || windowHeight / 2);

        if (I.mode === "build" && I.buildType) {
            const def = C.BUILDINGS[I.buildType];
            const ok = window.EFGrid.canPlace(t.x, t.y, def.w, def.h) &&
                window.EFBuildings.canAfford(I.buildType);
            const p = cam.worldToScreen(t.x * T, t.y * T);
            fill(ok ? color(80, 200, 120, 110) : color(220, 80, 80, 110));
            noStroke();
            rect(p.x, p.y, def.w * T * cam.zoom, def.h * T * cam.zoom, 4 * cam.zoom);
            fill(255, 230);
            textSize(Math.min(def.w, def.h) * T * cam.zoom * 0.5);
            textAlign(CENTER, CENTER);
            text(def.icon, p.x + def.w * T * cam.zoom / 2, p.y + def.h * T * cam.zoom / 2);
        } else if (I.mode === "road") {
            const ok = window.EFGrid.isFree(t.x, t.y);
            const p = cam.worldToScreen(t.x * T, t.y * T);
            fill(ok ? color(160, 140, 110, 140) : color(220, 80, 80, 110));
            noStroke();
            rect(p.x, p.y, T * cam.zoom, T * cam.zoom);
        } else if (I.mode === "demolish") {
            const p = cam.worldToScreen(t.x * T, t.y * T);
            fill(220, 80, 80, 90);
            noStroke();
            rect(p.x, p.y, T * cam.zoom, T * cam.zoom);
        }
    },

    drawFlakes: function () {
        const S = window.EFState;
        // Plus il fait froid, plus il neige
        const intensity = Math.min(1, Math.max(0.2, -S.outsideTemp / 60));
        noStroke();
        fill(255, 255, 255, 180);
        const n = Math.floor(this.flakes.length * intensity);
        for (let i = 0; i < n; i++) {
            const f = this.flakes[i];
            f.y += f.v * 0.002 * (deltaTime / 16.6);
            f.x += Math.sin(frameCount * 0.01 + i) * 0.0004;
            if (f.y > 1) { f.y = -0.02; f.x = Math.random(); }
            circle(f.x * width, f.y * height, f.s * Math.min(width, height) * 0.006);
        }
    }
};
