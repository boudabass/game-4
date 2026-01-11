# Guide d'Architecture : Projet Elsass Frost (p5play)

Ce document définit les standards techniques pour le développement d'Elsass Frost, visant à optimiser les performances et la maintenabilité.

## 1. Architecture Logicielle (Multi-Fichiers)
Utilisation des **Modules ES6** pour séparer la logique, les données et le rendu.

### Structure des dossiers
- `/index.html` : Structure de base et conteneur Iframe.
- `/style.css` : Layout de l'UI (superposition DOM).
- `/main.js` : Point d'entrée p5.js (`setup`, `draw`).
- `/js/core/` : `engine.js` (Ticks), `state.js` (État global).
- `/js/entities/` : `building.js`, `citizen.js` (Classes héritant de Sprite).
- `/js/systems/` : `weather.js`, `economy.js`, `social.js`.
- `/js/utils/` : `storage.js` (Cloud sync), `grid.js` (Helpers grille).

## 2. Le "Tick Engine" (Optimisation)
La logique lourde est dégroupée du flux 60 FPS pour économiser les ressources.

| Fréquence | Action | Système |
| :--- | :--- | :--- |
| **1s** (60 fr) | Prod/Consommation | `economy.js` |
| **10s** (600 fr) | Propagation chaleur | `weather.js` |
| **20s** (1200 fr) | Faim, Maladie, Mort | `citizen.js` |
| **60s** (3600 fr) | Calcul Social / Save | `social.js` / `storage.js` |

## 3. Système de Grille "Tout Carré" (40x40)
Pour simplifier les calculs de collision et de pathfinding, le système radial est abandonné au profit d'une **grille cartésienne de 40x40 unités**.
- **Référence centrale** : Le Générateur est fixé en `(20, 20)`.
- **Calcul de Chaleur** : Basé sur la distance euclidienne simplifiée.

## 4. Gestion des Entités avec p5play
- **Bâtiments** : `collider = 'static'`. Cela retire les bâtiments des calculs de physique dynamique.
- **Groupes** : Utilisation de `Group()` pour les collisions et les mises à jour en masse.
- **Citoyens** : Rendu vectoriel léger (`rect`) et `collider = 'none'`.

## 5. Interface Utilisateur (UI) : Stratégie Hybride
- **Menus complexes** (Lois, Tech) : Implémentés en **HTML/CSS** pur, superposés en `position: absolute` par-dessus le canvas.
- **Communication** :
    - HTML -> p5play : Modification directe du `gameState`.
    - p5play -> HTML : Mise à jour des textes DOM via le Tick Engine.

## 6. Persistance des Données
1. **Init** : Fetch Cloud (Supabase/DB) -> LocalStorage.
2. **Jeu** : Lecture/Écriture dans un objet `state` en mémoire.
3. **Auto-save** : `state` -> LocalStorage (toutes les minutes).
4. **Sync** : LocalStorage -> Cloud périodiquement ou à la sortie.

## 7. Optimisations p5play
- **Culling** : `citizen.visible = false` si hors-écran.
- **Sleep Mode** : `world.allowSleep = true`.
- **No Physics** : Utiliser `moveTowards()` ou `lerp()` pour les agents au lieu de la physique Box2D.
