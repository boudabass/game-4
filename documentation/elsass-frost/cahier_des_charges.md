# ❄️ Cahier des Charges Technique : Elsass Frost (v1.1)

## 1. Stack Technique & Performance
- **Moteur** : p5.js + p5play v3.
- **Logique** : JavaScript ES6 Modules (Architecture multi-fichiers).
- **UI** : Overlay HTML/CSS (Z-index supérieur au canvas) pour les menus (Lois, Tech, HUD).
- **Optimisation Sprites** :
    - **Bâtiments** : `collider = 'static'` (Désactive la physique lourde).
    - **Citoyens** : `collider = 'none'` (Déplacement par `lerp` ou `moveTowards`).
    - **Culling** : Désactivation des sprites hors-caméra (`sprite.visible = false`).

## 2. Architecture Logicielle (Modulaire)
Le projet est divisé en modules isolés :
- `/core/` :
    - `GameState.js` : Objet unique (ressources, lois, stats globales).
    - `Engine.js` : Tick Manager (boucles 1s, 10s, 60s).
    - `SaveManager.js` : Pont LocalStorage / Cloud API (`elsass-frost-v1`).
- `/systems/` :
    - `GridSystem.js` : Grille 40x40, calcul de distance au générateur.
    - `WeatherSystem.js` : Cycle de température et consommation de charbon.
    - `EconomySystem.js` : Chaîne de transformation (Cru -> Ration) et collecte.
    - `SocialSystem.js` : Gestionnaire Espoir / Mécontentement / Promesses.
- `/entities/` :
    - `Building.js` : Classe héritant de Sprite (Isolation, Staff, Chaleur).
    - `Citizen.js` : Classe héritant de Sprite (Santé, faim, travail).

## 3. Système de "Tick" (Planification CPU)
Segmentation de la logique pour garantir la fluidité :
- **Tick 1s (60 frames)** : Mise à jour des compteurs de ressources (Charbon, Bois).
- **Tick 10s** : Recalcul de la chaleur globale et des risques de maladie.
- **Tick 60s** : Calcul des jauges sociales (Espoir) et auto-save locale.

## 4. Spécifications de la Grille (Logic & Render)
- **Format** : Grille orthogonale de 40x40 cases.
- **Centre (20,20)** : Emplacement fixe du Générateur (Entité immuable).
- **Système de Chaleur** : `Chaleur = Temp_Météo + Max(Chaleur_Gen, Chaleur_Hub) + Isolation`.
- **Visuel** : Heatmap via teinte de couleur sur les sprites.
- **Connexion** : Bâtiment actif uniquement si adjacent à une route reliée au Générateur.

## 5. Boucles de Gameplay (Frostpunk Core)
- **5.1 Économie de Flux** :
    - Nourriture : Chasseurs (RawFood) -> Cantine (Rations).
    - Noyaux de Vapeur : Ressources finies, remboursées à 100% au démantèlement.
- **5.2 Social & Lois** :
    - Espoir/Mécontentement : [0.0 - 1.0].
    - Ultimatum : Si `Espoir == 0`, timer 48h avant Game Over.
    - Lois : Cooldown global (18h-24h).

## 6. Persistance & Game Center
- **ID** : `elsass-frost-v1`.
- **Flux** : Cloud API <-> LocalStorage <-> GameState.
- **Scoring** : `(Pop_Vivante * 10) + (Nb_Techs * 5) + (Espoir * 100)`.

## 7. Assets & Audio
- **Images** : Format WebP, spritesheets pour les citoyens.
- **Audio** : Loop "Vent" filtré (température), SFX "Tampon" pour les lois.
