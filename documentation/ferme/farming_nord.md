🌾 Farming System (Ferme Nord)
Le Farming System définit la logique complète de plantation, croissance, arrosage et récolte des cultures.
Il repose sur une grille **4x4 dédiée** (par zone Ferme_Nord/Sud) et interagit directement avec les outils du HUD et les **Plantes** de l'inventaire.

1. 🧭 Structure de Base (Mise à jour v1.3)
Élément	Rôle	Description
Grille Terrain	Support de culture	**4x4 tiles (16 cases)** pour réduire la charge DB et simplifier le gameplay.
Taille Visuelle	Rendu	Cases de **160x160px** (au lieu de 64px) pour occuper le même espace écran.
Tile	Unité de culture	Peut contenir une plante, de l’eau, ou une culture mature.
Cycle Journalier	Progression	Temps = 1 jour → Avancement croissance si arrosée.

2. 🌱 Cycle de Croissance & Logique Visuelle (Mise à jour v1.3)
Pour éviter la confusion "Est-ce que c'est prêt ?", la couleur du sol est désormais strictement liée à l'état du TERRAIN, pas de la plante.

| État | Visuel Sol (Fond) | Visuel Plante (Icône) | Signification |
| :--- | :--- | :--- | :--- |
| **EMPTY** | Marron Clair | *(Vide)* | Terre vierge. |
| **PLANTED** (J0) | **Marron Foncé** | 🌱 Petite (30%) | Planté, sec. **À arroser !** |
| **GROWING** (J1-9) | **Marron Foncé** | 🌿 Moyenne (40-90%) | En cours, sec. **À arroser !** |
| **WATERED** (N'importe quel stade) | **Marron + Teinte Bleue** | (Taille inchangée) | Terre mouillée. Poussera cette nuit. |
| **READY** (J10) | **VERT VIF** | 🥗 Max (100%) | **PRÊT ! Récolter.** |

**Règle d'Or :** Tant que le fond n'est pas VERT, la plante n'est pas prête. Tant que le fond n'est pas BLEUTÉ, elle ne poussera pas la nuit suivante.

3. 📏 Progression Dynamique (Taille)
Pour renforcer le sentiment de croissance sans multiplier les sprites :
*   La taille de l'icône est calculée dynamiquement selon le jour de croissance (`growthStage` 0 à 10).
*   **J0 (Graine)** : ~30px (Petite).
*   **J5 (Pousse)** : ~65px.
*   **J10 (Mature)** : ~100px (Remplit la case).
*   *Formule :* `Taille = map(stage, 0, 10, 30, 100)`

4. 💧 Arrosage et Gestion Énergie
Action	Outil	Coût Énergie	Effet sur Tile
Planter	Plante	4	Passer VIERGE → PLANTÉ (-1 au stock)
Arroser	Arrosoir	2	Marque la tile “arrosée” pour le jour
Récolter	Main	1	Récolte → Ajoute +2 au stock (Auto-suffisance)
Couper (erreur)	Hache	8	Supprime la culture (reset, perte sèche)
Miner (terre non cultivée)	Pioche	5	Dégage pierre/obstacle

5. ☀️ Gestion Saisons et Compatibilité
Chaque plante a sa saison active (Printemps, Été, Automne, Hiver).
Si le joueur tente de planter hors saison → message “Incompatible” + vibration courte.
À chaque changement de saison : Les cultures en cours hors saison meurent (tile reset).

6. 🔄 Synchronisation avec HUD et Inventaire (UNIFIÉ)
**Principe : Une Pomme de Terre est une Pomme de Terre.**
*   **Plantation :** Coût -1 Unité du stock.
*   **Récolte :** Gain **+2 Unités** dans le même stock.

7. ✅ Règles absolues Farming v1.3
✅ Grilles fixes : **4x4 (16 cases)**.
✅ **Code Couleur Strict** : Vert = Prêt, Marron = Pas prêt.
✅ **Taille Dynamique** : L'icône grandit chaque jour.
✅ **Unification totale** : L'item planté est l'item récolté.
✅ Arrosage obligatoire quotidien (sinon pas de croissance, pas de taille en +).
✅ Interaction uniquement par tap (0 drag).