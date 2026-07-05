/*
 * sketch.js — Cigogne (test physique type Flappy Bird + chargement d'image)
 * Contrat plateforme identique au template :
 *   - boot via Engine.Loader
 *   - sauvegarde du meilleur score via Engine.Save
 *   - envoi du score via GameSystem.Score.submit()
 *   - machine d'états switch/case
 *   - canvas responsive (u(n) = n% du plus petit côté)
 */

const STATE = { MENU: "MENU", GAME: "GAME", OVER: "OVER" };
let state = STATE.MENU;

const C = window.CigogneConfig;

let score = 0;
let best = 0;
let btn = null;

let birdImg = null; // spritesheet vol (8 frames, 256x256)
let bird = { x: 0, y: 0, vy: 0, size: 0, angle: 0 };

const SPRITE_TAILLE = 256;
const SPRITE_NB_FRAMES = 8;
let spriteFrame = 0;
let pipes = []; // { x, gapY, gapH, passed }
let lastPipeAt = 0;
let groundY = 0;

function u(n) {
    return (min(width, height) * n) / 100;
}

function preload() {
    birdImg = loadImage("assets/cigogne_vol.png");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    imageMode(CENTER);
    boot();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    groundY = height - u(6);
}

async function boot() {
    if (window.Engine && Engine.Loader) Engine.Loader.start(2);

    if (window.Engine && Engine.Save) {
        Engine.Save.configure({
            key: "cigogne",
            gather: () => ({ best: best }),
            apply: (data) => { if (data && typeof data.best === "number") best = data.best; }
        });
        if (Engine.Loader) Engine.Loader.step("Chargement de la sauvegarde...");
        await Engine.Save.load();
    }

    groundY = height - u(6);
    if (window.Engine && Engine.Loader) Engine.Loader.finish();
}

function draw() {
    background(C.colors.bg);
    if (frameCount % 5 === 0) {
        spriteFrame = (spriteFrame + 1) % SPRITE_NB_FRAMES;
    }
    switch (state) {
        case STATE.MENU: drawMenu(); break;
        case STATE.GAME: drawGame(); break;
        case STATE.OVER: drawOver(); break;
    }
}

function drawMenu() {
    drawGround();
    fill(C.colors.text);
    textSize(u(7)); text(C.title, width / 2, height / 2 - u(20));
    textSize(u(3));
    text("Clique ou appuie sur ESPACE pour voler", width / 2, height / 2 - u(8));
    text("Meilleur score : " + best, width / 2, height / 2 - u(2));

    // cigogne posée qui flotte doucement (aperçu du sprite)
    const size = u(C.birdSizePct);
    const bob = sin(millis() / 300) * u(1.5);
    image(
        birdImg,
        width / 2, height / 2 + u(8) + bob, size, size,
        spriteFrame * SPRITE_TAILLE, 0, SPRITE_TAILLE, SPRITE_TAILLE
    );

    drawButton("JOUER", height / 2 + u(24));
}

function drawGame() {
    // physique de la cigogne
    bird.vy += C.gravity;
    bird.y += bird.vy;
    bird.angle = constrain(bird.vy * 3, -30, 70);

    // sol / plafond
    if (bird.y - bird.size / 2 <= 0) {
        bird.y = bird.size / 2;
        bird.vy = 0;
    }
    if (bird.y + bird.size / 2 >= groundY) {
        endGame();
        return;
    }

    // spawn des obstacles
    if (millis() - lastPipeAt > C.pipeSpawnMs) {
        spawnPipe();
        lastPipeAt = millis();
    }

    // avancement + collisions
    for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= C.pipeSpeed * (width / 800); // vitesse proportionnelle à la largeur

        if (!p.passed && p.x + p.w < bird.x) {
            p.passed = true;
            score++;
        }

        if (checkCollision(p)) {
            endGame();
            return;
        }

        if (p.x + p.w < -u(5)) pipes.splice(i, 1);
    }

    drawPipes();
    drawGround();

    push();
    translate(bird.x, bird.y);
    rotate(radians(bird.angle));
    image(
        birdImg,
        0, 0, bird.size, bird.size,
        spriteFrame * SPRITE_TAILLE, 0, SPRITE_TAILLE, SPRITE_TAILLE
    );
    pop();

    fill(C.colors.text);
    textSize(u(5));
    textAlign(LEFT, TOP); text("Score : " + score, u(3), u(3));
    textAlign(CENTER, CENTER);
}

function drawOver() {
    drawGround();
    fill(C.colors.text);
    textSize(u(6)); text("Partie terminée", width / 2, height / 2 - u(16));
    textSize(u(4));
    text("Score : " + score, width / 2, height / 2 - u(5));
    text("Meilleur : " + best, width / 2, height / 2 + u(2));
    drawButton("REJOUER", height / 2 + u(18));
}

function drawGround() {
    fill(80, 60, 40);
    rect(0, groundY, width, height - groundY);
}

function drawPipes() {
    noStroke();
    for (const p of pipes) {
        fill(C.colors.pipe);
        rect(p.x, 0, p.w, p.gapY);
        rect(p.x, p.gapY + p.gapH, p.w, groundY - (p.gapY + p.gapH));
        fill(C.colors.pipeEdge);
        rect(p.x - u(0.5), p.gapY - u(2), p.w + u(1), u(2));
        rect(p.x - u(0.5), p.gapY + p.gapH, p.w + u(1), u(2));
    }
}

function spawnPipe() {
    const gapH = u(C.pipeGapPct);
    const margin = u(6);
    const gapY = random(margin, groundY - margin - gapH);
    pipes.push({ x: width + u(5), w: u(10), gapY: gapY, gapH: gapH, passed: false });
}

function checkCollision(p) {
    const bx = bird.x - bird.size / 2;
    const by = bird.y - bird.size / 2;
    const bs = bird.size;

    const hitsX = bx + bs > p.x && bx < p.x + p.w;
    if (!hitsX) return false;

    const hitsTop = by < p.gapY;
    const hitsBottom = by + bs > p.gapY + p.gapH;
    return hitsTop || hitsBottom;
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

function startGame() {
    score = 0;
    pipes = [];
    lastPipeAt = millis();
    bird.x = u(20);
    bird.y = height / 2;
    bird.vy = 0;
    bird.size = u(C.birdSizePct);
    bird.angle = 0;
    state = STATE.GAME;
}

function flap() {
    bird.vy = C.flap;
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
        flap();
    } else if (state === STATE.OVER) {
        if (insideBtn(mouseX, mouseY)) startGame();
    }
}

function touchStarted() {
    mousePressed();
    return false;
}

function keyPressed() {
    if (key === " ") {
        if (state === STATE.MENU || state === STATE.OVER) {
            startGame();
        } else if (state === STATE.GAME) {
            flap();
        }
    }
}
