# 🏗️ Patterns : Structure & Architecture (Standard Q5/P5Play)

Ce guide consolide les bonnes pratiques d'architecture en utilisant le nouveau standard **Q5.js + P5Play**.

## 1. La Boucle Vitale (Game Loop)
La structure de base est désormais gérée par `q5.js`.

**Fichier : `main.js` ou `sketch.js`**
```javascript
// L'initialisation se fait dans q5.setup
q5.setup = () => {
    // Crée le canvas et initialise le moteur de physique
    new Canvas(windowWidth, windowHeight); 
    
    // Initialisation des Sprites et Groupes
    // let player = new Sprite(100, 100);
    // let enemies = new Group();
};

// La boucle de jeu principale
q5.draw = () => {
    clear(); // Nettoyage
    // La logique de mouvement, collision et rendu des sprites est gérée automatiquement par P5Play.
    // Ici, on gère les inputs et les changements d'état.
};
```

## 2. Approches de Gestion d'État

Nous utilisons désormais les fonctionnalités de **Scènes et d'États de Jeu** intégrées à P5Play.

### A. Le "Scene Manager" (Modèle P5Play)
Idéal pour les jeux avec des phases distinctes (Intro -> Jeu -> Fin).

*   **Principe :** Utiliser la classe `Scene` de P5Play pour gérer les transitions.
*   **Avantage :** Code très cloisonné, gestion automatique de la boucle de jeu pour chaque état.

```javascript
// Pattern Scene (P5Play)
let gameScene = new Scene();
let menuScene = new Scene();

// Dans q5.draw, P5Play gère automatiquement quelle scène est active.
// On utilise des fonctions comme gameScene.enter() et gameScene.exit().
```

### B. Le "Entity Manager" (Modèle P5Play)
Idéal pour les jeux "Arcade" sur un seul écran avec beaucoup d'objets.

*   **Principe :** Utiliser la classe `Group` de P5Play pour gérer les collections d'entités.
*   **Avantage :** Gestion facile des interactions entre objets (collisions) via des méthodes intégrées (`group.collides(otherGroup)`).

```javascript
// Pattern Entity Manager (P5Play)
let enemies = new Group();
let bullets = new Group();

function update() {
    // P5Play gère le mouvement de tous les sprites dans les groupes.
    
    // Collision gérée en une ligne :
    bullets.collides(enemies, (bullet, enemy) => {
        bullet.remove();
        enemy.remove();
    });
}
```

## 3. Modularité (Classes)
Chaque entité doit avoir son fichier (ex: `Ball.js`, `Ship.js`).

**Règle d'Or :** Une entité est désormais un `Sprite` ou un `Group` de P5Play. Elle bénéficie des méthodes intégrées (`move`, `render`, `collides`).