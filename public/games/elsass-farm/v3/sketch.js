/*
 * sketch.js — Prototype GRAY-BOX Elsass Farm v3 (phase 01, pré-production)
 *
 * Objectif unique : valider le pivot d'interaction de la V2.
 *   - clic HORS de la zone d'action  -> le personnage se déplace (contournement)
 *   - clic DANS la zone d'action     -> "action" (la tuile clignote en vert)
 * Plus : caméra qui suit + boutons de zoom, horloge 1 min = 1 h, sauvegarde
 * de la position et du temps, test de rendu des emoji (coin bas-gauche).
 *
 * Pas d'art final, pas de culture, pas de PNJ : c'est volontaire (roadmap 01).
 */

const C = window.FarmConfig;

let player = null;        // marcheur (Engine.Mover)
let wasMoving = false;    // pour détecter la fin d'un trajet (-> save locale)
let moveMarker = null;    // { x, y, t } dernière destination cliquée
let actionFlash = null;   // { c, r, t } tuile "actionnée"
let zoomBtns = {};        // zones cliquables des boutons + / − (coords écran)

// Transition de zone (fondue)
let zoneTransition = null; // { phase: 'out'|'in', zoneId, entry, t, duration: 250 }

// u(n) = n % du plus petit côté de l'écran — pour TOUT le HUD.
function u(n) {
    return (min(width, height) * n) / 100;
}

function preload() {
    // Charger tous les assets Tiny Farm listés dans FarmConfig.assets
    var base = C.assets.base;

    // Charger une image et la stocker dans un cache nommé par catégorie
    function loadCat(cat) {
        var list = C.assets[cat];
        if (!list) return;
        var cache = {};
        for (var i = 0; i < list.length; i++) {
            var path = list[i];
            var key = path.replace(cat + "/", "").replace(".png", "");
            cache[key] = loadImage(base + path);
        }
        C.assets[cat + "_loaded"] = cache;
    }

    loadCat("sol");
    loadCat("decor");
    loadCat("perso");
    loadCat("batiment");
    loadCat("objet");

    // Charger la définition des zones (WorldZone)
    C._zonesData = loadJSON("data/zones/zones.json");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);

    // --- Configuration des zones (WorldZone) ---
    if (Engine.WorldZone && C._zonesData) {
        Engine.WorldZone.configure({ zones: C._zonesData });
    }

    // --- Grille + obstacles (legacy, ou zone par défaut si WorldZone non configuré) ---
    Engine.Grid.configure(C.grid);
    C.obstacles.rects.forEach(function (o) {
        for (var dc = 0; dc < o.w; dc++)
            for (var dr = 0; dr < o.h; dr++)
                Engine.Grid.setWalkable(o.c + dc, o.r + dr, false);
    });
    C.obstacles.singles.forEach(function (o) {
        Engine.Grid.setWalkable(o.c, o.r, false);
    });

    // --- Personnage ---
    player = Engine.Mover.create({
        grid: Engine.Grid,
        c: C.player.c, r: C.player.r,
        speed: C.player.speed
    });

    // --- Zone d'action ---
    Engine.ActionZone.configure({ range: C.actionRange });

    // --- Caméra ---
    Engine.Camera.configure({ minZoom: 0.5, maxZoom: 2.2, zoom: 1 });
    Engine.Camera.setWorldBounds(Engine.Grid.worldWidth(), Engine.Grid.worldHeight());
    Engine.Camera.snapTo(player.x, player.y);

    // --- Horloge : 1 min réelle = 1 h en jeu, journée démarre à 7 h ---
    Engine.Clock.configure({
        startHour: 7,
        onNewDay: function () { if (window.Engine && Engine.Save) Engine.Save.save(); }
    });

    boot();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Démarrage : chargement de la sauvegarde (position + temps), fin du loader.
async function boot() {
    if (window.Engine && Engine.Loader) Engine.Loader.start(2);

    if (window.Engine && Engine.Save) {
        Engine.Save.configure({
            key: "elsass-farm-v3",
            gather: function () {
                var t = player.tile() || { c: C.player.c, r: C.player.r };
                var data = {
                    day: Engine.Clock.day,
                    hour: Engine.Clock.hour,
                    minute: Engine.Clock.minute,
                    c: t.c, r: t.r
                };
                // Sauvegarder la zone courante (WorldZone)
                if (Engine.WorldZone && Engine.WorldZone.getCurrent()) {
                    data.zoneId = Engine.WorldZone.getCurrent().id;
                }
                return data;
            },
            apply: function (data) {
                if (!data) return;
                // Restaurer la zone sauvegardée AVANT de replacer le joueur
                if (data.zoneId && Engine.WorldZone) {
                    Engine.WorldZone.setCurrent(data.zoneId);
                }
                if (typeof data.day === "number")
                    Engine.Clock.setTime(data.day, data.hour, data.minute);
                if (typeof data.c === "number" && Engine.Grid.isWalkable(data.c, data.r)) {
                    player.placeAt(data.c, data.r);
                    Engine.Camera.snapTo(player.x, player.y);
                }
            }
        });
        if (Engine.Loader) Engine.Loader.step("Chargement de la sauvegarde...");
        await Engine.Save.load();
    }

    if (window.Engine && Engine.Loader) Engine.Loader.finish();
}

function draw() {
    background(C.colors.bg);

    // --- Simulation ---
    if (!zoneTransition) {
        Engine.Clock.update(deltaTime);
        player.update(deltaTime);
    }
    Engine.Camera.follow(player.x, player.y);

    // Fin de trajet -> petite sauvegarde locale (gratuite).
    if (wasMoving && !player.isMoving() && window.Engine && Engine.Save) {
        Engine.Save.saveLocal();
    }
    wasMoving = player.isMoving();

    // --- Monde (sous caméra) ---
    push();
    Engine.Camera.apply();
    drawWorld();
    pop();

    // --- HUD (coordonnées écran) ---
    drawHud();

    // --- Fondu de transition entre zones ---
    drawZoneFade();
}

function drawWorld() {
    // Sol
    noStroke();
    fill(C.colors.ground);
    rect(0, 0, Engine.Grid.worldWidth(), Engine.Grid.worldHeight());

    // Grille + obstacles (rendu debug du socle)
    Engine.Grid.drawDebug({ line: C.colors.gridLine, blocked: C.colors.blocked });

    // Marqueur de destination (s'estompe en 1 s)
    if (moveMarker && millis() - moveMarker.t < 1000) {
        var a = 1 - (millis() - moveMarker.t) / 1000;
        noFill();
        stroke("rgba(79,195,247," + a.toFixed(2) + ")");
        strokeWeight(3);
        circle(moveMarker.x, moveMarker.y, Engine.Grid.tileSize * 0.6);
        noStroke();
    }

    // Flash vert de la tuile "actionnée" (0,6 s)
    if (actionFlash && millis() - actionFlash.t < 600) {
        var s = Engine.Grid.tileSize;
        fill(C.colors.actionFlash);
        rect(actionFlash.c * s + 2, actionFlash.r * s + 2, s - 4, s - 4, 6);
    }

    // Zone d'action (debug) + chemin restant
    Engine.ActionZone.drawDebug(Engine.Grid, player.tile(), C.colors.zone);
    player.drawDebugPath(C.colors.path);

    // Personnage : cercle gray-box + emoji (test de rendu)
    var d = Engine.Grid.tileSize * 0.7;
    fill(C.colors.player);
    circle(player.x, player.y, d);
    textSize(Engine.Grid.tileSize * 0.5);
    text("🧑‍🌾", player.x, player.y - Engine.Grid.tileSize * 0.05);
}

function drawHud() {
    // Bandeau horloge (haut centre)
    var label = "Jour " + Engine.Clock.day + " — " + Engine.Clock.timeString();
    textSize(u(3.2));
    var w = textWidth(label) + u(6);
    fill(C.colors.hudPanel);
    rect(width / 2 - w / 2, u(2), w, u(6), u(1.5));
    fill(C.colors.hudText);
    text(label, width / 2, u(2) + u(3));

    // Boutons zoom + / − (bas droite)
    var size = u(9);
    var x = width - size - u(3);
    var yPlus = height - size * 2 - u(5);
    var yMinus = height - size - u(3);
    zoomBtns.plus = { x: x, y: yPlus, w: size, h: size };
    zoomBtns.minus = { x: x, y: yMinus, w: size, h: size };
    fill(C.colors.button);
    rect(x, yPlus, size, size, u(2));
    rect(x, yMinus, size, size, u(2));
    fill(C.colors.buttonText);
    textSize(u(5));
    text("+", x + size / 2, yPlus + size / 2);
    text("−", x + size / 2, yMinus + size / 2);

    // Test emoji (bas gauche) — vérifier le rendu sur Windows/Android/iOS
    textSize(u(2.2));
    fill(C.colors.hudPanel);
    rect(u(2), height - u(9), u(34), u(7), u(1.5));
    fill(C.colors.hudText);
    textAlign(LEFT, CENTER);
    text("test emoji : 🧑‍🌾 🥕 🐔 🐟 💎", u(4), height - u(5.5));
    textAlign(CENTER, CENTER);
}

function inRect(mx, my, b) {
    return b && mx > b.x && mx < b.x + b.w && my > b.y && my < b.y + b.h;
}

function mousePressed() {
    // Bloquer les inputs pendant une transition
    if (zoneTransition) return;

    // 1. HUD d'abord (coordonnées écran)
    if (inRect(mouseX, mouseY, zoomBtns.plus)) { Engine.Camera.zoomIn(); return; }
    if (inRect(mouseX, mouseY, zoomBtns.minus)) { Engine.Camera.zoomOut(); return; }

    // 2. Sinon, clic dans le monde
    var w = Engine.Camera.screenToWorld(mouseX, mouseY);
    var tile = Engine.Grid.toTile(w.x, w.y);
    if (!tile) return; // clic hors de la grille

    if (Engine.ActionZone.contains(player.tile(), tile)) {
        // Pivot d'interaction : DANS la zone -> action (simulée en gray-box)
        actionFlash = { c: tile.c, r: tile.r, t: millis() };
    } else {
        // HORS zone -> déplacement avec contournement
        player.moveTo(tile.c, tile.r);
        var center = Engine.Grid.toWorld(tile.c, tile.r);
        moveMarker = { x: center.x, y: center.y, t: millis() };
    }
}

// --- Transition entre zones (ZoneLoader) ---

/* Déclenche une transition avec fondu vers une nouvelle zone. */
function switchToZone(zoneId) {
    if (!Engine.WorldZone || zoneTransition) return;
    zoneTransition = { phase: 'out', zoneId: zoneId, t: millis(), duration: 250 };
}

/* Rendu du fondu de transition. Appelé dans draw(). */
function drawZoneFade() {
    if (!zoneTransition) return;

    var elapsed = millis() - zoneTransition.t;
    var progress = min(elapsed / zoneTransition.duration, 1);
    var alpha = 0;

    if (zoneTransition.phase === 'out') {
        alpha = progress * 255;
        if (progress >= 1) {
            // Fin du fade-out : exécuter la transition
            Engine.WorldZone.switchZone(zoneTransition.zoneId, function (entry) {
                if (entry) {
                    player.placeAt(entry.c, entry.r);
                    Engine.Camera.snapTo(player.x, player.y);
                }
            });
            zoneTransition.phase = 'in';
            zoneTransition.t = millis();
            alpha = 255;
        }
    } else if (zoneTransition.phase === 'in') {
        alpha = (1 - progress) * 255;
        if (progress >= 1) {
            zoneTransition = null;
            alpha = 0;
        }
    }

    // Dessiner le fondu
    noStroke();
    fill(0, 0, 0, alpha);
    rect(0, 0, width, height);
}
