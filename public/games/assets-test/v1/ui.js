/*
 * ui.js — Assets Test : état global + petite boîte à outils d'interface.
 * Principe "immediate mode" : chaque frame redessine tout et ré-enregistre
 * les zones cliquables dans AT.hits ; le tap est résolu au relâchement
 * (pour distinguer un tap d'un glissement de scroll/pan). 100% clic/tap.
 */

const AT = {
    state: "PACKS",      // PACKS | FILES | VIEWER | SANDBOX
    scan: null,          // résultat de /api/assets/scan
    scanError: null,
    decisions: {},       // "pack/chemin" -> { s, cat, why, t }
    palette: [],         // tuiles retenues pour le bac à sable
    dirty: false,
    lastEdit: 0,
    saveState: "",       // "", "saving", "saved"
    cache: new Map(),    // url -> { img, err }
    loading: 0,
    queue: [],
    hits: [],
    press: null,         // { x, y, moved } — geste en cours
    curPack: null,
    curFile: null,
    filter: "all",
    packsScroll: 0,
    filesScroll: 0,
    audio: null
};

const C = window.ATConfig;

// u(n) = n % du plus petit côté (règle plateforme : jamais de px en dur)
function u(n) { return (Math.min(width, height) * n) / 100; }

// ---------- Zones cliquables ----------
function hitZone(x, y, w, h, fn) { AT.hits.push({ x, y, w, h, fn }); }

function uiTap(mx, my) {
    for (let i = AT.hits.length - 1; i >= 0; i--) {
        const z = AT.hits[i];
        if (mx >= z.x && mx <= z.x + z.w && my >= z.y && my <= z.y + z.h) { z.fn(); return true; }
    }
    return false;
}

// Bouton générique. o = { active, bg, fg, ts, fn }
function uiButton(label, x, y, w, h, o) {
    o = o || {};
    noStroke();
    fill(o.active ? (o.bg || C.colors.accent) : (o.bg2 || C.colors.panelHi));
    rect(x, y, w, h, u(1));
    fill(o.fg || C.colors.text);
    textAlign(CENTER, CENTER);
    textSize(o.ts || u(2.4));
    text(label, x + w / 2, y + h / 2);
    if (o.fn) hitZone(x, y, w, h, o.fn);
}

// Barre du haut commune : retour + titre. Retourne sa hauteur.
function uiTopBar(title, onBack) {
    const h = u(8);
    noStroke(); fill(C.colors.panel); rect(0, 0, width, h);
    if (onBack) uiButton("←", u(1), u(1), u(9), h - u(2), { fn: onBack, ts: u(4) });
    fill(C.colors.text); textAlign(LEFT, CENTER); textSize(u(3));
    text(fitText(title, width - u(26)), onBack ? u(12) : u(2), h / 2);
    return h;
}

// Tronque un texte pour tenir dans maxW (avec "…")
function fitText(s, maxW) {
    if (textWidth(s) <= maxW) return s;
    while (s.length > 1 && textWidth(s + "…") > maxW) s = s.slice(0, -1);
    return s + "…";
}

// ---------- Fichiers : helpers ----------
function fileExt(p) { const i = p.lastIndexOf("."); return i < 0 ? "" : p.slice(i + 1).toLowerCase(); }
function isImg(p) { return C.IMG_EXT.includes(fileExt(p)); }
function isSnd(p) { return C.SND_EXT.includes(fileExt(p)); }
function fileName(p) { const i = p.lastIndexOf("/"); return i < 0 ? p : p.slice(i + 1); }

function urlFor(pack, p) {
    const segs = (pack + "/" + p).split("/").map(encodeURIComponent);
    return AT.scan.root + "/" + segs.join("/");
}

function keyFor(pack, p) { return pack + "/" + p; }
function getDec(key) { return AT.decisions[key] || null; }

function setDec(key, patch) {
    const d = AT.decisions[key] || {};
    Object.assign(d, patch, { t: Date.now() });
    AT.decisions[key] = d;
    AT.dirty = true;
    AT.lastEdit = millis();
}

function statusColor(key) {
    const d = getDec(key);
    return d && d.s ? C.STATUS[d.s].color : C.colors.panelHi;
}

// ---------- Cache d'images (chargement paresseux, limité) ----------
function getImage(url) {
    const e = AT.cache.get(url);
    if (e) return e.img;
    AT.cache.set(url, { img: null, err: false });
    AT.queue.push(url);
    pumpQueue();
    return null;
}

function pumpQueue() {
    while (AT.loading < C.MAX_LOADING && AT.queue.length) {
        const url = AT.queue.shift();
        AT.loading++;
        loadImage(url,
            (img) => { AT.loading--; const e = AT.cache.get(url); if (e) e.img = img; evictCache(); pumpQueue(); },
            () => { AT.loading--; const e = AT.cache.get(url); if (e) e.err = true; pumpQueue(); }
        );
    }
}

// Vide les plus anciennes entrées chargées (sauf celles de la palette / en cours)
function evictCache() {
    if (AT.cache.size <= C.MAX_CACHE) return;
    const keep = new Set(AT.palette.map(t => t.url));
    if (AT.curFile) keep.add(urlFor(AT.curFile.pack, AT.curFile.p));
    for (const [url, e] of AT.cache) {
        if (AT.cache.size <= C.MAX_CACHE) break;
        if (e.img && !keep.has(url)) AT.cache.delete(url);
    }
}

// Fond damier (pour juger la transparence des sprites)
function drawChecker(x, y, w, h, cell) {
    noStroke();
    for (let cy = 0; cy < h; cy += cell) {
        for (let cx = 0; cx < w; cx += cell) {
            fill(((cx / cell + cy / cell) % 2 === 0) ? C.colors.checkA : C.colors.checkB);
            rect(x + cx, y + cy, Math.min(cell, w - cx), Math.min(cell, h - cy));
        }
    }
}

// Export JSON des décisions (télécharge un fichier)
function exportDecisions() {
    const payload = { v: 1, date: new Date().toISOString(), decisions: AT.decisions, palette: AT.palette };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "assets-decisions.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
