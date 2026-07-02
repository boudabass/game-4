/*
 * sketch.js — Template de jeu minimal (p5.js, mode global)
 * Démontre le contrat plateforme :
 *   - boot via Engine.Loader
 *   - sauvegarde/chargement du meilleur score via Engine.Save (local + cloud)
 *   - envoi du score via GameSystem.Score.submit()
 *   - machine d'états switch/case (conforme à TROUBLESHOOTING.md)
 *   - CANVAS RESPONSIVE : remplit toute la fenêtre et suit ses changements
 *     de taille. Règle d'or pour tous les jeux futurs : ne JAMAIS utiliser
 *     de pixels en dur ; tout se calcule à partir de width, height et u().
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

// u(n) = n % du plus petit côté de l'écran.
// Exemple : u(5) = 5% → une taille qui reste proportionnée sur mobile
// comme sur grand écran. À utiliser pour TOUTES les tailles (textes,
// rayons, boutons, marges...).
function u(n) {
    return (min(width, height) * n) / 100;
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    boot();
}

// Appelé automatiquement par p5 quand la fenêtre (l'iframe) change de
// taille : rotation du téléphone, passage en plein écran, etc.
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // On garde la cible dans l'écran si celui-ci a rétréci.
    target.x = constrain(target.x, target.r, width - target.r);
    target.y = constrain(target.y, target.r, height - target.r);
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
    textSize(u(7)); text(C.title, width / 2, height / 2 - u(14));
    textSize(u(3));
    text("Cliquez la cible le plus de fois possible en " + C.duration + "s", width / 2, height / 2 - u(2));
    text("Meilleur score : " + best, width / 2, height / 2 + u(4));
    drawButton("JOUER", height / 2 + u(16));
}

function drawGame() {
    const now = millis();
    timeLeft -= (now - lastTick) / 1000;
    lastTick = now;
    if (timeLeft <= 0) { endGame(); return; }

    fill(C.colors.target);
    circle(target.x, target.y, target.r * 2);

    fill(C.colors.text);
    textSize(u(4));
    textAlign(LEFT, TOP); text("Score : " + score, u(3), u(3));
    textAlign(RIGHT, TOP); text("Temps : " + ceil(timeLeft), width - u(3), u(3));
    textAlign(CENTER, CENTER);
}

function drawOver() {
    fill(C.colors.text);
    textSize(u(6)); text("Partie terminée", width / 2, height / 2 - u(14));
    textSize(u(4));
    text("Score : " + score, width / 2, height / 2 - u(3));
    text("Meilleur : " + best, width / 2, height / 2 + u(3));
    drawButton("REJOUER", height / 2 + u(16));
}

function drawButton(label, y) {
    const w = u(30);
    const h = u(9);
    btn = { x: width / 2 - w / 2, y: y - h / 2, w: w, h: h };
    fill(C.colors.button);
    rect(btn.x, btn.y, btn.w, btn.h, u(2));
    fill(C.colors.buttonText);
    textSize(u(4)); text(label, width / 2, y);
}

function insideBtn(mx, my) {
    return btn && mx > btn.x && mx < btn.x + btn.w && my > btn.y && my < btn.y + btn.h;
}

function moveTarget() {
    target.r = u(5);
    const m = target.r * 2;
    target.x = random(m, width - m);
    target.y = random(m + u(8), height - m);
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
