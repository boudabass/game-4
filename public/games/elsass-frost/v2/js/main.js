/*
 * main.js — Sketch p5 (mode global) : boot plateforme, machine d'états,
 * boucle de simulation à vitesse variable, fin de partie + envoi du score.
 */
const EF_STATE = { MENU: "MENU", GAME: "GAME", OVER: "OVER" };
let efState = EF_STATE.MENU;
let efAccumulator = 0;      // minutes de jeu en attente de simulation
let efLastSaveDay = 0;      // autosave une fois par jour de jeu

function setup() {
    const c = createCanvas(windowWidth, windowHeight);
    // L'UI HTML est au-dessus ; le canvas ne reçoit que les interactions monde
    window.EFInput.init(c.elt);
    window.EFInput.onTapTile = efHandleTap;
    window.EFRender.initFlakes();
    window.EFUI.init();
    efBoot();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

async function efBoot() {
    if (window.Engine && Engine.Loader) Engine.Loader.start(2);
    window.EFSaveGame.configure();
    if (window.Engine && Engine.Loader) Engine.Loader.step("Chargement de la sauvegarde...");
    if (window.Engine && Engine.Save) await Engine.Save.load();
    if (window.Engine && Engine.Loader) Engine.Loader.finish();
    efShowMenu();
}

function efShowMenu() {
    efState = EF_STATE.MENU;
    window.EFUI.showScreen("screen-menu");
    // Bouton "Continuer" seulement si une ville est sauvegardée
    const btnCont = document.getElementById("btn-continue");
    btnCont.classList.toggle("hidden", !window.EFSaveGame.hasCity());
    document.getElementById("menu-best").textContent =
        window.EFSaveGame.best > 0 ? "Meilleur score : " + window.EFSaveGame.best : "";
}

function efStartGame(fromSave) {
    if (fromSave && window.EFSaveGame.restore()) {
        // partie restaurée
    } else {
        window.EFState.reset();
        window.EFTime.initWeather();
        window.EFGrid.rebuild();
    }
    window.EFCamera.center();
    window.EFInput.setMode(null);
    window.EFUI.hideDetail();
    window.EFUI.toggleShelf(false);
    window.EFUI.setSpeed(1);
    efAccumulator = 0;
    efLastSaveDay = window.EFState.day;
    efState = EF_STATE.GAME;
    window.EFUI.showScreen("game-ui");
}

async function efGameOver() {
    efState = EF_STATE.OVER;
    const score = window.EFSim.finalScore();
    if (score > window.EFSaveGame.best) window.EFSaveGame.best = score;
    window.EFUI.fillGameOver();
    window.EFUI.showScreen("screen-over");
    // La partie est finie : on efface la ville et on garde le meilleur score
    await window.EFSaveGame.clearCity();
    // Envoi au classement de l'arcade
    if (window.GameSystem && GameSystem.Score) await GameSystem.Score.submit(score);
}

function draw() {
    switch (efState) {
        case EF_STATE.MENU:
        case EF_STATE.OVER:
            background(16, 26, 38);
            window.EFRender.drawFlakes();
            break;

        case EF_STATE.GAME:
            efSimulate();
            window.EFRender.drawWorld();
            window.EFUI.updateHUD();
            if (window.EFState.gameOver) efGameOver();
            break;
    }
}

// Convertit le temps réel écoulé en minutes de jeu selon la vitesse choisie
function efSimulate() {
    const S = window.EFState;
    if (S.speed === 0 || S.pendingEvent) return;
    const perSec = window.EFConfig.SPEED_MINUTES_PER_SEC[S.speed] || 10;
    efAccumulator += (deltaTime / 1000) * perSec;
    // Garde-fou : éviter les rattrapages énormes après un onglet inactif
    if (efAccumulator > 240) efAccumulator = 240;
    let steps = 0;
    while (efAccumulator >= 1 && steps < 300) {
        window.EFSim.tickMinute();
        efAccumulator -= 1;
        steps++;
        if (S.gameOver || S.pendingEvent) break;
    }
    // Autosave quotidienne + à chaque dilemme (moments calmes)
    if (S.day !== efLastSaveDay) {
        efLastSaveDay = S.day;
        window.EFSaveGame.persist();
    }
}

// Tap sur une case du monde : selon l'outil actif
function efHandleTap(tx, ty) {
    if (efState !== EF_STATE.GAME) return;
    const I = window.EFInput, S = window.EFState;

    if (I.mode === "build" && I.buildType) {
        if (window.EFBuildings.place(I.buildType, tx, ty)) {
            window.EFUI.refreshShelfSelection();
            const def = window.EFConfig.BUILDINGS[I.buildType];
            // On garde l'outil actif pour enchaîner les constructions,
            // sauf pour les bâtiments uniques
            if (def.unique) I.setMode(null);
        }
    } else if (I.mode === "road") {
        if (!window.EFBuildings.placeRoad(tx, ty))
            window.EFBuildings.removeRoad(tx, ty); // re-tap sur une route = retrait
    } else if (I.mode === "demolish") {
        const idx = window.EFGrid.buildingAt(tx, ty);
        if (idx >= 0) window.EFBuildings.demolish(idx);
        else window.EFBuildings.removeRoad(tx, ty);
    } else {
        // Pas d'outil : ouvrir le détail du bâtiment touché
        const idx = window.EFGrid.buildingAt(tx, ty);
        if (idx >= 0) window.EFUI.showDetail(idx);
        else window.EFUI.hideDetail();
    }
}

// Raccourcis clavier (desktop)
function keyPressed() {
    if (efState !== EF_STATE.GAME) return;
    const S = window.EFState;
    if (key === " ") window.EFUI.setSpeed(S.speed === 0 ? S.lastSpeed : 0);
    if (key === "1") window.EFUI.setSpeed(1);
    if (key === "2") window.EFUI.setSpeed(2);
    if (key === "3") window.EFUI.setSpeed(3);
    if (keyCode === ESCAPE) {
        window.EFInput.setMode(null);
        window.EFUI.toggleShelf(false);
        window.EFUI.hideDetail();
    }
}

// Boutons des écrans (menu / fin) branchés au chargement du DOM
window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-new").addEventListener("click", () => efStartGame(false));
    document.getElementById("btn-continue").addEventListener("click", () => efStartGame(true));
    document.getElementById("btn-replay").addEventListener("click", () => efStartGame(false));
    document.getElementById("btn-back-menu").addEventListener("click", () => efShowMenu());
});
