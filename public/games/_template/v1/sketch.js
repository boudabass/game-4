/*
 * sketch.js — Template de jeu minimal (p5.js, mode global)
 * Démontre le contrat plateforme :
 *   - boot via Engine.Loader
 *   - sauvegarde/chargement du meilleur score via Engine.Save (local + cloud)
 *   - envoi du score via GameSystem.Score.submit()
 *   - machine d'états switch/case (conforme à TROUBLESHOOTING.md)
 */

const STATE = { MENU: "MENU", GAME: "GAME", OVER: "OVER" };
let state = STATE.MENU;

let score = 0;
let best = 0;
let timeLeft = 0;
let lastTick = 0;
let target = { x: 0, y: 0, r: 30 };
let btn = null;

const C = window.TemplateConfig;

function setup() {
    createCanvas(C.width, C.height);
    textAlign(CENTER, CENTER);
    boot();
}

// Démarrage asynchrone : chargement de la sauvegarde puis fin du loader.
async function boot() {
    if (window.Engine && Engine.Loader) Engine.Loader.start(2);

    if (window.Engine && Engine.Save) {
        Engine.Save.configure({
            key: "template",
            gather: () => ({ best: best }),
            apply: (data) => { if (data && typeof data.best === "number") best = data.best; }
        });
        if (Engine.Loader) Engine.Loader.step("Chargement de la sauvegarde...");
        await Engine.Save.load();
    }

    if (window.Engine && Engine.Loader) Engine.Loader.finish();
}

function draw() {
    background(C.colors.bg);
    switch (state) {
        case STATE.MENU: drawMenu(); break;
        case STATE.GAME: drawGame(); break;
        case STATE.OVER: drawOver(); break;
    }
}

function drawMenu() {
    fill(C.colors.text);
    textSize(42); text(C.title, width / 2, height / 2 - 70);
    textSize(18);
    text("Cliquez la cible le plus de fois possible en " + C.duration + "s", width / 2, height / 2 - 10);
    text("Meilleur score : " + best, width / 2, height / 2 + 25);
    drawButton("JOUER", height / 2 + 100);
}

function drawGame() {
    const now = millis();
    timeLeft -= (now - lastTick) / 1000;
    lastTick = now;
    if (timeLeft <= 0) { endGame(); return; }

    fill(C.colors.target);
    circle(target.x, target.y, target.r * 2);

    fill(C.colors.text);
    textSize(22);
    textAlign(LEFT, TOP); text("Score : " + score, 20, 20);
    textAlign(RIGHT, TOP); text("Temps : " + ceil(timeLeft), width - 20, 20);
    textAlign(CENTER, CENTER);
}

function drawOver() {
    fill(C.colors.text);
    textSize(36); text("Partie terminée", width / 2, height / 2 - 70);
    textSize(24);
    text("Score : " + score, width / 2, height / 2 - 15);
    text("Meilleur : " + best, width / 2, height / 2 + 20);
    drawButton("REJOUER", height / 2 + 95);
}

function drawButton(label, y) {
    btn = { x: width / 2 - 90, y: y - 28, w: 180, h: 56 };
    fill(C.colors.button);
    rect(btn.x, btn.y, btn.w, btn.h, 12);
    fill(C.colors.buttonText);
    textSize(24); text(label, width / 2, y);
}

function insideBtn(mx, my) {
    return btn && mx > btn.x && mx < btn.x + btn.w && my > btn.y && my < btn.y + btn.h;
}

function moveTarget() {
    const m = 60;
    target.x = random(m, width - m);
    target.y = random(m + 40, height - m);
}

function startGame() {
    score = 0;
    timeLeft = C.duration;
    lastTick = millis();
    moveTarget();
    state = STATE.GAME;
}

async function endGame() {
    state = STATE.OVER;
    if (score > best) {
        best = score;
        if (window.Engine && Engine.Save) await Engine.Save.save();
    }
    if (window.GameSystem && GameSystem.Score) {
        await GameSystem.Score.submit(score);
    }
}

function mousePressed() {
    if (state === STATE.MENU) {
        if (insideBtn(mouseX, mouseY)) startGame();
    } else if (state === STATE.GAME) {
        if (dist(mouseX, mouseY, target.x, target.y) <= target.r) {
            score++;
            moveTarget();
        }
    } else if (state === STATE.OVER) {
        if (insideBtn(mouseX, mouseY)) startGame();
    }
}
