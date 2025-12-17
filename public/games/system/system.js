/**
 * GameSystem Hub (v2 - Q5/P5Play Standard)
 * 
 * Ce script est injecté dans l'iframe de chaque jeu et fournit l'API
 * standardisée pour la soumission des scores et la gestion du cycle de vie.
 * Il utilise fetch pour communiquer avec le backend Next.js (/api/scores).
 */

(function () {
    // Vérifie si la configuration DyadGame est présente
    if (typeof window.DyadGame === 'undefined' || !window.DyadGame.id) {
        console.error("[GameSystem] Erreur: window.DyadGame.id n'est pas défini. Le jeu ne peut pas s'initialiser correctement.");
        return;
    }

    const GAME_ID = window.DyadGame.id;
    const API_URL = '/api/scores';

    /**
     * Gestion des scores (Soumission et Leaderboard)
     */
    const Score = {
        /**
         * Soumet un score au serveur.
         * @param {number} score - Le score du joueur.
         * @param {string} [playerName] - Nom du joueur (optionnel, sera ignoré si l'utilisateur est authentifié).
         * @returns {Promise<boolean>} True si la soumission a réussi.
         */
        async submit(score, playerName = 'Anonyme') {
            if (typeof score !== 'number' || score < 0) {
                console.warn(`[GameSystem] Tentative de soumission d'un score invalide: ${score}`);
                return false;
            }

            console.log(`[GameSystem] Soumission du score ${score} pour le jeu ${GAME_ID}...`);

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        gameId: GAME_ID,
                        score: score,
                        playerName: playerName, // Le backend gère l'identité si l'utilisateur est connecté
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("[GameSystem] Échec de la soumission du score:", response.status, errorData.error);
                    return false;
                }

                console.log("[GameSystem] Score soumis avec succès.");
                return true;

            } catch (error) {
                console.error("[GameSystem] Erreur réseau lors de la soumission du score:", error);
                return false;
            }
        },

        /**
         * Récupère le leaderboard pour le jeu actuel.
         * @returns {Promise<Array<{ playerName: string, score: number, date: string }>>}
         */
        async getLeaderboard() {
            console.log(`[GameSystem] Récupération du leaderboard pour ${GAME_ID}...`);
            try {
                const response = await fetch(`${API_URL}?gameId=${GAME_ID}`);

                if (!response.ok) {
                    console.error("[GameSystem] Échec de la récupération du leaderboard:", response.status);
                    return [];
                }

                const data = await response.json();
                console.log(`[GameSystem] Leaderboard récupéré (${data.length} entrées).`);
                return data;

            } catch (error) {
                console.error("[GameSystem] Erreur réseau lors de la récupération du leaderboard:", error);
                return [];
            }
        }
    };

    /**
     * Gestion de l'affichage (Fullscreen)
     */
    const Display = {
        toggleFullscreen() {
            const elem = document.documentElement;
            if (!document.fullscreenElement) {
                elem.requestFullscreen().catch(err => {
                    console.error(`[GameSystem] Erreur lors du passage en plein écran: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        }
    };

    /**
     * Gestion du cycle de vie (pour communication avec le wrapper React)
     */
    const Lifecycle = {
        /**
         * Notifie le wrapper parent que le jeu a fini de charger ses assets et est prêt à jouer.
         */
        notifyReady() {
            console.log("[GameSystem] Jeu prêt (notifyReady).");
            window.parent.postMessage({ type: 'GAME_READY', gameId: GAME_ID }, '*');
        },
    };

    // Expose l'API globale
    window.GameSystem = {
        config: window.DyadGame,
        Score,
        Display,
        Lifecycle,
    };

    // Dispatch un événement pour que les jeux puissent écouter la disponibilité du système
    document.dispatchEvent(new CustomEvent('dyad:system:ready'));

    console.log(`[GameSystem] Initialisé pour le jeu: ${GAME_ID}`);

})();
</dyad-file>

<dyad-delete path="public/games/snake/v3-system/snake.js"></dyad-delete>

<dyad-write path="public/games/snake/v3-system/sketch.js" description="Réécriture complète de la logique du jeu Snake avec les standards q5.js et p5play.">
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
    frameRate(10);
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