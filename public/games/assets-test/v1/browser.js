/*
 * browser.js — Assets Test : écran PACKS (liste des packs + avancement)
 * et écran FILES (grille de vignettes filtrable d'un pack).
 */

/* ---------- PACKS ---------- */

function packStats(pack) {
    const st = { total: pack.files.length, ok: 0, mod: 0, ko: 0 };
    for (const f of pack.files) {
        const d = getDec(keyFor(pack.name, f.p));
        if (d && d.s) st[d.s]++;
    }
    return st;
}

function packsListTop() { return u(8) + u(9); }
function packRowH() { return u(11); }

function packsMaxScroll() {
    if (!AT.scan) return 0;
    return AT.scan.packs.length * packRowH() - (height - packsListTop() - u(1));
}

function drawPacks() {
    uiTopBar(C.title + " — " + AT.scan.packs.length + " packs", null);

    // Barre d'actions
    const by = u(8) + u(1);
    uiButton("🧪 BAC À SABLE", u(2), by, u(34), u(7), { fn: () => { AT.state = "SANDBOX"; } });
    uiButton("⬇ EXPORT JSON", u(38), by, u(34), u(7), { fn: exportDecisions });

    // Liste des packs
    const top = packsListTop();
    const rh = packRowH();
    push();
    for (let i = 0; i < AT.scan.packs.length; i++) {
        const y = top + i * rh - AT.packsScroll;
        if (y + rh < top - rh || y > height) continue;
        const pack = AT.scan.packs[i];
        const st = packStats(pack);

        noStroke(); fill(C.colors.panel);
        rect(u(2), y + u(0.5), width - u(4), rh - u(1), u(1));

        fill(C.colors.text); textAlign(LEFT, CENTER); textSize(u(2.8));
        text(fitText(pack.name.replace(/^kenney_/, ""), width - u(30)), u(4), y + rh * 0.30);

        const done = st.ok + st.mod + st.ko;
        fill(C.colors.textDim); textSize(u(2));
        text(st.total + " fichiers · " + done + " triés", u(4), y + rh * 0.60);

        // Barre de progression segmentée (vert/orange/rouge/gris)
        const bx = u(4), bw = width - u(8), bh = u(1.2), byy = y + rh * 0.78;
        noStroke(); fill(C.colors.panelHi); rect(bx, byy, bw, bh, bh / 2);
        if (st.total > 0) {
            let cx = bx;
            const parts = [[st.ok, C.colors.ok], [st.mod, C.colors.warn], [st.ko, C.colors.err]];
            for (const [n, col] of parts) {
                const w = (n / st.total) * bw;
                if (w > 0) { fill(col); rect(cx, byy, w, bh); cx += w; }
            }
        }

        hitZone(u(2), y, width - u(4), rh, () => {
            AT.curPack = pack; AT.filter = "all"; AT.filesScroll = 0; AT.state = "FILES";
        });
    }
    pop();

    // Masque sous la barre d'actions (la liste passe dessous en scrollant)
    noStroke(); fill(C.colors.bg); rect(0, 0, width, top);
    uiTopBar(C.title + " — " + AT.scan.packs.length + " packs", null);
    uiButton("🧪 BAC À SABLE", u(2), by, u(34), u(7), { fn: () => { AT.state = "SANDBOX"; } });
    uiButton("⬇ EXPORT JSON", u(38), by, u(34), u(7), { fn: exportDecisions });
}

/* ---------- FILES ---------- */

const FILTERS = [
    { id: "all",  label: "Tous" },
    { id: "none", label: "À trier" },
    { id: "ok",   label: "OK" },
    { id: "mod",  label: "À modif" },
    { id: "ko",   label: "Rejetés" }
];

function filteredFiles() {
    const pack = AT.curPack;
    if (AT.filter === "all") return pack.files;
    return pack.files.filter(f => {
        const d = getDec(keyFor(pack.name, f.p));
        const s = d && d.s ? d.s : "none";
        return s === AT.filter;
    });
}

function filesGrid() {
    const top = u(8) + u(8);
    const cols = Math.max(2, Math.floor(width / u(22)));
    const cellW = (width - u(2)) / cols;
    const cellH = cellW + u(3);
    return { top, cols, cellW, cellH };
}

function filesMaxScroll() {
    if (!AT.curPack) return 0;
    const g = filesGrid();
    const rows = Math.ceil(filteredFiles().length / g.cols);
    return rows * g.cellH - (height - g.top - u(1));
}

function drawFiles() {
    const pack = AT.curPack;
    const g = filesGrid();
    const files = filteredFiles();

    // Grille de vignettes (seulement les cellules visibles)
    for (let i = 0; i < files.length; i++) {
        const col = i % g.cols, row = Math.floor(i / g.cols);
        const x = u(1) + col * g.cellW;
        const y = g.top + row * g.cellH - AT.filesScroll;
        if (y + g.cellH < g.top || y > height) continue;

        const f = files[i];
        const key = keyFor(pack.name, f.p);
        const pad = u(0.5);
        const s = g.cellW - pad * 2;

        // Cadre coloré selon le statut de tri
        stroke(statusColor(key)); strokeWeight(u(0.4));
        fill(C.colors.panel);
        rect(x + pad, y + pad, s, s, u(0.8));

        if (isImg(f.p)) {
            const img = getImage(urlFor(pack.name, f.p));
            if (img) {
                const k = Math.min((s - pad * 2) / img.width, (s - pad * 2) / img.height);
                const iw = img.width * k, ih = img.height * k;
                image(img, x + pad + (s - iw) / 2, y + pad + (s - ih) / 2, iw, ih);
            } else {
                noStroke(); fill(C.colors.textDim); textSize(u(2)); textAlign(CENTER, CENTER);
                text("…", x + g.cellW / 2, y + s / 2);
            }
        } else {
            noStroke(); fill(C.colors.textDim); textSize(u(5)); textAlign(CENTER, CENTER);
            text(isSnd(f.p) ? "♪" : "📄", x + g.cellW / 2, y + pad + s / 2);
        }

        noStroke(); fill(C.colors.textDim); textSize(u(1.6)); textAlign(CENTER, TOP);
        text(fitText(fileName(f.p), s), x + g.cellW / 2, y + s + u(1));

        hitZone(x, y, g.cellW, g.cellH, () => { viewerOpen(pack.name, f.p); });
    }

    // Bandeau supérieur (recouvre la grille qui scrolle dessous)
    noStroke(); fill(C.colors.bg); rect(0, 0, width, g.top);
    uiTopBar(pack.name.replace(/^kenney_/, ""), () => { AT.state = "PACKS"; });

    // Filtres
    let fx = u(1);
    const fy = u(8) + u(0.8);
    for (const flt of FILTERS) {
        const w = textWidth(flt.label) + u(5);
        textSize(u(2.2));
        uiButton(flt.label, fx, fy, w, u(6), {
            active: AT.filter === flt.id, ts: u(2.2),
            fn: () => { AT.filter = flt.id; AT.filesScroll = 0; }
        });
        fx += w + u(1);
    }

    if (files.length === 0) {
        fill(C.colors.textDim); textSize(u(2.6)); textAlign(CENTER, CENTER);
        text("Aucun fichier dans ce filtre", width / 2, height / 2);
    }
}
