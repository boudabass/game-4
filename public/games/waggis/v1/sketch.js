/*
 * sketch.js — Waggis (style Frogger / Crossy Road, vue du dessus)
 * Contrat plateforme identique aux autres jeux :
 *   - boot via Engine.Loader
 *   - sauvegarde du meilleur score via Engine.Save
 *   - envoi du score via GameSystem.Score.submit()
 *   - machine d'états switch/case
 *   - canvas responsive (u(n) = n% du plus petit côté)
 *
 * Principe du jeu : le Waggis avance ligne par ligne (grille) vers le haut
 * de l'écran, en évitant les routes (véhicules) et en traversant les canaux
 * en sautant sur des tonneaux flottants. Le score = nombre de lignes
 * franchies + bonus bretzels ramassés. Jeu sans fin, difficulté croissante.
 */

const STATE = { MENU: "MENU", GAME: "GAME", OVER: "OVER" };
let state = STATE.MENU;

const C = window.WaggisConfig;
const COLS = C.cols;

let best = 0;
let rowsCrossed = 0;   // = ligne max atteinte (score de progression)
let bretzels = 0;      // bretzels ramassés cette partie
let btn = null;

let colW = 0;   // largeur d'une colonne (px)
let rowH = 0;   // hauteur d'une ligne (px), carrée avec colW
let SCALE = 1;  // facteur d'échelle des vitesses selon la largeur d'écran

let lanes = {};        // { [row]: laneObject }
let player = null;
let lastMoveAt = 0;
let dead = false;

const VISIBLE_AHEAD = 12; // lignes générées d'avance au-dessus du joueur
const PRUNE_BEHIND = 6;   // lignes conservées derrière le joueur

function u(n) {
    return (min(width, height) * n) / 100;
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    recomputeGrid();
    boot();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    recomputeGrid();
}

function recomputeGrid() {
    colW = width / COLS;
    rowH = colW;
    SCALE = width / 800;
}

async function boot() {
    if (window.Engine && Engine.Loader) Engine.Loader.start(2);

    if (window.Engine && Engine.Save) {
        Engine.Save.configure({
            key: "waggis",
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
        case STATE.GAME: updateGame(); drawGame(); break;
        case STATE.OVER: drawOver(); break;
    }
}

// ---------------------------------------------------------------------
// Génération des lignes
// ---------------------------------------------------------------------

function ensureLanesUpTo(maxRow) {
    let start = 0;
    // trouve la prochaine ligne non générée
    while (lanes[start] !== undefined) start++;
    for (let r = start; r <= maxRow; r++) {
        lanes[r] = makeLane(r);
    }
}

function pruneLanesBelow(row) {
    for (const key in lanes) {
        if (Number(key) < row - PRUNE_BEHIND) delete lanes[key];
    }
}

function recentTypes(row, count) {
    const out = [];
    for (let r = row - 1; r >= 0 && out.length < count; r--) {
        if (lanes[r]) out.push(lanes[r].type);
    }
    return out;
}

function makeLane(row) {
    if (row < 2 || row % C.checkpointEvery === 0) {
        return makeSafeLane(row);
    }

    const prevTypes = recentTypes(row, C.waterMaxStreak);
    const streakIsWater = prevTypes.length === C.waterMaxStreak && prevTypes.every((t) => t === "water");

    const roll = random();
    let type;
    if (streakIsWater) {
        type = roll < 0.6 ? "road" : "safe";
    } else if (roll < 0.42) {
        type = "road";
    } else if (roll < 0.75) {
        type = "water";
    } else {
        type = "safe";
    }

    if (type === "safe") return makeSafeLane(row);
    if (type === "water") return makeWaterLane(row);
    return makeRoadLane(row);
}

function makeSafeLane(row) {
    const lane = { row, type: "safe", bretzelCol: null };
    if (random() < C.bretzelChance) {
        lane.bretzelCol = floor(random(COLS));
    }
    return lane;
}

function difficultyTier(row) {
    return constrain(floor(row / 10), 0, 5);
}

// Écart minimum garanti entre deux véhicules/tonneaux consécutifs : le
// joueur doit TOUJOURS pouvoir se glisser dans cet espace, même à la
// difficulté maximale. Seule la vitesse augmente avec le tier, jamais au
// point de rendre un passage impossible.
function makeRoadLane(row) {
    const tier = difficultyTier(row);
    const dir = random() < 0.5 ? 1 : -1;
    const speed = (1 + tier * 0.35 + random(-0.15, 0.25)); // px/frame à SCALE=1
    const objW = colW * random(0.55, 0.8);           // véhicule : moins d'une colonne
    const minGap = colW * max(1.5, 2.3 - tier * 0.15); // espace vide garanti
    const gap = minGap + random(0, colW * 0.4);
    const spacing = objW + gap;
    const offset = random(spacing);
    const count = ceil((width * 2.2) / spacing) + 2;

    const objects = [];
    for (let i = 0; i < count; i++) {
        objects.push({ x: -width * 0.6 + offset + i * spacing, w: objW });
    }

    return { row, type: "road", dir, speed, spacing, objects };
}

function makeWaterLane(row) {
    const tier = difficultyTier(row);
    const dir = random() < 0.5 ? 1 : -1;
    const speed = (0.7 + tier * 0.25 + random(-0.1, 0.2));
    const objW = colW * random(1.3, 1.8);            // tonneaux généreux : plus indulgent
    const minGap = colW * max(1.0, 1.8 - tier * 0.12);
    const gap = minGap + random(0, colW * 0.3);
    const spacing = objW + gap;
    const offset = random(spacing);
    const count = ceil((width * 2.2) / spacing) + 2;

    const objects = [];
    for (let i = 0; i < count; i++) {
        objects.push({ x: -width * 0.6 + offset + i * spacing, w: objW });
    }

    return { row, type: "water", dir, speed, spacing, objects };
}

// ---------------------------------------------------------------------
// Logique de jeu
// ---------------------------------------------------------------------

function playerScreenY() {
    return height * 0.72;
}

function screenYForRow(row) {
    return playerScreenY() - (row - player.row) * rowH;
}

function screenXForCol(colF) {
    return colF * colW + colW / 2;
}

function updateGame() {
    if (dead) return;

    ensureLanesUpTo(player.row + VISIBLE_AHEAD);
    pruneLanesBelow(player.row);

    // avance tous les objets des lignes proches du joueur (visibles)
    for (const key in lanes) {
        const lane = lanes[key];
        if (lane.type === "safe") continue;
        const r = Number(key);
        if (r < player.row - 2 || r > player.row + VISIBLE_AHEAD) continue;
        const wrap = width + lane.spacing;
        for (const obj of lane.objects) {
            obj.x += lane.dir * lane.speed * SCALE;
            if (lane.dir > 0 && obj.x > width + obj.w) obj.x -= wrap;
            if (lane.dir < 0 && obj.x < -obj.w) obj.x += wrap;
        }
    }

    checkCurrentLane();
    checkBretzel();
}

// Hitbox du joueur : nettement plus étroite que la case pour coller à la
// silhouette dessinée (~0.5 x colonne) et laisser une marge de tolérance
// visuelle (on préfère pardonner un frôlement plutôt que tuer à tort).
const PLAYER_HALF_HITBOX = 0.24; // en fraction de colW

function playerFootprint() {
    const px = screenXForCol(player.colF);
    return { left: px - colW * PLAYER_HALF_HITBOX, right: px + colW * PLAYER_HALF_HITBOX };
}

function checkCurrentLane() {
    const lane = lanes[player.row];
    if (!lane) return;

    if (lane.type === "road") {
        const fp = playerFootprint();
        const margin = colW * 0.08; // tolérance : hitbox véhicule légèrement rétrécie
        for (const obj of lane.objects) {
            if (obj.x + margin < fp.right && obj.x + obj.w - margin > fp.left) {
                killPlayer();
                return;
            }
        }
    } else if (lane.type === "water") {
        const px = screenXForCol(player.colF);
        let riding = null;
        for (const obj of lane.objects) {
            if (px > obj.x && px < obj.x + obj.w) { riding = obj; break; }
        }
        if (!riding) {
            killPlayer();
            return;
        }
        // dérive avec le tonneau
        player.colF += (lane.dir * lane.speed * SCALE) / colW;
        if (player.colF < -0.55 || player.colF > COLS - 0.45) {
            killPlayer();
            return;
        }
    }
}

function checkBretzel() {
    const lane = lanes[player.row];
    if (!lane || lane.bretzelCol === null || lane.bretzelCol === undefined) return;
    if (round(player.colF) === lane.bretzelCol && abs(player.colF - lane.bretzelCol) < 0.6) {
        bretzels++;
        lane.bretzelCol = null;
    }
}

function killPlayer() {
    if (dead) return;
    dead = true;
    endGame();
}

// ---------------------------------------------------------------------
// Rendu
// ---------------------------------------------------------------------

function drawMenu() {
    fill(C.colors.text);
    textSize(u(9)); text(C.title, width / 2, height / 2 - u(20));
    textSize(u(3.2));
    text("Traverse routes et canaux, évite les véhicules", width / 2, height / 2 - u(8));
    text("Flèches (ou clique/touche autour du personnage) pour bouger", width / 2, height / 2 - u(2));
    text("Meilleur score : " + best, width / 2, height / 2 + u(5));
    drawButton("JOUER", height / 2 + u(24));
}

function drawGame() {
    drawLanes();
    drawPlayer();

    fill(C.colors.text);
    textSize(u(4.5));
    textAlign(LEFT, TOP); text("Score : " + currentScore(), u(3), u(3));
    textAlign(RIGHT, TOP); text("🥨 " + bretzels, width - u(3), u(3));
    textAlign(CENTER, CENTER);
}

function drawOver() {
    drawLanes();
    drawPlayer();
    noStroke();
    fill(15, 23, 42, 190);
    rect(0, 0, width, height);
    fill(255);
    textSize(u(6)); text("Partie terminée", width / 2, height / 2 - u(16));
    textSize(u(4));
    text("Score : " + currentScore(), width / 2, height / 2 - u(5));
    text("Meilleur : " + best, width / 2, height / 2 + u(2));
    drawButton("REJOUER", height / 2 + u(18));
}

function currentScore() {
    return rowsCrossed + bretzels * C.bretzelPoints;
}

function drawLanes() {
    const topRow = player.row + ceil((height / rowH)) + 1;
    const bottomRow = max(0, player.row - 2);

    for (let r = bottomRow; r <= topRow; r++) {
        const lane = lanes[r];
        const y = screenYForRow(r);
        if (y < -rowH || y > height + rowH) continue;
        drawLaneBackground(lane, y);
    }
    for (let r = bottomRow; r <= topRow; r++) {
        const lane = lanes[r];
        if (!lane) continue;
        const y = screenYForRow(r);
        if (y < -rowH || y > height + rowH) continue;
        drawLaneContent(lane, y);
    }
}

function drawLaneBackground(lane, y) {
    noStroke();
    if (!lane || lane.type === "safe") {
        fill(C.colors.safe);
        rect(0, y - rowH / 2, width, rowH);
        fill(C.colors.safeEdge);
        rect(0, y - rowH / 2, width, u(0.4));
        rect(0, y + rowH / 2 - u(0.4), width, u(0.4));
    } else if (lane.type === "road") {
        fill(C.colors.road);
        rect(0, y - rowH / 2, width, rowH);
    } else if (lane.type === "water") {
        fill(C.colors.water);
        rect(0, y - rowH / 2, width, rowH);
        fill(C.colors.waterEdge);
        rect(0, y - rowH / 2, width, u(0.4));
        rect(0, y + rowH / 2 - u(0.4), width, u(0.4));
    }
}

function drawLaneContent(lane, y) {
    if (lane.type === "road") {
        stroke(C.colors.roadLine);
        strokeWeight(u(0.4));
        drawingContext.setLineDash([u(2), u(2)]);
        line(0, y, width, y);
        drawingContext.setLineDash([]);
        noStroke();
        for (const obj of lane.objects) drawVehicle(obj, y);
    } else if (lane.type === "water") {
        for (const obj of lane.objects) drawBarrel(obj, y);
    } else if (lane.type === "safe" && lane.bretzelCol !== null && lane.bretzelCol !== undefined) {
        drawBretzel(screenXForCol(lane.bretzelCol), y);
    }
}

function drawVehicle(obj, y) {
    const h = rowH * 0.55;
    noStroke();
    fill(40, 40, 45, 60);
    rect(obj.x + u(0.5), y - h / 2 + u(0.5), obj.w, h, u(1));
    fill(200, 60, 60);
    rect(obj.x, y - h / 2, obj.w, h, u(1));
    fill(30, 30, 35);
    rect(obj.x, y - h / 2, obj.w, h * 0.35, u(1));
    fill(20);
    circle(obj.x + obj.w * 0.2, y + h / 2, u(1.6));
    circle(obj.x + obj.w * 0.8, y + h / 2, u(1.6));
}

function drawBarrel(obj, y) {
    const h = rowH * 0.6;
    noStroke();
    fill(C.colors.barrel);
    rect(obj.x, y - h / 2, obj.w, h, u(1.5));
    fill(C.colors.barrelBand);
    rect(obj.x + obj.w * 0.18, y - h / 2, u(0.8), h);
    rect(obj.x + obj.w * 0.82 - u(0.8), y - h / 2, u(0.8), h);
}

function drawBretzel(x, y) {
    push();
    translate(x, y);
    noFill();
    stroke(C.colors.bretzel);
    strokeWeight(u(0.9));
    const r = u(2.2);
    circle(-r * 0.5, 0, r);
    circle(r * 0.5, 0, r);
    noStroke();
    fill(C.colors.bretzel);
    circle(0, r * 0.9, u(1));
    pop();
}

function drawPlayer() {
    const bounceT = constrain((millis() - lastMoveAt) / 150, 0, 1);
    const lift = -sin(bounceT * PI) * rowH * 0.25;
    const squash = 1 - 0.12 * sin(bounceT * PI);

    const x = screenXForCol(player.colF);
    const y = playerScreenY() + lift;
    const s = colW * 0.8;

    push();
    translate(x, y);
    scale(1 / squash, squash);
    noStroke();

    // ombre
    fill(0, 0, 0, 40);
    ellipse(0, s * 0.42, s * 0.7, s * 0.22);

    // pantalon
    fill(C.colors.pants);
    rect(-s * 0.28, s * 0.05, s * 0.56, s * 0.32, u(1));

    // chemise + gilet rouge (tenue traditionnelle du Waggis)
    fill(C.colors.shirt);
    rect(-s * 0.32, -s * 0.22, s * 0.64, s * 0.35, u(1));
    fill(C.colors.vestRed);
    rect(-s * 0.32, -s * 0.22, s * 0.22, s * 0.35, u(1));
    rect(s * 0.10, -s * 0.22, s * 0.22, s * 0.35, u(1));

    // tête + grand nez rouge
    fill(C.colors.skin);
    circle(0, -s * 0.38, s * 0.42);
    fill(C.colors.nose);
    circle(s * 0.16, -s * 0.34, s * 0.14);

    // béret noir
    fill(C.colors.hat);
    arc(0, -s * 0.5, s * 0.5, s * 0.32, PI, TWO_PI);
    circle(0, -s * 0.66, s * 0.07);

    pop();
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

// ---------------------------------------------------------------------
// Contrôles
// ---------------------------------------------------------------------

function startGame() {
    lanes = {};
    player = { row: 0, colF: floor(COLS / 2) };
    rowsCrossed = 0;
    bretzels = 0;
    dead = false;
    lastMoveAt = millis();
    ensureLanesUpTo(VISIBLE_AHEAD);
    state = STATE.GAME;
}

function move(dir) {
    if (state !== STATE.GAME || dead) return;
    let nr = player.row;
    let nc = round(player.colF);

    if (dir === "up") nr++;
    else if (dir === "down") nr = max(0, nr - 1);
    else if (dir === "left") nc = max(0, nc - 1);
    else if (dir === "right") nc = min(COLS - 1, nc + 1);

    if (nr === player.row && nc === round(player.colF)) return;

    player.row = nr;
    player.colF = nc;
    lastMoveAt = millis();
    if (player.row > rowsCrossed) rowsCrossed = player.row;

    ensureLanesUpTo(player.row + VISIBLE_AHEAD);
    checkCurrentLane();
    checkBretzel();
}

async function endGame() {
    state = STATE.OVER;
    const finalScore = currentScore();
    if (finalScore > best) {
        best = finalScore;
        if (window.Engine && Engine.Save) await Engine.Save.save();
    }
    if (window.GameSystem && GameSystem.Score) {
        await GameSystem.Score.submit(finalScore);
    }
}

function mousePressed() {
    if (state === STATE.MENU) {
        if (insideBtn(mouseX, mouseY)) startGame();
    } else if (state === STATE.GAME) {
        const px = screenXForCol(player.colF);
        const py = playerScreenY();
        const dx = mouseX - px;
        const dy = mouseY - py;
        if (abs(dy) > abs(dx)) move(dy < 0 ? "up" : "down");
        else move(dx < 0 ? "left" : "right");
    } else if (state === STATE.OVER) {
        if (insideBtn(mouseX, mouseY)) startGame();
    }
}

function touchStarted() {
    mousePressed();
    return false;
}

function keyPressed() {
    if (state === STATE.MENU || state === STATE.OVER) {
        if (key === " ") startGame();
        return;
    }
    if (state === STATE.GAME) {
        if (keyCode === UP_ARROW) move("up");
        else if (keyCode === DOWN_ARROW) move("down");
        else if (keyCode === LEFT_ARROW) move("left");
        else if (keyCode === RIGHT_ARROW) move("right");
    }
}
