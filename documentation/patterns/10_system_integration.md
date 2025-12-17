# 10_system_integration.md
Intégration transparente GameSystem + p5play
Principe : system.js (UI globale) + p5play (moteur jeu) = complémentarité parfaite.

Contrat inchangé : tous les jeux appellent `window.GameSystem.Score.submit()`.

```xml
<!-- index.html (IDENTIQUE) -->
<script>window.DyadGame = { id: 'snake-p5play', version: 'v1' };</script>
<script src="https://unpkg.com/q5@3/q5.min.js"></script>
<script src="https://unpkg.com/p5play@3/build/p5play.min.js"></script>
<script src="../../system/system.js"></script> <!-- Menu ☰ auto -->
<script src="snake.js"></script>
```
Événements p5play → GameSystem (callbacks propres)
```javascript
// ❌ AVANT : death() manuelle avec dist()
death() {
    for(let t of tail) {
        if(dist(pos, t) < 1) GameSystem.Score.submit(total);
    }
}

// ✅ APRÈS : collision callback p5play
snake.collides(tailGroup, () => {
    window.GameSystem.Score.submit(snake.life * 100);
    states.next('gameover');
});

// Nourriture (overlap auto)
snake.overlaps(foodGroup, food => {
    food.remove();
    snake.life++;
});
```
Cycle de vie scène + GameSystem hooks
```javascript
states.add('menu', {
    start: () => {
        window.GameSystem.Lifecycle.notifyReady();  // Signal prêt
    },
    update: () => {
        if(q5.key === 'enter') states.next('game');
    }
});

states.add('gameover', {
    start: (finalScore) => {
        window.GameSystem.Score.submit(finalScore);  // Auto-submit
        // Leaderboard auto
        window.GameSystem.Score.getLeaderboard().then(scores => {
            states.gameover.scores = scores.slice(0, 5);
        });
    }
});
```
Pause globale (menu ☰ ↔ p5play)
```javascript
// system.js appelle ça via postMessage ou global
window.GameSystem.pauseGame = () => {
    World.paused = true;     // Pause physique/collisions
    states.current.paused = true;
};

// Reprise
window.GameSystem.resumeGame = () => {
    World.paused = false;
};
```
Debug unifié (GameSystem + p5play)
```javascript
// Ajouté dans system.js (bouton menu ☰)
window.GameSystem.debugToggle = () => {
    allSprites.debug = !allSprites.debug;
    camera.debug = !camera.debug;
    World.debug = !World.debug;
    console.log('Debug:', allSprites.debug);
};

// Inputs debug (F1)
q5.keyPress = () => {
    if(q5.key === 'f1') window.GameSystem.debugToggle();
};
```
Leaderboard en scène gameover
```javascript
states.gameover = {
    draw: async () => {
        clear();
        textAlign(CENTER);
        text('GAME OVER', width/2, height/2 - 60);
        text(`Score: ${states.gameover.finalScore}`, width/2, height/2 - 20);
        
        // Top 5 live
        let scores = await window.GameSystem.Score.getLeaderboard();
        for(let i = 0; i < 5; i++) {
            let rank = scores[i];
            if(rank) {
                fill(rank.score > states.gameover.finalScore ? '#fbbf24' : '#aaa');
                text(`${i+1}. ${rank.playerName}: ${rank.score}`, width/2, height/2 + 40 + i*25);
            }
        }
    }
};
```
Fullscreen + responsive GameSystem
```javascript
// system.js fullscreen → p5play adaptatif
window.GameSystem.Display.toggleFullscreen = () => {
    if(!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        camera.zoomTo(1);  // Reset zoom fullscreen
    } else {
        document.exitFullscreen();
    }
};

// Auto-resize (iframe + fullscreen)
window.onresize = () => {
    resizeCanvas(windowWidth, windowHeight);
    camera.viewSize = rect(0, 0, windowWidth, windowHeight);
};
```
Flux intégration complet (Snake p5play)
```javascript
q5.setup = () => {
    new Canvas(windowWidth, windowHeight);
    states.enable = true;
    states.load('menu');  // GameSystem menu ☰ injecté auto
};

states.game.start = () => {
    snake = sprite(width/2, height/2, scl);
    createFoodGroup();
    
    // Contrôles unifiés
    q5.keyPress = handleSnakeInput;
    
    // GameSystem prêt
    window.GameSystem.Lifecycle.notifyReady();
};

snake.collides = () => {
    window.GameSystem.Score.submit(snake.life * 100);
    states.next('gameover');
};
```
Bonnes pratiques intégration vérifiées
Ordre chargement critique :

```text
1. q5.js (rendu)
2. p5play (moteur)
3. system.js (UI globale) 
4. jeu.js (logique)
```
Événements lifecycle :

```javascript
states.gameover.start = () => GameSystem.Score.submit();
q5.setup = () => GameSystem.Lifecycle.notifyReady();