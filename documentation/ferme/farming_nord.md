🌾 Farming System (Ferme Nord)
Le Farming System définit la logique complète de plantation, croissance, arrosage et récolte des cultures.
Il repose sur une grille 10x10 dédiée (par zone Ferme_Nord/Sud) et interagit directement avec les outils du HUD et les **Plantes** de l'inventaire.

1. 🧭 Structure de Base
Élément	Rôle	Description
Grille Terrain	Support de culture	10x10 tiles interactives (100 cases).
Tile	Unité de culture	Peut contenir une plante, de l’eau, ou une culture mature.
Player Action	Interaction directe	Tap terrain selon outil ou plante sélectionnée.
Cycle Journalier	Progression	Temps = 1 jour → Avancement croissance si arrosée.

2. 🌱 Cycle de Croissance
Chaque tile suit 5 états successifs :

Étape	État	Condition suivante
1️⃣	TERRE_VIDE	Tap avec Plante valide → PLANTÉ
2️⃣	PLANTÉ (J0)	+1 jour si arrosé → POUSSANT
3️⃣	POUSSANT (J1–3)	+1 jour si arrosé → PRÊT
4️⃣	PRÊT (J4)	Tap sans outil → RÉCOLTÉ
5️⃣	RÉCOLTÉ	Reset tile → TERRE_VIDE
Si non arrosé : croissance retardée d’un jour (aucune régression).
Toutes les actions consomment de l’énergie selon les règles du HUD.

3. 💧 Arrosage et Gestion Énergie
Action	Outil	Coût Énergie	Effet sur Tile
Planter	Plante	4	Passer VIERGE → PLANTÉ (-1 au stock)
Arroser	Arrosoir	2	Marque la tile “arrosée” pour le jour
Récolter	Main	1	Récolte → Ajoute +2 au stock (Auto-suffisance)
Couper (erreur)	Hache	8	Supprime la culture (reset, perte sèche)
Miner (terre non cultivée)	Pioche	5	Dégage pierre/obstacle

4. ☀️ Gestion Saisons et Compatibilité
Chaque plante a sa saison active (Printemps, Été, Automne, Hiver).

Si le joueur tente de planter hors saison → message “Incompatible” + vibration courte.

À chaque changement de saison :
Les cultures en cours hors saison meurent (tile reset).
Les cultures compatibles continuent leur cycle normalement.

5. 🎨 Feedback Visuel & Sonore
Action	Effet visuel	Effet sonore
Plantation	Poussière + icône 🌱 qui pop	“Plop” doux
Arrosage	Tile bleutée translucide	Goutte légère
Croissance	Animation subtile du sprite	Aucun
Récolte	Particules + gain visuel HUD (+2)	“Pop métal doux”
Mort saison	Fanage instantané	Vent sec court

6. 🔄 Synchronisation avec HUD et Inventaire (UNIFIÉ)
**Principe : Une Pomme de Terre est une Pomme de Terre.**
Il n'y a plus de distinction entre "Graine" et "Récolte".

*   **Plantation :** Le joueur sélectionne "Pomme de terre" dans l'onglet **PLANTES**.
    *   Coût : -1 Unité du stock.
*   **Récolte :** Le joueur récolte une plante mature.
    *   Gain : **+2 Unités** dans le même stock "Pomme de terre".
    *   *Logique :* 1 pour rembourser la plantation, 1 de profit.

7. ✅ Règles absolues Farming v1.2
✅ Grilles fixes : 10x10 par zone.
✅ **Unification totale** : L'item planté est l'item récolté.
✅ **Rendement x2** : Planter 1 coûte 1, Récolter rapporte 2.
✅ Arrosage obligatoire quotidien.
✅ Feedback visuel + sonore constant.
✅ Interaction uniquement par tap (0 drag).
✅ Énergie comme limite d’action quotidienne.
❌ Pas de sachet de graines distinct.
❌ Pas de fertilisant (v1.0).

8. 🧩 Gestion interne des Tiles (Terrain Logique)
Chaque tile est une entité autonome avec son propre état.

Attribut	Type	Description
id	Numérique (1–100)	Identifiant unique sur la grille.
state	Enum	TERRE_VIDE / PLANTÉ / POUSSANT / PRÊT / RÉCOLTÉ
watered	Booléen	Indique si la tile a été arrosée ce jour.
plantId	String	ID de l'item (ex: 'potato') provenant de l'inventaire unifié.
growthDay	Numérique	Nombre de jours écoulés depuis plantation.
compatibleSeason	Enum	Saison autorisée.

9. 🌅 Cycle Journalier Global
Identique v1.0.

10. ⚡ Intégration Énergie et Actions
Identique v1.0.

11. ⏳ Transitions visuelles entre États
Identique v1.0.

12. 🌦️ Compatibilité Saisons
Identique v1.0.

13. 🧮 Interaction Simplifiée
Lorsqu’une culture est récoltée :
Le jeu cherche le slot correspondant dans l'onglet **[🌱 PLANTES]**.
Ajoute **+2** à la quantité.

Lorsqu'on plante :
Retire **-1** du même slot.

Si quantité = 0 :
Slot grisé + message "Plus de stock". Le joueur doit aller en acheter au magasin ou en récolter d'autres.

14. 🔒 Règles absolues – Farming v1.2
✅ 1 tile = 1 culture unique.
✅ Arrosage obligatoire.
✅ Stock Unifié (Inventory Simplification).
✅ **Gain net de +1 par cycle** (Coût 1, Gain 2).