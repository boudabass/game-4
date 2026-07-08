# Cahier des charges — Elsass Farm V2

> Statut : document de cadrage — phase réflexion, aucun code.
> Complète `PRD.md` (vision) et prépare `GAME_DESIGN_DOCUMENT.md` (contenu concret).
> Chaque section liste les règles fonctionnelles attendues, pas l'implémentation.

## 0. Principe directeur d'interaction

Contrainte transverse validée par John : **aucun clavier, aucune manette, aucun geste complexe.** Le jeu doit être jouable de façon strictement identique sur smartphone, tablette et PC, avec un **clic/tap simple** comme unique moyen d'action — dans la continuité directe de la V1 (`documentation/ferme/`), qui posait déjà ces bases (tap-only, pas de drag & drop, feedback immédiat — voir `lessons_learned.md` et `hub_permanent.md`). La V2 ajoute un personnage visible et déplaçable, ce que la V1 n'avait pas (caméra libre sans avatar), mais garde exactement le même principe d'input.

- Un clic/tap sur une zone du monde **hors de portée** du personnage : le personnage s'y déplace (trajet simple, contournement basique des obstacles).
- Un clic/tap sur une case **à portée** du personnage (zone d'action autour de lui) : déclenche directement l'action de l'outil/objet équipé sur cette case — pas de déplacement, pas de direction à viser.
- Sélection de l'outil/objet actif : clic/tap sur un slot de la barre d'objets du HUD, jamais de raccourci clavier.
- Zoom avant/arrière de la caméra : deux boutons dédiés à l'écran (zoomer / dézoomer), pas de geste pincer-zoomer (incohérent entre souris et tactile).

## 1. Personnage joueur & déplacement

- Déplacement exclusivement par clic/tap : le joueur clique/tape un point du monde, le personnage s'y déplace automatiquement (pas de contrôle directionnel continu, pas de clavier).
- Trajet simple avec contournement basique des collisions (bâtiments, eau, rochers) ; pas de pathfinding complexe attendu en V1.
- Une **zone d'action** (rayon fixe autour du personnage) détermine si un clic sur une case déclenche une action immédiate (outil utilisé sur place, case à portée) ou un déplacement (case hors de portée).
- Aucune direction à "viser" : le rayon d'action suffit. L'orientation du sprite du personnage vers la case ciblée est purement cosmétique.
- Barre d'objets/outils équipables toujours visible (HUD bas), sélection par clic/tap uniquement.
- Boutons de zoom caméra dédiés (zoomer/dézoomer), affichés en permanence à l'écran.
- Personnalisation visuelle du personnage : hors scope V1 (à statuer plus tard).

## 2. Ferme & cultures

- Grille de parcelles cultivables, invisible tant que la case n'est pas labourée.
- Cycle par case : `vide → labourée → plantée → (arrosée quotidiennement) → poussée par étapes → prête → récoltée`.
- Une case plantée qui n'est pas arrosée ne meurt pas mais ne pousse pas ce jour-là (règle Stardew reprise telle quelle).
- Chaque culture est associée à une saison (liste précise : `GAME_DESIGN_DOCUMENT.md` §2). Planter hors saison est impossible. Le changement de saison détruit les cultures non récoltées de l'ancienne saison (règle reprise de l'ancien `farming_cycle_concept.md`, toujours valable).
- Amélioration possible via outils supérieurs et structures d'irrigation automatique (arroseurs), déblocables par la progression de compétence Agriculture.
- Récolte ajoutée à l'inventaire ; vendable en boutique ou transformable via l'artisanat (§7).

## 3. Élevage

- Bâtiments dédiés (poulailler, étable, rucher) à construire/acheter.
- Animaux à acquérir, à nourrir quotidiennement, avec un niveau de bonheur/santé qui influence la qualité et la quantité de production.
- Produits animaux automatiques (œufs, lait, laine, miel) récoltables une fois par cycle (quotidien ou selon l'animal).
- Pas de reproduction complexe en V1 (achat direct de nouveaux animaux) — simplification volontaire.
- Risque de maladie du bétail traité comme un défi possible (§7), pas une mécanique de gestion permanente indépendante.

## 4. Pêche

- Zones de pêche dédiées (rivière, canal, étang), accessibles quand le personnage est face à l'eau avec la canne équipée.
- Mini-jeu de pêche simple (barre de tension / timing), séparé du reste du gameplay, pas de temps réel écoulé pendant le mini-jeu.
- Prises variables selon la zone, la saison et la météo du jour.
- Poissons vendables ou utilisables en artisanat/cuisine.

## 5. Mine

- Zone d'exploration séparée (accès depuis un point du village), organisée en étages/paliers thématiques par ressource (détail : GDD §4).
- **Pas de combat.** Chaque étage propose une énigme/mini-jeu de réflexion à résoudre pour débloquer le loot de la zone (reprise directe du concept validé dans `documentation/ferme/mine.md`).
- Progression indépendante du jour/nuit extérieur ; un point de repos par palier permet de sauvegarder la progression dans la mine sans forcer un retour à la ferme.
- Les ressources minées alimentent l'artisanat (§7).

## 6. PNJ & relations

- Un roster de PNJ villageois, chacun avec un métier/rôle thématique alsacien (liste : GDD §5).
- Interaction de base : dialogue court, don de cadeau (effet positif sur la jauge de relation si le cadeau est apprécié).
- Jauge de relation par PNJ (paliers avec effets concrets : réduction de prix, accès à des recettes, déclenchement de quêtes).
- Les PNJ peuvent aussi déclencher des événements négatifs pour le joueur (§7) si leur relation est mauvaise ou selon des scénarios scriptés (concurrence commerciale, rumeurs).
- Pas de dialogues à choix multiples ramifiés en V1 (limitation reprise de l'ancien `quest_system.md`, toujours raisonnable pour un premier jet).

## 7. Défis & catastrophes (système différenciant vs Stardew Valley)

- Extension du concept d'`event_system.md` existant : en plus des événements saisonniers positifs, une catégorie d'événements **négatifs** peut survenir.
- Catégories de défis : météo (gel, grêle, sécheresse, inondation), sinistres (incendie, invasion de nuisibles, maladie du bétail), actions PNJ hostiles (concurrence commerciale, rumeurs qui baissent la réputation, manipulation du marché asynchrone).
- Règle d'or : un défi **ralentit ou fait régresser temporairement** la progression (perte partielle de récolte, baisse d'un prix, dégât réparable) mais ne provoque jamais un game over définitif — cohérent avec la partie sans fin (§9).
- Le joueur peut anticiper/atténuer certains défis via des choix actifs (abris, assurance récolte, diversification des cultures, bonne relation avec les PNJ concernés).
- Fréquence et sévérité à calibrer en phase de contenu (GDD §7) pour rester stimulant sans devenir punitif.

## 8. Artisanat / transformation

- Structures de transformation (cave, brasserie, four, atelier) qui convertissent des ressources brutes en produits à plus forte valeur (liste précise : GDD §6).
- Cycle de transformation asynchrone : le joueur dépose les ingrédients, la production se termine après un délai (souvent au cycle de sommeil suivant, comme dans l'ancien `farming_cycle_concept.md`).
- Débloque des recettes via la progression de compétence et/ou la relation avec certains PNJ.

## 9. Cycle temporel, énergie, sommeil, partie sans fin

- Horloge en jeu avec calendrier de 4 saisons de 28 jours, cycle indéfiniment répété (pas de fin de partie).
- Le sommeil fait avancer le temps au jour suivant, calcule la croissance des cultures et déclenche la sauvegarde.
- Une jauge d'énergie limite les actions ; sa gestion reste un frein stratégique (comme dans Stardew), pas un chronomètre de stress.
- Pas d'objectif de complétion globale : la boucle de jeu est infinie, portée par l'entretien de la ferme, la progression des compétences/relations et la gestion des défis récurrents.

## 10. Marché asynchrone inter-joueurs

- Chaque joueur possède sa propre partie indépendante ; aucune partie n'est jamais jouée à plusieurs en simultané.
- Un espace commun (type "marché régional" ou "petites annonces du village") permet : mettre en vente un lot de ressources/produits, acheter un lot mis en vente par un autre joueur, publier une information courte visible par les autres joueurs (ex. alerte météo, bon plan).
- Les transactions sont asynchrones : le vendeur est crédité à sa prochaine connexion, pas en temps réel.
- Nécessite une donnée partagée entre comptes joueurs côté plateforme (voir note technique `PRD.md` §8) — hors scope de conception fonctionnelle plus poussée tant que le cadrage technique n'est pas fait avec John.

## 11. Interface (HUD, inventaire, modales)

- Reprise des règles UI validées dans `documentation/ferme/lessons_learned.md` et `ui_modals.md` pour tout ce qui reste en overlay DOM (inventaire, boutique, dialogues, menus) :
  - `display:none` strict pour masquer une interface (jamais `opacity:0`).
  - `event.stopPropagation()` systématique sur les éléments cliquables de l'UI.
  - Garde `UIManager.isAnyModalOpen()` dans la boucle d'input du monde de jeu.
  - Pas de drag & drop, interactions simples (clic/tap).
- Différence avec l'ancien projet : le HUD doit désormais cohabiter avec un personnage animé à l'écran, mais l'interaction reste 100 % clic/tap (clic = déplacement ou action selon la portée, voir §0) — prévoir une barre d'objets/outils équipables et des boutons de zoom toujours visibles, en plus des stats vitales (énergie, argent, heure/saison).

## 12. Contraintes techniques de plateforme (rappel, non négociables)

- Stack imposée : p5.js + p5.play v3 + planck.js, JavaScript ES6+, pas de TypeScript dans le dossier du jeu (`GAME_WORKFLOW.md`).
- Le jeu doit se conformer au contrat `window.GameSystem` (`ARCHITECTURE_CIBLE.md` §3.2) : `Lifecycle.notifyReady()`, `Score.submit()`, `Save.read()/write()`. Aucun appel direct à `/api/...` depuis le code du jeu.
- Réutilisation du socle `system/engine/v1/` (LoadingManager, SaveManager, InputManager, GridSystem, GameStateBase, camera) comme fondation, en l'étoffant si besoin (nouvelle version `v2` du socle si des évolutions cassantes sont nécessaires).
- Le marché asynchrone est la seule brique qui dépasse le contrat actuel (donnée inter-utilisateurs) — à cadrer techniquement séparément avant développement.

## 13. Hors périmètre V1 (rappel explicite)

- Combat sous toute forme.
- Multijoueur temps réel ou partie partagée entre plusieurs joueurs.
- Fin de jeu / objectif de complétion globale.
- Personnalisation avancée du personnage.
- Dialogues à choix multiples ramifiés.
