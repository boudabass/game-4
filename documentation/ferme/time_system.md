— Gestion du Temps, Fatigue & Saisons (v1.1)
Le City Time System régule le cycle du monde : temps, lumières, saisons, sommeil et disponibilité des zones.
Cette version introduit un système naturel de fatigue, une liberté de sommeil, et une vraie logique d’activité par lieu.

1. 🧩 Structure Horaire Globale
Élément	Valeur
1 minute réelle	= 1 heure en jeu
1 journée complète	≈ 16 minutes réelles
Heure minimale	6h00
Heure maximale (avant fatigue auto)	variable selon énergie
Phase "sommeil libre"	en tout lieu doté d’un lit
2. 🧭 Cycle Jour/Nuit Étendu
Période	Tranche horaire	Activités disponibles
🌅 Matin (6h–8h)	Réveil, farm, maintenance	Fermes, machines
🌞 Jour (8h–18h)	Activité principale	Magasins, mairie, ateliers
🌆 Soir (18h–20h)	Transition lumière, déplacements	Fermes sud, préparation nuit
🌙 Nuit (20h–6h)	Activités nocturnes	Taverne, mines, quêtes spéciales
3. 💤 Système de Sommeil & Fatigue
Le sommeil n’est plus forcé automatiquement : il fait partie d’un équilibre naturel
entre énergie, activité, et temps écoulé.

Conditions de repos	Lieu	Effet	Avancement horaire
Lit Maison	Sauvegarde complète + énergie 100	+8 heures	
Lit Taverne	Sauvegarde partielle + énergie +50	+8 heures	
Lit Mine (par étage)	Sauvegarde + fatigue réduite	+8 heures	
Lit Ferme Nord/Sud	Sauvegarde locale (auto)	+8 heures	
Règle universelle : chaque utilisation d’un lit ajoute +8 heures à l’horloge du jeu.

Exemple : dormir à 18h → réveil à 2h du matin.

⚠️ Fatigue naturelle
Si le joueur reste éveillé trop longtemps :

Énergie tombe à zéro → écran noir progressif (2 s).

Téléportation automatique au lit de la maison.

Sommeil forcé double durée (16 heures).

Sauvegarde auto complète à la fin du sommeil.

Message : “Tu t’es effondré d’épuisement.”

Ce système simule une sanction douce — perte de temps de jeu, pas de ressources.

4. 🏡 Logique d’Activité par Zone
Zone	Cycle	Description	Sauvegarde
🏚️ Maison Joueur	Jour & Nuit	Activité libre + lit principal	Auto-save total
🌾 Ferme Nord/Sud	Jour	Farming / Machines / 1 lit par ferme	Auto-save local
🏙️ Ville & Magasins	Jour	Ouverts 6h–20h, fermés nuit	Aucune save
🍺 Taverne	Nuit seulement	Activités nocturnes, quêtes, buff énergie	Save partielle
⛏️ Mines	Jour & Nuit	Exploration libre + 1 lit par étage	Save locale
🏛️ Mairie	Jour	Gestion saison & statistiques	Non actif nuit
Les zones sans activité nocturne affichent un décor sombre et sont inaccessibles (portes verrouillées).

5. 🕰️ Fatigue & Énergie — Synchronisation
Action	Consommation Énergie	Récupération possible
Farming (plant/harvest/arrose)	1–8 pts	Sommeil ou potion
Combat (Mines)	2–6 pts	Sommeil ou potion
Craft (Machines Sud)	3 pts	Potion seulement
Dialogue / Quête	Aucun	N/A
Repos lit taverne	+50 énergie	coût 15 💰
Repos lit maison	+100 énergie	gratuit
Zéro énergie → sommeil forcé comme décrit au §3.

6. 🌦️ Avancement du Temps (Sommeil et Activités)
Chaque fois qu’un joueur dort, 8 heures s’écoulent.
Ainsi, il peut faire plusieurs cycles jour/nuit dans la même session.
Cela permet de jouer en continu sans rupture forcée.

Effets secondaires possibles :

Croissance cultures → avance de 1 jour.

Machines Sud → progressent selon leur timer.

Magasins → réinitialisation de stock à chaque matin.

PNJ → routines rétablies.

7. 🧭 HUD — Visualisation du Temps et des Quêtes
Le HUD supérieur intègre désormais les indicateurs d’événements et quêtes chrono-sensibles.

Couleur	Priorité	Type
🔴	Haute	Événement saisonnier imminent (jour 28)
🟠	Moyenne	Quête en cours liée à l’heure ou la nuit
🟢	Basse	PNJ disponible ou échange simple
⚪	Info	Dialogue ou rappel inactif
Petites icônes circulaires affichées à droite de la timeline Frostpunk,
clic = ouvre menu Quêtes & Événements (lecture / abandon / suivi).

8. 🪐 Interaction avec les Systèmes Connectés
Système	Effet du temps et fatigue
HUD	Temps, icônes quêtes & saisons mises à jour dynamiquement
Farming / Machines	Calcul automatique après +8 h ou fin journée
Ville / PNJ	Disponibilité change avec heure
Taverne / Quêtes	Déclencheurs nocturnes
Save System	Sauvegarde sur chaque “lit” utilisé
Mine	Indépendante du jour/nuit, sauvegarde par étage
9. ✅ Règles absolues — City Time System v1.1
✅ Pas de forçage sommeil manuel (liberté totale).

✅ Fatigue = sommeil automatique au seuil 0 énergie.

✅ +8 heures à chaque sommeil (maison, taverne, ferme, mine).

✅ 1 lit par ferme et par étage de mine.

✅ Taverne = activité nocturne, maison = jour/nuit, autres = jour.

✅ HUD affiche quêtes/événements liés au temps.

✅ Sauvegarde automatique sur tout sommeil (partielle ou complète).

❌ Pas de gestion météo (prévue v2.0).

❌ Pas d’aléatoire sur la fatigue (valeur purement mécanique).