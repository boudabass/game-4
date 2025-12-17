// Forcer q5 en mode Canvas 2D pour une compatibilité maximale
q5.mode = '2d';

let snake, foodGroup, tailGroup;
let scl = 20;
let score = 0;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

/**
 * Crée un sprite de nourriture à une position aléatoire sur la grille.
 */
function createFood() {
    const x = floor(random(GAME_WIDTH) / scl) * scl + scl / 2;
    const y = floor(random(GAME_HEIGHT) / scl) * scl + scl / 2;
    
    let f = new Sprite(x, y, scl, scl, 'static');
    f.color = color(255, 0, 100);
    f.layer = 0;
    foodGroup.add(f);
}

/**
 * Réinitialise l'état du jeu pour une nouvelle partie.
 */
function resetGame() {
    allSprites.clear();
    
    foodGroup = new Group();
    tailGroup = new Group();
    
    snake = new Sprite(scl * 5 + scl/2, scl * 5 + scl/2, scl, scl, 'dynamic');
    snake.color = color(255);
    snake.layer = 1;
    snake.vel.set(scl, 0);
    snake.rotationLock = true;
    
    for (let i = 0; i < 25; i++) {
        createFood();
    }
    score = 0;
}

// --- Moteur de jeu P5Play ---

q5.setup = () => {
    new Canvas(GAME_WIDTH, GAME_HEIGHT);
    frameRate(10); // Limite les FPS pour un feeling "classique"
    World.gravity.y = 0;

    // Définition des états de jeu
    states.add('menu', {
        start: () => {
            if (window.GameSystem) window.GameSystem.Lifecycle.notifyReady();
        },
        draw: () => {
            textAlign(CENTER, CENTER);
            fill(255);
            textSize(40);
            text('SNAKE', width / 2, height / 2 - 40);
            textSize(20);
            text('Appuyez sur ESPACE pour commencer', width / 2, height / 2 + 20);
        },
        update: () => {
            if (kb.presses('space')) states.load('game');
        }
    });

    states.add('game', {
        start: resetGame,
        update: () => {
            // Mouvement de la queue
            if (tailGroup.length > 0) {
                for (let i = tailGroup.length - 1; i > 0; i--) {
                    tailGroup[i].pos.set(tailGroup[i - 1].pos);
                }
                tailGroup[0].pos.set(snake.oldPos);
            }

            // Collisions
            snake.overlaps(foodGroup, (s, f) => {
                f.remove();
                score += 100;
                const lastSegment = tailGroup.length > 0 ? tailGroup[tailGroup.length - 1] : snake;
                let newSegment = new Sprite(lastSegment.oldPos.x, lastSegment.oldPos.y, scl, scl, 'static');
                newSegment.color = color(255);
                tailGroup.add(newSegment);
                createFood();
            });

            if (snake.overlaps(tailGroup)) {
                states.load('gameover', score);
            }

            snake.wrap();
        }
    });

    states.add('gameover', {
        start: (finalScore) => {
            if (window.GameSystem) window.GameSystem.Score.submit(finalScore);
        },
        draw: (finalScore) => {
            textAlign(CENTER, CENTER);
            fill(255, 0, 0);
            textSize(50);
            text('GAME OVER', width / 2, height / 2 - 60);
            fill(255);
            textSize(30);
            text(`Score: ${finalScore}`, width / 2, height / 2);
            textSize(20);
            text('Appuyez sur R pour rejouer', width / 2, height / 2 + 50);
        },
        update: () => {
            if (kb.presses('r')) states.load('game');
        }
    });

    states.enable = true;
    states.load('menu');
};

q5.draw = () => {
    clear();
    if (states.current.name === 'game') {
        fill(255);
        textSize(24);
        textAlign(LEFT, TOP);
        text(`Score: ${score}`, 10, 10);
    }
};

q5.keyReleased = () => {
    if (states.current.name !== 'game') return;

    if (q5.key === 'ArrowUp' && snake.vel.y !== scl) snake.vel.set(0, -scl);
    else if (q5.key === 'ArrowDown' && snake.vel.y !== -scl) snake.vel.set(0, scl);
    else if (q5.key === 'ArrowLeft' && snake.vel.x !== scl) snake.vel.set(-scl, 0);
    else if (q5.key === 'ArrowRight' && snake.vel.x !== -scl) snake.vel.set(scl, 0);
};