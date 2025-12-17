Quest System — Missions, Événements & Suivi
Le Quest System régit les tâches et événements proposés au joueur à travers la Ville, la Taverne, et les saisons.
Il donne du rythme à la progression et structure la journée sans contraindre la liberté du joueur.

1. 🧱 Structure Générale
Élément	Rôle	Description
Quêtes journalières	Activités courtes (farming, loot)	Générées par la Taverne ou PNJ Ville
Quêtes saisonnières	Missions liées au calendrier (jour 28)	Débloquées automatiquement
Quêtes spéciales	Liées à une machine, mine ou événement	Déclenchées manuellement
Quête active	Mission suivie	Affichée sur HUD (icône + couleur priorité)
Chaque quête existe sous forme d’un objet unique, stocké en mémoire locale et synchronisé par jour.

2. 🧾 Types de Quêtes
Type	Exemple	Origine	Récompense
🌱 Ressources	“Apporte 10 Baies fraîches à Marcel”	Taverne / Magasin	💰 +25 – 100 ou Potion
⚙️ Production	“Fabrique 4 Briques à l’Établi”	Atelier / Machine Sud	Loot rare
🌾 Récolte	“Récolte 20 cultures avant la prochaine pluie”	PNJ Ville	💰 +150
⛏️ Exploration	“Atteins le 5ᵉ étage de la mine”	PNJ spécial montagne	Potion + Avancement stats
🎉 Saisonnière	“Participe à la Foire agricole (Jour 28)”	Mairie	Multiplicateur or saison
Les quêtes quotidiennes expirent à la fin de la journée, sauf pour les saisonnières qui durent toute la période active.

3. 🎯 Structure d’une Quête
text
┌─────────────────────────────┐
│ Nom : Livraison de Baies    │
│ Type : Ressource (Taverne)  │
│ Objectif : 10× Baie         │
│ État : [EN COURS]           │
│ Progression : 4 / 10        │
│ Récompense : +50💰 +Potion  │
│ Expiration : Fin du jour    │
│ Bouton : [Abandonner]       │
└─────────────────────────────┘
États possibles :
EN COURS → suivie activement

ACCOMPLIE → récompense disponible

EXPIRÉE → supprimée du journal

ABANDONNÉE → supprimée immédiatement

4. 🔄 Acquisition et Suivi
Action	Origine	Résultat
Tap PNJ / Taverne (“Aide demandée”)	Génère une quête disponible	Affiche fenêtre “Accepter / Refuser”
Accepter	Ajoute au Journal des quêtes	Icône HUD allumée
Réaliser objectif	MAJ automatique progression	Notification sonore
Retourner au PNJ	Validation et récompense	Quête marquée “ACCOMPLIE”
Expiration (jour suivant)	Suppression auto	Message : “La quête a expiré.”
Limite active : 3 quêtes simultanées (priorisées par type et importance).

5. 🕓 Liens avec le Temps (City Time System)
Le système de quêtes est directement dépendant de l’horloge interne.

Certaines quêtes n’existent que :

De jour (Ville, Magasin, Mairie).

De nuit (Taverne, Mines).

Les quêtes liées à la saison se déclenchent automatiquement à jour 28.

Les icônes du HUD affichent chaque quête selon priorité :

Priorité	Couleur	Condition
🔴 Haute	Temps restant < 4 h ou objectif critique	
🟠 Moyenne	Active et suivie	
🟢 Basse	Accomplie / attente validation	
⚪ Neutre	Observation / info	
Tap sur une icône ouvre le Menu Quêtes (journal + suivi + abandon).

6. 🗂️ Journal des Quêtes (interface)
text
┌─────────── JOURNAL ───────────┐
│ [ Quêtes actives x3 ]        │
│──────────────────────────────│
│ 🌱 Baies pour Marcel [4/10]  │
│ ⛏️ Niveau 5 Mine [2/5]       │
│ 🎉 Foire agricole [Jour 28]   │
│──────────────────────────────│
│ [📜 Détails] [➕ Suivre] [❌ Abandonner] |
└──────────────────────────────┘
Détails : nom, type, récompense, expiration.

Suivre : active icône HUD + flèche directionnelle (ville/minimap).

Abandonner : supprime la quête instantanément.

Les quêtes saisonnières ne peuvent pas être abandonnées.

7. 💰 Récompenses et Effets
Type	Effet	Valeur
💰 Pièces	Ajoute or à HUD	+25 – 300 selon difficulté
🍷 Potion (Énergie / Santé)	Ajout inventaire [🧺 LOOT 🧪]	1–3 unités
⚙️ Outils	Remplacement auto (upgrade direct)	Lv+1 si machine dispo
💡 Statistique	Increment “Village Progression” (Mairie)	+1 par saison
Certaines récompenses déclenchent aussi un son contextuel et un halo sur le HUD (flash vert court).

8. 🎭 Catégories de PNJ Quêteurs
PNJ	Type de quête	Disponibilité horaire	Récompense dominante
🍺 Romain (Taverne)	Jour/nuit → Ressource & livraison	20h–6h	💰 / Potion
👨‍🌾 Marcel (Magasin)	Jour → Récolte / Vente	8h–18h	💰
🪓 Élodie (Atelier)	Jour → Production outils	8h–18h	Outils
🏛️ Lenoir (Mairie)	Saison → Progrès global	6h–20h	Statistiques
🧑‍🌾 PNJ mine	Nuit/jour → Exploration	Permanente	Potion / Loot métal
9. 🔔 Notifications et Feedback
Événement	Visuel	Son
Quête acceptée	Bandeau “Nouvelle mission”	“pling doux”
Objectif accompli	Halo vert HUD	“coin métal clair”
Quête expirée	HUD rouge	“bip grave”
Récompense reçue	+💰 animation compteur	“success bell short”
Durée moyenne : 0.5 s.
Non bloquant (aucun rechargement interface).

10. ✅ Règles absolues — Quest System v1.0
✅ Maximum 3 quêtes actives simultanées.

✅ Logique horaire respectée (jour/nuit/saison).

✅ Interface centralisée “Journal des quêtes” + HUD icons colorées.

✅ Récompense immédiate et automatique.

✅ Expiration automatique à minuit ou changement jour.

✅ PNJ fixes déclencheurs (Ville seule).

✅ Sauvegarde du statut quête via TimeSystem.

❌ Pas de chaînes narratives ni choix multiples (v1.0).

❌ Pas de succès cumulatif.

❌ Pas de transport automatique vers PNJ.