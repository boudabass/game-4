let player;
let ground;
let platform1;
let platform2;

function setup() {
    // Création du canvas
    createCanvas(800, 600);
    
    // 1. Création du Sprite Joueur (cercle bleu)
    // new Sprite(x, y, diamètre)
    player = new Sprite(width / 2, height / 2, 40);
    player.color = 'blue';
    
    // 2. Création du Sol (rectangle statique)
    // new Sprite(x, y, largeur, hauteur)
    ground = new Sprite(width / 2, height - 25, width, 50);
    ground.color = 'green';
    
    // 3. Création des Plateformes (rectangles statiques)
    platform1 = new Sprite(200, 400, 150, 20);
    platform1.color = 'gray';
    
    platform2 = new Sprite(600, 250, 150, 20);
    platform2.color = 'gray';
    
    // --- Configuration Physique ---
    
    // Le joueur est dynamique (affecté par la gravité et les forces)
    player.collider = 'dynamic';
    
    // Le sol et les plateformes sont statiques (immobiles, mais bloquent les dynamiques)
    ground.collider = 'static';
    platform1.collider = 'static';
    platform2.collider = 'static';
    
    // On applique une gravité simple (sera améliorée à l'étape 7)
    world.gravity.y = 10; 
    
    // On signale au GameSystem que le jeu est prêt
    if(window.GameSystem) {
        window.GameSystem.Lifecycle.notifyReady();
    }
}

function draw() {
    background(50); // Fond gris foncé
    
    // --- Contrôles du joueur ---
    // Mouvement horizontal simple
    if (keyIsDown(LEFT_ARROW)) {
        player.vel.x = -5;
    } else if (keyIsDown(RIGHT_ARROW)) {
        player.vel.x = 5;
    } else {
        // Ralentissement si aucune touche n'est pressée
        player.vel.x = lerp(player.vel.x, 0, 0.1);
    }
    
    // --- Rendu ---
    // p5play dessine tous les sprites automatiquement
    allSprites.draw();
}

function windowResized() {
    // Maintient le canvas à la taille de la fenêtre si on le souhaite, 
    // mais pour cette leçon, on garde 800x600 pour la simplicité.
    // resizeCanvas(windowWidth, windowHeight);
}
</dyad-file>

<dyad-write path="documentation/learn/etape6.md" description="Mise à jour de la documentation pour l'Étape 6.">
# Étape 6 : p5.play Sprites (2h)

## 🎯 Objectifs finaux
- [ ] p5.play chargé et fonctionnel
- [ ] 3+ sprites visibles
- [ ] `allSprites.draw()` obligatoire
- [ ] Joueur sprite contrôlable
- [ ] Plateforme statique + collision

## 📚 Concepts à maîtriser

### 1. Installation p5.play
`index.html` doit charger les librairies dans cet ordre :

```html
<script src="https://cdn.jsdelivr.net/npm/p5@1.11.4/lib/p5.js"></script>
<script src="https://p5play.org/v3/planck.min.js"></script>
<script src="https://p5play.org/v3/p5play.js"></script>
```

### 2. Sprites de base
`let player = new Sprite(400, 300, 50, 50);` ← Rectangle
`player.color = 'blue';` ← Couleur
`player.x = 200;` ← Position
`player.rotation = 45;` ← Rotation

### 3. `allSprites.draw()` OBLIGATOIRE
```javascript
function draw() {
    background(0);
    // TOUS sprites dessinés AUTO
    allSprites.draw(); 
}
```

### 4. Types de Collider (Physique)
- `sprite.collider = 'dynamic';` : Affecté par la gravité et les forces.
- `sprite.collider = 'static';` : Immobile, mais bloque les sprites dynamiques (parfait pour les sols et murs).
- `sprite.collider = 'kinematic';` : Peut être déplacé par la vitesse (`sprite.vel`) mais n'est pas affecté par la gravité.

## 🛠️ Progression pratique (1h30)

### **Phase 1 : p5.play de base (20min)**
✅ Ajoute p5.play CDN dans `index.html`
✅ 1 sprite joueur bleu centre écran
✅ `allSprites.draw()` dans `draw()`
✅ Sprite bouge avec flèches (`sprite.x += 5`)

### **Phase 2 : Sol + plateformes (25min)**
✅ Sprite sol (800, 50) bas écran
✅ 2 sprites plateforme (100x20) en hauteur
✅ Définir `collider = 'static'` pour les plateformes
✅ Définir `collider = 'dynamic'` pour le joueur

### **Phase 3 : Contrôles avancés (25min)**
✅ Flèches gauche/droite → vitesse horizontale (`player.vel.x`)
✅ Utiliser `lerp()` pour un arrêt progressif (friction)
✅ Vérifier que le joueur tombe et s'arrête sur le sol/les plateformes.

### **Phase 4 : Mini-jeu final (20min)**
🎮 "Plateforme statique"

Joueur sprite bleu contrôlable

Sol + 3 plateformes fixes

Gravité simple (`world.gravity.y = 10`)

Collision physique auto

## ✅ Checklist validation
[ ] p5.play CDN chargé (console sans erreur)
[ ] `allSprites.draw()` dans `draw()`
[ ] 4 sprites visibles (joueur + sol + 2 plateformes)
[ ] Joueur tombe et s'arrête sur le sol
[ ] Collision plateforme fonctionne
[ ] Mouvement horizontal fluide