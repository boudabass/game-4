# Étape 10 : Architecture jeu complet (3h)

## 🎯 Objectifs finaux
- [x] Structure pro (fichiers séparés)
- [x] Multi-états (Menu, Jeu, Game Over)
- [x] Utilisation des `states` p5play (Adapté : Gestionnaire maison switch/case)
- [x] Intégration `GameSystem` (score final)
- [x] Plateformer complet v1

## 📚 Concepts à maîtriser

### 1. Fichiers séparés
`index.html` charge : `config.js`, `player.js`, `enemy.js`, `sketch.js`

### 2. Gestion des états (p5play)
`states.add('menu', { start, update, draw });`
`states.add('game', { start, update, draw });`
`states.load('menu');`
`states.next('gameover');`

### 3. Intégration GameSystem
`states.gameover.start = function() {`
`window.GameSystem.Score.submit(finalScore);`
`}`

### 4. Nettoyage de scène
`states.game.start = function() {`
`allSprites.clear();` // Supprime tous les sprites précédents
`// ... création des nouveaux sprites`
`}`

## 🛠️ Progression pratique (2h30)

### **Phase 1 : Séparation des fichiers (30min)**
✅ Créer `player.js` (classe ou fonctions)
✅ Créer `enemy.js` (classe ou fonctions)
✅ `sketch.js` ne contient que `setup()`, `draw()`, et la gestion des états.
✅ Mettre à jour `index.html` pour charger les nouveaux scripts.

### **Phase 2 : Menu et Game Over (50min)**
✅ `states.add('menu', ...)` : Affiche titre, instructions, bouton "Start" (touche Espace/Entrée).
✅ `states.add('game', ...)` : Contient la logique du jeu (étapes 7/8).
✅ `states.add('gameover', ...)` : Affiche score final, bouton "Restart".
✅ `states.enable = true; states.load('menu');` dans `setup()`.

### **Phase 3 : Intégration finale (40min)**
✅ Dans `states.gameover.start`, appeler `window.GameSystem.Score.submit(finalScore)`.
✅ Dans `states.menu.start`, appeler `window.GameSystem.Lifecycle.notifyReady()`.
✅ S'assurer que `states.game.start` nettoie les anciens sprites.

### **Phase 4 : Mini-jeu final (30min)**
🎮 "Plateformer complet v1"

Jeu complet avec Menu, Game Over, Score, Vies, Ennemis, Pièces.

## ✅ Checklist validation
[x] 3 états (`menu`, `game`, `gameover`) fonctionnels
[x] Logique séparée en fichiers
[x] `GameSystem.Score.submit()` appelé à la fin
[x] `GameSystem.Lifecycle.notifyReady()` appelé au début
[x] Le jeu est un produit fini (Menu → Jeu → Fin)

## 🚨 Erreurs fréquentes
❌ Oubli de charger un script dans `index.html` → `undefined`
❌ `allSprites.clear()` non appelé dans `states.game.start` → sprites fantômes
❌ `states.enable` non défini → états ignorés
❌ `states.next()` sans argument → crash

## 📁 Structure fichiers
`etape10/`
├── `index.html`
├── `sketch.js`
├── `player.js`
└── `enemy.js`

## 🎮 Résultat attendu
Un jeu de plateforme complet avec un cycle de vie clair (Menu, Jeu, Fin).
Le score est envoyé à la plateforme à la fin de la partie.