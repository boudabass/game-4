# Étape 9 : Caméra + HUD (2h)

## 🎯 Objectifs finaux
- [ ] Monde > écran (niveau étendu)
- [ ] Caméra suit joueur (lissage)
- [ ] HUD score/temps fixe
- [ ] Zoom et limites caméra
- [ ] Runner à défilement

## 📚 Concepts à maîtriser

### 1. Caméra p5.play
`camera.position.x = player.x;` ← Suivi manuel
`camera.follow(player);` ← Suivi automatique
`camera.zoom = 1.5;` ← Zoom
`camera.shake(10, 0.5);` ← Secousse

### 2. Monde étendu
`createCanvas(800, 600);` ← Taille fenêtre
`world.width = 2000;` ← Taille monde virtuel
`world.height = 1000;`

### 3. HUD (Interface fixe)
Le HUD doit être dessiné **après** `allSprites.draw()` et utiliser les coordonnées de l'écran (non affectées par la caméra).

```javascript
function drawHUD() {
    // Utilise width/height, pas camera.position
    textAlign(LEFT);
    text("Score: " + score, 20, 30);
}
```

### 4. Limites de la caméra
`camera.bounds = { left: 0, right: world.width, top: 0, bottom: world.height };`

## 🛠️ Progression pratique (1h30)

### **Phase 1 : Monde étendu (30min)**
✅ `world.width = 2000`
✅ Créer 10 plateformes sur 2000px
✅ Joueur se déplace sur ce monde

### **Phase 2 : Caméra follow (30min)**
✅ `camera.follow(player, 0.1)` (lissage 0.1)
✅ Caméra suit le joueur horizontalement
✅ Limites de la caméra (ne pas voir le noir au-delà de 2000px)

### **Phase 3 : HUD fixe (20min)**
✅ Afficher le score en haut-gauche
✅ Le score doit rester fixe même si la caméra bouge
✅ Afficher les vies (HUD)

### **Phase 4 : Mini-jeu final (10min)**
🎮 "Runner à défilement"

Niveau 2000px large

Caméra suit joueur fluide

HUD score/vies fixe

## ✅ Checklist validation
[ ] `world.width` > `width`
[ ] Caméra suit joueur fluide
[ ] HUD (score) reste fixe
[ ] Limites caméra fonctionnent
[ ] Code < 150 lignes

## 🚨 Erreurs fréquentes
❌ Dessiner HUD avant `allSprites.draw()` → caché
❌ Oubli `camera.follow()` → caméra fixe
❌ `camera.position` sans lissage → saccadé
❌ `world.width` non défini → monde infini

## 📁 Structure fichiers
`etape9/`
├── `index.html`
└── `sketch.js`

## 🎮 Résultat attendu
Niveau beaucoup plus large que l'écran
Caméra suit le joueur avec un léger retard
Score et vies affichés en permanence en haut de l'écran