/*
 * viewer.js — Assets Test : visionneuse d'un fichier.
 * Zoom/pan, fond sombre/clair/damier, grille de découpe (taille de tuile
 * réglable), sélection de tuiles vers le bac à sable, classement
 * (statut + catégorie + raisons), lecture des fichiers audio.
 */

const VW = { zoom: 1, ox: 0, oy: 0, bg: 0, grid: true, tileIdx: 1, selMode: false, sels: [] };

function viewerOpen(pack, p) {
    AT.curFile = { pack, p, key: keyFor(pack, p), url: urlFor(pack, p) };
    VW.zoom = 0; VW.ox = 0; VW.oy = 0; VW.selMode = false; VW.sels = [];
    AT.state = "VIEWER";
}

function vwTile() { return C.TILE_SIZES[VW.tileIdx]; }

function vwPanelH() {
    const d = getDec(AT.curFile.key);
    const catLines = Math.ceil(C.CATEGORIES.length / Math.floor((width - u(2)) / u(13)));
    return u(15) + catLines * u(6.5) + ((d && d.s === "mod") ? u(7) : 0);
}

function vwArea() {
    const top = u(8);
    return { x: 0, y: top, w: width, h: height - top - vwPanelH() };
}

function vwFit(img) {
    const a = vwArea();
    VW.zoom = Math.min(a.w / img.width, a.h / img.height) * 0.9;
    VW.ox = (a.w - img.width * VW.zoom) / 2;
    VW.oy = (a.h - img.height * VW.zoom) / 2;
}

function viewerDrag(dx, dy) {
    if (AT.press && AT.press.y < height - vwPanelH()) { VW.ox += dx; VW.oy += dy; }
}

function viewerWheel(e) {
    const a = vwArea();
    if (mouseY < a.y || mouseY > a.y + a.h) return;
    vwZoomAt(e.delta > 0 ? 1 / 1.15 : 1.15, mouseX - a.x, mouseY - a.y);
}

// Zoom autour d'un point (en coordonnées de la zone d'affichage)
function vwZoomAt(k, px, py) {
    const nz = constrain(VW.zoom * k, 0.05, 64);
    const r = nz / VW.zoom;
    VW.ox = px - (px - VW.ox) * r;
    VW.oy = py - (py - VW.oy) * r;
    VW.zoom = nz;
}

function drawViewer() {
    const f = AT.curFile;
    const a = vwArea();
    const d = getDec(f.key);

    // --- Zone d'affichage ---
    noStroke();
    if (VW.bg === 1) { fill("#e5e7eb"); rect(a.x, a.y, a.w, a.h); }
    else if (VW.bg === 2) drawChecker(a.x, a.y, a.w, a.h, u(3));
    else { fill(C.colors.bg); rect(a.x, a.y, a.w, a.h); }

    if (isImg(f.p)) {
        const img = getImage(f.url);
        if (img) {
            if (VW.zoom === 0) vwFit(img);   // premier affichage : ajuster

            drawingContext.save();
            drawingContext.beginPath();
            drawingContext.rect(a.x, a.y, a.w, a.h);
            drawingContext.clip();

            const ix = a.x + VW.ox, iy = a.y + VW.oy;
            image(img, ix, iy, img.width * VW.zoom, img.height * VW.zoom);

            // Grille de découpe
            const ts = vwTile() * VW.zoom;
            if (VW.grid && ts >= 4) {
                stroke(255, 90); strokeWeight(1);
                for (let gx = 0; gx <= img.width * VW.zoom + 0.5; gx += ts)
                    line(ix + gx, iy, ix + gx, iy + img.height * VW.zoom);
                for (let gy = 0; gy <= img.height * VW.zoom + 0.5; gy += ts)
                    line(ix, iy + gy, ix + img.width * VW.zoom, iy + gy);
            }

            // Tuiles sélectionnées (mode sélection)
            noStroke(); fill(79, 70, 229, 110);
            for (const s of VW.sels) {
                const [tx, ty] = s.split(",").map(Number);
                rect(ix + tx * ts, iy + ty * ts, ts, ts);
            }
            drawingContext.restore();

            // Tap dans l'image en mode sélection = choisir une tuile
            if (VW.selMode) {
                hitZone(a.x, a.y, a.w, a.h, () => {
                    const tx = Math.floor((mouseX - a.x - VW.ox) / ts);
                    const ty = Math.floor((mouseY - a.y - VW.oy) / ts);
                    if (tx < 0 || ty < 0 || tx * vwTile() >= img.width || ty * vwTile() >= img.height) return;
                    const id = tx + "," + ty;
                    const i = VW.sels.indexOf(id);
                    if (i >= 0) VW.sels.splice(i, 1); else VW.sels.push(id);
                });
            }
        } else {
            fill(C.colors.textDim); textSize(u(3)); textAlign(CENTER, CENTER);
            text("Chargement…", a.x + a.w / 2, a.y + a.h / 2);
        }
    } else if (isSnd(f.p)) {
        uiButton("▶  ÉCOUTER", a.x + a.w / 2 - u(16), a.y + a.h / 2 - u(5), u(32), u(10), {
            ts: u(3.5),
            fn: () => {
                if (AT.audio) { AT.audio.pause(); }
                AT.audio = new Audio(f.url);
                AT.audio.play();
            }
        });
    } else {
        fill(C.colors.textDim); textSize(u(2.6)); textAlign(CENTER, CENTER);
        text("Aperçu indisponible (" + fileExt(f.p) + ")", a.x + a.w / 2, a.y + a.h / 2);
    }

    // --- Barre du haut ---
    uiTopBar(fileName(f.p), () => { AT.state = "FILES"; if (AT.audio) AT.audio.pause(); });
    const img = isImg(f.p) ? getImage(f.url) : null;
    if (img) {
        fill(C.colors.textDim); textAlign(RIGHT, CENTER); textSize(u(2));
        text(img.width + "×" + img.height, width - u(1), u(4));
    }

    drawViewerPanel(f, d, img);
}

function drawViewerPanel(f, d, img) {
    const ph = vwPanelH();
    const py = height - ph;
    noStroke(); fill(C.colors.panel); rect(0, py, width, ph);

    const bw = (width - u(2)) / 7 - u(0.6);
    const bh = u(6);
    let x = u(1), y = py + u(0.8);
    const bgLabels = ["FOND: SOMBRE", "FOND: CLAIR", "FOND: DAMIER"];

    // Rangée 1 : affichage
    uiButton(bgLabels[VW.bg], x, y, bw * 1.6, bh, { ts: u(1.8), fn: () => { VW.bg = (VW.bg + 1) % 3; } }); x += bw * 1.6 + u(0.6);
    uiButton("GRILLE", x, y, bw, bh, { active: VW.grid, ts: u(1.8), fn: () => { VW.grid = !VW.grid; } }); x += bw + u(0.6);
    uiButton("T:" + vwTile(), x, y, bw, bh, { ts: u(1.8), fn: () => { VW.tileIdx = (VW.tileIdx + 1) % C.TILE_SIZES.length; VW.sels = []; } }); x += bw + u(0.6);
    uiButton("−", x, y, bw * 0.7, bh, { ts: u(3), fn: () => vwZoomAt(1 / 1.4, vwArea().w / 2, vwArea().h / 2) }); x += bw * 0.7 + u(0.6);
    uiButton("+", x, y, bw * 0.7, bh, { ts: u(3), fn: () => vwZoomAt(1.4, vwArea().w / 2, vwArea().h / 2) }); x += bw * 0.7 + u(0.6);
    uiButton("AJUSTER", x, y, bw * 1.2, bh, { ts: u(1.8), fn: () => { if (img) vwFit(img); } });

    // Rangée 2 : navigation + statut + sélection
    x = u(1); y += bh + u(0.8);
    const files = AT.curPack.files;
    const idx = files.findIndex(ff => ff.p === f.p);
    uiButton("‹", x, y, bw * 0.7, bh, { ts: u(3), fn: () => { if (idx > 0) viewerOpen(f.pack, files[idx - 1].p); } }); x += bw * 0.7 + u(0.6);
    uiButton("›", x, y, bw * 0.7, bh, { ts: u(3), fn: () => { if (idx < files.length - 1) viewerOpen(f.pack, files[idx + 1].p); } }); x += bw * 0.7 + u(0.6);

    for (const s of ["ok", "mod", "ko"]) {
        const on = d && d.s === s;
        uiButton(C.STATUS[s].label.toUpperCase(), x, y, bw * 1.3, bh, {
            active: on, bg: C.STATUS[s].color, ts: u(1.7),
            fn: () => setDec(f.key, { s: on ? null : s })
        });
        x += bw * 1.3 + u(0.6);
    }
    if (img) {
        uiButton("SÉLECT.", x, y, bw, bh, { active: VW.selMode, ts: u(1.7), fn: () => { VW.selMode = !VW.selMode; } }); x += bw + u(0.6);
        const n = VW.sels.length;
        uiButton("→BAC" + (n ? " (" + n + ")" : ""), x, y, bw * 1.1, bh, { ts: u(1.7), fn: () => vwAddToPalette(img) });
    }

    // Rangée 3 : catégories (retour à la ligne automatique)
    x = u(1); y += bh + u(0.8);
    textSize(u(1.8));
    for (const cat of C.CATEGORIES) {
        const w = textWidth(cat.toUpperCase()) + u(4);
        if (x + w > width - u(1)) { x = u(1); y += u(6.5); }
        const on = d && d.cat === cat;
        uiButton(cat.toUpperCase(), x, y, w, u(5.5), {
            active: on, ts: u(1.8),
            fn: () => setDec(f.key, { cat: on ? null : cat })
        });
        x += w + u(0.8);
    }

    // Rangée 4 : raisons (seulement si "À modifier")
    if (d && d.s === "mod") {
        x = u(1); y += u(6.5) + u(0.5);
        for (const r of C.REASONS) {
            const w = textWidth(r) + u(4);
            if (x + w > width - u(1)) break; // pas de 2e ligne pour les raisons
            const why = (d.why || []);
            const on = why.includes(r);
            uiButton(r, x, y, w, u(5.5), {
                active: on, bg: C.colors.warn, ts: u(1.8),
                fn: () => {
                    const list = (getDec(f.key).why || []).slice();
                    const i = list.indexOf(r);
                    if (i >= 0) list.splice(i, 1); else list.push(r);
                    setDec(f.key, { why: list });
                }
            });
            x += w + u(0.8);
        }
    }
}

// Envoie les tuiles sélectionnées (ou l'image entière) vers le bac à sable
function vwAddToPalette(img) {
    const f = AT.curFile;
    const t = vwTile();
    if (VW.sels.length === 0) {
        AT.palette.push({ url: f.url, pack: f.pack, p: f.p, sx: 0, sy: 0, sw: img.width, sh: img.height });
    } else {
        for (const s of VW.sels) {
            if (AT.palette.length >= 24) break;
            const [tx, ty] = s.split(",").map(Number);
            AT.palette.push({ url: f.url, pack: f.pack, p: f.p, sx: tx * t, sy: ty * t, sw: t, sh: t });
        }
        VW.sels = [];
    }
    while (AT.palette.length > 24) AT.palette.shift();
    AT.dirty = true; AT.lastEdit = millis();
}
