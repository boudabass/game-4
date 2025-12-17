# Étape 7 : Physique p5.play (3h)

## 🎯 Objectifs finaux
- [ ] Gravité automatique fonctionnelle
- [ ] Saut précis et contrôlable
- [ ] 10+ collisions physiques
- [ ] Plateformer : ne pas tomber
- [ ] Rebond + limites niveau

## 📚 Concepts à maîtriser

### 1. Physique intégrée p5.play
`sprite.collider = 'dynamic';` ← Physique active
`sprite.collider = 'static';` ← Immobile (plateforme)
`sprite.collider = 'none';` ← Fantôme

### 2. Gravité et vitesse
`sprite.velocity.y += 0.5;` ← Gravité chaque frame
`sprite.velocity.y = -12;` ← Saut (vitesse négative)
`sprite.friction = 0.8;` ← Ralentissement sol

### 3. Collisions avancées
`sprite.bounce(other);` ← Rebond
`sprite.overlap(other, callback);`← Détection sans collision
`platforms.collide(player);` ← Groupe vs sprite

## 🛠️ Progression pratique (2h30)

### **Phase 1 : Physique de base (30min)**
✅ `player.collider = 'dynamic'`
✅ `platforms = new Group()` ← Toutes plateformes
✅ gravité = 0.5 chaque frame
✅ `player.collide(platforms)`

### **Phase 2 : Saut parfait (40min)**
✅ Espace → `if(onGround) velocity.y = -12`
✅ `onGround = player.colliding(platforms)`
✅ 5 plateformes variées (hauteurs différentes)
✅ Limites écran (murs invisibles)

### **Phase 3 : Plateformer complet (50min)**
✅ 8+ plateformes + sol
✅ Zones mortelles (bas écran)
✅ Respawn haut après chute
✅ Compteur sauts réussis

### **Phase 4 : Mini-jeu final (30min)**
🎮 "Plateformer simple"

10 plateformes escalier

Saut espace/touch

Chute = respawn

Score = plateformes atteintes

## ✅ Checklist validation
[ ] Gravité fluide (chute réaliste)
[ ] Saut précis (pas double-saut)
[ ] 12+ collisions actives
[ ] Plateformes variées
[ ] Respawn après chute
[ ] Code < 100 lignes

## 🚨 Erreurs fréquentes
❌ gravité dans `setup()` → figé
❌ `velocity.y` sans limites → tombe infiniment
❌ `collider 'none'` sur joueur → traverse tout
❌ `overlap()` au lieu de `collide()` → pas physique
❌ Saut sans test sol → vol infini

## 📁 Structure fichiers
`etape7/`
├── `index.html` ← p5 + p5.play CDN
└── `sketch.js`

## 🎮 Résultat attendu
Joueur bleu saute réalistement
10 plateformes + sol gris
Chute hors écran = respawn haut
Physique fluide (pas de code collision manuel)
Score plateformes visitées