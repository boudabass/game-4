# Étape 2 : Variables + États (2h)

## 🎯 Objectifs finaux
- [ ] Animation automatique (rebonds)
- [ ] Compteur temps/score fonctionnel
- [ ] Détection collision bords écran
- [ ] Game over + restart
- [ ] Variables vitesse X/Y dynamiques

## 📚 Concepts à maîtriser

### 1. Variables d'animation
`let x = 400;` ← Position X
`let y = 300;` ← Position Y
`let speedX = 3;` ← Vitesse horizontale
`let speedY = 2;` ← Vitesse verticale

### 2. Temps et compteurs
`frameCount` ← Frame depuis démarrage
`millis()` ← Millisecondes depuis démarrage
`let score = 0;` ← Compteur manuel
`score++;` ← Incrémente chaque frame

### 3. États de jeu
`let gameState = "playing";` ← "playing", "gameOver"
`if (gameState === "playing") { ... }`

### 4. Détection bords
`if (x > width || x < 0) speedX *= -1;` ← Rebond gauche/droite
`if (y > height || y < 0) speedY *= -1;` ← Rebond haut/bas

## 🛠️ Progression pratique (1h30)

### **Phase 1 : Carré animé (20min)**
✅ Variables x, y, speedX, speedY
✅ `x += speedX; y += speedY;` chaque frame
✅ Rebond murs (`speed *= -1`)
✅ Carré 50x50 coloré

### **Phase 2 : Compteur temps (20min)**
✅ `let score = 0;`
✅ `score++` chaque frame
✅ Affichage : `text("Score: " + score, 20, 30)`
✅ `textSize(24)`, `fill(255)`

### **Phase 3 : Game Over (30min)**
✅ Centre écran mortel (`rect 200x200`)
✅ Collision centre → `gameState = "gameOver"`
✅ Écran game over : `text("PERDU!", centre)`
✅ R touche → reset (`x=400, y=300, score=0`)

### **Phase 4 : Mini-jeu final (20min)**
🎮 "Éviter les bords"

Carré rebondit murs (vitesse augmente)

Zone centre mortelle (200x200 pixels)

Score = temps survie (`millis()/1000`)

R = restart instantané

## ✅ Checklist validation
[ ] Carré rebondit 4 bords
[ ] Score incrémente fluide
[ ] Zone centre détectée
[ ] Game over affiché
[ ] R restart fonctionne
[ ] Code < 70 lignes

## 🚨 Erreurs fréquentes
❌ `speedX++` → accélère infiniment
❌ `if(x > width) x = 0` → téléport
❌ `score++` dans `setup()` → 1 seule fois
❌ `text()` sans `fill()` → invisible
❌ `gameState` sans quotes → undefined

## 📁 Structure fichiers
`etape2/`
├── `index.html`
└── `sketch.js`

## 🎮 Résultat attendu
Carré coloré rebondit murs (accélère)
Score temps en haut-gauche augmente
Zone rouge centre = mort instantanée
Écran "PERDU! Score: XXX" + touche R
Animation fluide 60fps