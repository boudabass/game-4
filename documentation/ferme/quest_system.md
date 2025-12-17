🧭 Quest System v1.1 — Avancées et Dynamique Sociale
Le Quest System v1.1 étend la base stable v1.0 en ajoutant :

des sous-types de quêtes fonctionnelles (livraison, craft, exploration, événement),

un système léger de réputation par PNJ,

et une gestion du temps et de l’énergie dans la progression des quêtes.

1. 🧱 Niveaux de Quêtes
Les quêtes sont désormais classées par catégorie et complexité.
Chaque type module la difficulté, la durée et la récompense.

Type	Sous-type	Exemple	Durée / Condition	Effet énergie
🌱 Ressource	Livraison	“Apporter 10 Baies à Marcel”	Jour unique / stock existant	Faible (transport)
⚙️ Production	Craft	“Fabriquer 4 Planche à l’Établi”	1–2 jours / via Machines	Moyen
⛏️ Exploration	Objectif spatial	“Atteindre le N5 de la Mine”	Jour + nuit	Fort
💬 Sociale	Dialogue / PNJ	“Parler à Élodie avant 18 h”	Temps précis	Aucune
🎉 Saisonnière	Événement	“Participer au Marché artisanal”	Jour 28 uniquement	Variable
Chaque sous-type utilise la même structure d’interface, mais présente des icônes locales (graine, marteau, lampion…).

2. 🧭 Réputation PNJ (v1.1 légère)
Le joueur développe une relation chiffrée par PNJ à chaque quête terminée.
C’est purement fonctionnel (impact boutique et dialogue, sans narration).

PNJ	Base de relation	Effet palier
👨‍🌾 Marcel	+1 par quête jardin/farming	-5 % prix graines
🪓 Élodie	+1 par quête outil/craft	Accès anticipé plans Lv3
🍺 Romain	+1 par quête livraison nocturne	+20 énergie bonus taverne
🏛️ Lenoir	+1 par quête saisonnière	Réduction coût passage saison
🧑‍🌾 Mineur	+1 par exploration réussie	+5 % loot métal
Échelle : 0–20 → seuils à 5 / 10 / 15 / 20.
Traitée uniquement à travers la fonction de validation de quête, sans gestion émotionnelle ni choix de dialogue.

3. ⏳ Synchronisation Temps / Énergie
La complétion d’une quête déclenche un coût énergétique indirect (représentation de la fatigue).

Classe	Coût énergie	Fenêtre horaire	Expiration
Ressource / Sociale	-5	8h–20h	Fin de jour
Craft / Production	-10	6h–18h	Jour + 1
Exploration	-25	18h–6h	Fin de nuit
Saisonnière	-15	Jour 28 uniquement	Fin événement
Si le joueur se présente sans énergie suffisante, la quête reste “EN ATTENTE” jusqu’à repos ou potion.

Aucun échec direct : le joueur choisit entre dormir, boire une potion ou abandonner.

4. ⚙️ Avancement Progressif
Certaines quêtes franchissent désormais plusieurs étapes internes (1→3).
Chaque étape se valide automatiquement au passage de condition.

Exemple	Étape 1	Étape 2	Étape 3	Récompense
“Collecter 12 Bois pour Élodie”	Couper 3 arbres	Donner 6 bois	Retour Atelier	+75💰
“Explorer la Mine 5e étage”	Niv 1	Niv 3	Niv 5	+Potion + Stat +1
“Foire agricole”	Préparer	Participer	Retour mairie	+Or ×1.1
Chaque étape change la couleur de l’icône HUD (progression visuelle continue).

5. 📜 Conditions de Déclenchement
Une quête peut être activée par :

Source	Condition
PNJ	Tap direct + dialogue
Événement horaire	Début ou fin de période (20h taverne, 6h matin)
Machine active	Fin production spéciale
Saison	Jour 28 auto‑script
Quête précédente	Lien logique 1→2 (v1.1 simple)
Les quêtes “enchaînées” se limitent à des successeurs directs, ex :

“Apporte le métal → Fabrique l’outil → Livre à Élodie”.

Aucun arbre narratif complexe n’est encore introduit (v2.0 envisagé).

6. 🎨 HUD & Journal Améliorés
HUD
Flèche directionnelle optionnelle vers le lieu du PNJ ou machine.

Icône colorée selon priorité + petit chrono horaire sous l’icône.

Clic = accès direct au journal filtré sur la quête concernée.

Journal
Ajout de filtre par type et état :

text
Filtres : [🌱 Ressources] [⚙️ Craft] [⛏️ Exploration] [🎉 Saison] [🕓 Expirées]
Chaque entrée affiche maintenant le temps restant et une barre de progression.

7. 🏅 Récompenses Avancées
Récompenses ajustées en fonction du type / réputation PNJ / saison.

Facteur	Bonus	Exemple
Réputation > 10	+10 % or	fidélité persistante
Accomplie avant délai –50 % temps	+1 Potion	rapidité
Jour 28 (saisonnière)	Multiplie par 1.2	équilibre saison
Quête nocturne terminée avant 4h	+20 énergie gratuite	adaptation fatigue
Les bonus se cumulent automatiquement lors de la validation.

8. 🔔 Feedbacks Améliorés
Événement	Animation	Son
Étape validée	Rayon jaune depuis icône HUD	“pling court”
Quête finalisée	Halo vert croissant + compteur or animé	“coin roll long”
Réputation +1	Icône PNJ scintille brèvement sur mini‑map	“success pop low”
Échec ou abandon	Décoloration icône	“bip sec”
Tous les feedbacks sont non bloquants et visuellement légers (max 0.6 s).

9. 🔒 Sauvegarde & Persistance
Chaque quête conserve dans la sauvegarde :

ID + état (en cours/terminée/expirée)

Progression (% ou étape)

Horodatage jour/saison

PNJ associé & relation

La synchronisation s’effectue :

lors d’un changement de jour (sleep),

ou d’une validation (PNJ dialogue).
Aucune donnée perte entre cycles.

10. ✅ Règles absolues — Quest System v1.1
✅ 5 types + 5 PNJ rattachés.

✅ Réputation locale 0–20 avec effets cumulables.

✅ Quêtes dépendantes du temps et de l’énergie.

✅ Étapes internes progressives avec retours HUD.

✅ Bonus récompense dynamique selon performance.

✅ Sauvegarde complète (time + état + PNJ).

❌ Pas de dialogues à choix multiples (prévu v2.0).

❌ Pas de quêtes simultanées inter‑PNJ (v2.0).

❌ Pas d’interface multi‑joueur ou online.