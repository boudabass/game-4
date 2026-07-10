/*
 * sketch.js — Assets Test : boot + routeur d'états + gestes.
 * Écrans : PACKS (browser.js), FILES (browser.js), VIEWER (viewer.js),
 * SANDBOX (sandbox.js). Contrat plateforme : Engine.Loader + Engine.Save.
 */

function setup() {
    createCanvas(windowWidth, windowHeight);
    noSmooth();                // pixel-art : jamais de lissage à l'agrandissement
    textAlign(CENTER, CENTER);
    boot();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }

async function boot() {
    if (window.Engine && Engine.Loader) Engine.Loader.start(3);

    // Sauvegarde cloud : décisions de tri + palette + grille du bac à sable
    if (window.Engine && Engine.Save) {
        Engine.Save.configure({
            key: "assets-test",
            gather: () => ({ v: 1, decisions: AT.decisions, palette: AT.palette, sbGrid: SB.grid }),
            apply: (data) => {
                if (!data) return;
                if (data.decisions) AT.decisions = data.decisions;
                if (Array.isArray(data.palette)) AT.palette = data.palette;
                if (data.sbGrid) SB.grid = data.sbGrid;
            }
        });
        if (Engine.Loader) Engine.Loader.step("Chargement des décisions…");
        await Engine.Save.load();
    }

    // Scan serveur : liste réelle des packs et fichiers
    if (window.Engine && Engine.Loader) Engine.Loader.step("Scan des packs…");
    try {
        const res = await fetch("/api/assets/scan");
        if (!res.ok) throw new Error("HTTP " + res.status);
        AT.scan = await res.json();
    } catch (e) {
        AT.scanError = "Scan impossible (" + e.message + ")";
    }

    if (window.Engine && Engine.Loader) Engine.Loader.finish();
}

function draw() {
    background(C.colors.bg);
    AT.hits = [];              // les zones cliquables sont refaites chaque frame

    if (AT.scanError) { drawError(); return; }
    if (!AT.scan) { drawWait(); return; }

    switch (AT.state) {
        case "PACKS":   drawPacks();   break;
        case "FILES":   drawFiles();   break;
        case "VIEWER":  drawViewer();  break;
        case "SANDBOX": drawSandbox(); break;
    }

    autoSave();
    drawSaveBadge();
}

function drawWait() {
    fill(C.colors.textDim); textSize(u(3)); textAlign(CENTER, CENTER);
    text("Scan des packs…", width / 2, height / 2);
}

function drawError() {
    fill(C.colors.err); textSize(u(3)); textAlign(CENTER, CENTER);
    text(AT.scanError, width / 2, height / 2 - u(6));
    uiButton("RÉESSAYER", width / 2 - u(15), height / 2, u(30), u(8), {
        fn: () => { AT.scanError = null; boot(); }
    });
}

// Sauvegarde automatique 1,5 s après la dernière modification
async function autoSave() {
    if (!AT.dirty || millis() - AT.lastEdit < 1500) return;
    AT.dirty = false;
    AT.saveState = "saving";
    if (window.Engine && Engine.Save) await Engine.Save.save();
    AT.saveState = "saved";
    AT.saveT = millis();
}

function drawSaveBadge() {
    if (AT.saveState === "saved" && millis() - AT.saveT > 2000) AT.saveState = "";
    if (!AT.saveState && !AT.dirty) return;
    const label = AT.dirty ? "•" : (AT.saveState === "saving" ? "💾…" : "💾 ✓");
    fill(C.colors.textDim); textSize(u(2.2)); textAlign(RIGHT, BOTTOM);
    text(label, width - u(1), height - u(0.5));
}

/* ---------- Gestes : tap vs glissement ---------- */

function mousePressed() {
    AT.press = { x: mouseX, y: mouseY, moved: false };
    return false;
}

function mouseDragged() {
    if (!AT.press) return false;
    const dx = mouseX - pmouseX, dy = mouseY - pmouseY;
    if (Math.abs(mouseX - AT.press.x) > u(1) || Math.abs(mouseY - AT.press.y) > u(1)) AT.press.moved = true;

    if (AT.press.moved) {
        switch (AT.state) {
            case "PACKS":   AT.packsScroll = scrollClamp(AT.packsScroll - dy, packsMaxScroll()); break;
            case "FILES":   AT.filesScroll = scrollClamp(AT.filesScroll - dy, filesMaxScroll()); break;
            case "VIEWER":  viewerDrag(dx, dy); break;
            case "SANDBOX": sandboxDrag(); break;
        }
    }
    return false;
}

function mouseReleased() {
    if (AT.press && !AT.press.moved) uiTap(mouseX, mouseY);
    AT.press = null;
    return false;
}

function mouseWheel(e) {
    switch (AT.state) {
        case "PACKS":  AT.packsScroll = scrollClamp(AT.packsScroll + e.delta, packsMaxScroll()); break;
        case "FILES":  AT.filesScroll = scrollClamp(AT.filesScroll + e.delta, filesMaxScroll()); break;
        case "VIEWER": viewerWheel(e); break;
    }
    return false;
}

// Empêche le navigateur de scroller la page sur mobile
function touchMoved() { return false; }

function scrollClamp(v, max) { return constrain(v, 0, Math.max(0, max)); }
