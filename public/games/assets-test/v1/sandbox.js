/*
 * sandbox.js — Assets Test : bac à sable ("test en jeu").
 * On peint les tuiles retenues sur une grille pour juger le rendu en
 * contexte (assemblage, échelle, transparence), et un avatar déplaçable
 * au tap permet de vérifier les proportions personnage/décor.
 */

const SB = { grid: {}, zoom: 1, tool: "paint", sel: 0, av: null };

function sbCell() { return u(8) * SB.zoom; }
function sbToolsY() { return u(8) + u(0.8); }
function sbAreaTop() { return u(8) + u(8); }
function sbPaletteH() { return u(12); }
function sbAreaBottom() { return height - sbPaletteH(); }

function drawSandbox() {
    const cell = sbCell();
    const top = sbAreaTop(), bottom = sbAreaBottom();

    // --- Grille de fond ---
    noStroke(); fill("#1a2436"); rect(0, top, width, bottom - top);
    stroke(255, 14); strokeWeight(1);
    for (let x = 0; x <= width; x += cell) line(x, top, x, bottom);
    for (let y = top; y <= bottom; y += cell) line(0, y, width, y);

    // --- Tuiles peintes ---
    drawingContext.save();
    drawingContext.beginPath(); drawingContext.rect(0, top, width, bottom - top); drawingContext.clip();
    for (const key in SB.grid) {
        const t = AT.palette[SB.grid[key]];
        if (!t) continue;
        const [cx, cy] = key.split(",").map(Number);
        const x = cx * cell, y = top + cy * cell;
        if (x > width || y > bottom || x + cell < 0 || y + cell < top) continue;
        const img = getImage(t.url);
        if (img) image(img, x, y, cell, cell, t.sx, t.sy, t.sw, t.sh);
        else { noStroke(); fill(C.colors.panelHi); rect(x, y, cell, cell); }
    }

    // --- Avatar (lerp vers la case visée, léger rebond) ---
    if (SB.av) {
        const t = AT.palette[SB.av.i];
        if (t) {
            SB.av.x = lerp(SB.av.x, SB.av.tx, 0.12);
            SB.av.y = lerp(SB.av.y, SB.av.ty, 0.12);
            const bounce = Math.abs(Math.sin(millis() / 180)) * cell * 0.08;
            const img = getImage(t.url);
            if (img) image(img, SB.av.x * cell, top + SB.av.y * cell - bounce, cell, cell, t.sx, t.sy, t.sw, t.sh);
        }
    }
    drawingContext.restore();

    // Tap dans la zone : peindre / gommer / déplacer l'avatar
    hitZone(0, top, width, bottom - top, () => sandboxPaintAt(mouseX, mouseY));

    // --- Barre du haut + outils ---
    noStroke(); fill(C.colors.bg); rect(0, 0, width, top);
    uiTopBar("Bac à sable — " + AT.palette.length + " tuiles", () => { AT.state = "PACKS"; });

    const tools = [
        ["✏ PEINDRE", "paint"], ["⌫ GOMME", "erase"], ["🚶 AVATAR", "avatar"], ["✕ SUPPR", "del"]
    ];
    let x = u(1);
    const ty = sbToolsY(), bh = u(6);
    for (const [label, id] of tools) {
        textSize(u(1.8));
        const w = textWidth(label) + u(4);
        uiButton(label, x, ty, w, bh, { active: SB.tool === id, ts: u(1.8), fn: () => { SB.tool = id; } });
        x += w + u(0.8);
    }
    uiButton("−", x, ty, u(6), bh, { ts: u(3), fn: () => { SB.zoom = Math.max(0.4, SB.zoom / 1.3); } }); x += u(6.8);
    uiButton("+", x, ty, u(6), bh, { ts: u(3), fn: () => { SB.zoom = Math.min(4, SB.zoom * 1.3); } }); x += u(6.8);
    uiButton("VIDER", x, ty, u(11), bh, { ts: u(1.8), fn: () => { SB.grid = {}; SB.av = null; AT.dirty = true; AT.lastEdit = millis(); } });

    drawSbPalette();

    if (AT.palette.length === 0) {
        fill(C.colors.textDim); textSize(u(2.4)); textAlign(CENTER, CENTER);
        text("Palette vide : ouvre un fichier et utilise SÉLECT. puis →BAC", width / 2, (top + bottom) / 2);
    }
}

// Palette en bas d'écran : tap = choisir la tuile de peinture
function drawSbPalette() {
    const ph = sbPaletteH();
    const py = height - ph;
    noStroke(); fill(C.colors.panel); rect(0, py, width, ph);

    const s = ph - u(2);
    for (let i = 0; i < AT.palette.length; i++) {
        const t = AT.palette[i];
        const x = u(1) + i * (s + u(1));
        if (x > width) break;
        stroke(i === SB.sel ? C.colors.accent : C.colors.panelHi);
        strokeWeight(u(0.4)); fill(C.colors.bg);
        rect(x, py + u(1), s, s, u(0.8));
        const img = getImage(t.url);
        if (img) image(img, x + u(0.5), py + u(1.5), s - u(1), s - u(1), t.sx, t.sy, t.sw, t.sh);
        hitZone(x, py + u(1), s, s, () => {
            if (SB.tool === "del") {
                AT.palette.splice(i, 1);
                sbReindexAfterDelete(i);
                AT.dirty = true; AT.lastEdit = millis();
            } else {
                SB.sel = i;
            }
        });
    }
}

// Après suppression d'une tuile, réaligne les index stockés dans la grille
function sbReindexAfterDelete(removed) {
    for (const key in SB.grid) {
        if (SB.grid[key] === removed) delete SB.grid[key];
        else if (SB.grid[key] > removed) SB.grid[key]--;
    }
    if (SB.av) {
        if (SB.av.i === removed) SB.av = null;
        else if (SB.av.i > removed) SB.av.i--;
    }
    if (SB.sel >= AT.palette.length) SB.sel = Math.max(0, AT.palette.length - 1);
}

// Applique l'outil courant à la case sous (mx, my)
function sandboxPaintAt(mx, my) {
    const top = sbAreaTop(), bottom = sbAreaBottom();
    if (my < top || my > bottom || AT.state !== "SANDBOX") return;
    const cell = sbCell();
    const cx = Math.floor(mx / cell), cy = Math.floor((my - top) / cell);
    const key = cx + "," + cy;

    if (SB.tool === "paint" && AT.palette[SB.sel]) {
        if (SB.grid[key] !== SB.sel) { SB.grid[key] = SB.sel; AT.dirty = true; AT.lastEdit = millis(); }
    } else if (SB.tool === "erase") {
        if (key in SB.grid) { delete SB.grid[key]; AT.dirty = true; AT.lastEdit = millis(); }
    } else if (SB.tool === "avatar" && AT.palette[SB.sel]) {
        if (!SB.av) SB.av = { i: SB.sel, x: cx, y: cy, tx: cx, ty: cy };
        else { SB.av.i = SB.sel; SB.av.tx = cx; SB.av.ty = cy; }
    }
}

// Glissement dans le bac à sable = peinture continue
function sandboxDrag() {
    if (SB.tool === "paint" || SB.tool === "erase") sandboxPaintAt(mouseX, mouseY);
}
