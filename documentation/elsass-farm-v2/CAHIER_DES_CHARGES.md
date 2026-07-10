# Cahier des charges — Elsass Farm V2

> Statut : document de cadrage — phase réflexion, aucun code.
> Complète `PRD.md` (vision) et prépare `GAME_DESIGN_DOCUMENT.md` (contenu concret).
> Chaque section liste les règles fonctionnelles attendues, pas l'implémentation.
> Mis à jour le 10/07/2026 : échelle de temps, météo, énergie, prix fixes, score, correction du socle (§9, §10, §12).

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
- **Un jour de pluie arrose automatiquement toutes les cases plantées** (règle Stardew reprise, validée 10/07/2026 — voir le système météo, §9).
- Chaque culture est associée à une saison (liste précise : `GAME_DESIGN_DOCUMENT.md` §2). Planter hors saison est impossible. Le changement de saison détruit les cultures non récoltées de l'ancienne saison (règle reprise de l'ancien `farming_cycle_concept.md`, toujours valable).
- Amélioration possible via outils supérieurs et structures d'irrigation automatique (arroseurs), déblocables par la progression de compétence Agriculture.
- Récolte ajoutée à l'inventaire ; vendable en boutique ou transformable via l'artisanat (§8).

## 3. Élevage

- Bâtiments dédiés (poulailler, étable, rucher) à construire/acheter.
- Animaux à acquérir, à nourrir quotidiennement, avec un niveau de bonheur/santé qui influence la qualité et la quantité de production.
- Produits animaux automatiques (œufs, lait, laine, miel) récoltables une fois par cycle (quotidien ou selon l'animal).
- Pas de reproduction complexe en V1 (achat direct de nouveaux animaux) — simplification volontaire.
- Risque de maladie du bétail traité comme un défi possible (§7), pas une mécanique de gestion permanente indépendante.

## 4. Pêche

- Zones de pêche dédiées (rivière, canal, étang), accessibles quand le personnage est face à l'eau avec la canne équipée.
- Mini-jeu de pêche simple (barre de tension / timing), séparé du reste du gameplay. Le temps de jeu est **en pause** pendant le mini-jeu (règle générale de pause, §9).
- Prises variables selon la zone, la saison et la météo du jour (§9 : la pluie améliore les prises).
- Poissons vendables ou utilisables dans les recettes d'artisanat (§8 — la "cuisine" est une forme d'artisanat, pas un système séparé).

## 5. Mine

- Zone d'exploration séparée (accès depuis un point du village), organisée en étages/paliers thématiques par ressource (détail : GDD §4).
- **Pas de combat.** Chaque étage propose une énigme/mini-jeu de réflexion à résoudre pour débloquer le loot de la zone (reprise directe du concept validé dans `documentation/ferme/mine.md`).
- **Le temps s'écoule dans la mine exactement comme partout ailleurs** (règle unique, §9) ; il n'est en pause que pendant une énigme (mini-jeu, comme la pêche).
- Un **point de repos** existe par palier, mais il est en ruine : il doit être **reconstruit/aménagé** (coût en ressources/argent) avant d'être utilisable. Une fois aménagé, il permet de dormir sur place — même effet que le lit de la ferme : passage au jour suivant + sauvegarde (§9) — sans forcer un retour à la ferme.
- Résoudre une énigme ne coûte pas d'énergie (c'est de la réflexion, voir la règle énergie §9) ; les actions physiques dans la mine (extraire le loot, dégager un passage) en coûtent.
- Les ressources minées alimentent l'artisanat (§8).

## 6. PNJ & relations

- Un roster de PNJ villageois, chacun avec un métier/rôle thématique alsacien (liste : GDD §5).
- Interaction de base : dialogue court, don de cadeau (effet positif sur la jauge de relation si le cadeau est apprécié).
- Jauge de relation par PNJ (paliers avec effets concrets : réduction de prix permanente, accès à des recettes, déclenchement de quêtes). Les réductions liées aux relations sont les **seules** modulations de prix autorisées du jeu (voir §10 : prix de base fixes).
- Les PNJ peuvent aussi déclencher des événements négatifs pour le joueur (§7) si leur relation est mauvaise ou selon des scénarios scriptés (rumeurs qui baissent la réputation).
- Pas de dialogues à choix multiples ramifiés en V1 (limitation reprise de l'ancien `quest_system.md`, toujours raisonnable pour un premier jet).

## 7. Défis & catastrophes (système différenciant vs Stardew Valley)

- Extension du concept d'`event_system.md` existant : en plus des événements saisonniers positifs, une catégorie d'événements **négatifs** peut survenir.
- Catégories de défis : météo (gel, grêle, sécheresse, inondation — tirés du système météo, §9), sinistres (incendie, invasion de nuisibles, maladie du bétail), actions PNJ hostiles (rumeurs qui baissent la réputation).
- Décision John 10/07/2026 : **aucun défi ne touche aux prix** (ni "concurrence commerciale", ni "manipulation du marché") — les prix sont fixes (§10). Les défis agissent sur les récoltes, les stocks, la production ou la réputation, jamais sur l'économie globale.
- Règle d'or : un défi **ralentit ou fait régresser temporairement** la progression (perte partielle de récolte, dégât réparable, baisse de réputation) mais ne provoque jamais un game over définitif — cohérent avec la partie sans fin (§9).
- Le joueur peut anticiper/atténuer certains défis via des choix actifs (abris, assurance récolte, diversification des cultures, bonne relation avec les PNJ concernés).
- Fréquence et sévérité à calibrer en phase de contenu (GDD §7) pour rester stimulant sans devenir punitif.

## 8. Artisanat / transformation

- Structures de transformation (cave, brasserie, four, atelier) qui convertissent des ressources brutes en produits à plus forte valeur (liste précise : GDD §6). La cuisine (plats, pâtisseries) est traitée comme de l'artisanat au même titre que le reste — pas de système séparé.
- Cycle de transformation asynchrone : le joueur dépose les ingrédients, la production se termine après un délai (souvent au cycle de sommeil suivant, comme dans l'ancien `farming_cycle_concept.md`).
- Débloque des recettes via la progression de compétence et/ou la relation avec certains PNJ.

## 9. Cycle temporel, météo, énergie, sommeil, partie sans fin

### Échelle de temps (décision John 10/07/2026)
- **1 minute réelle = 1 heure en jeu** → un jour complet = **24 minutes réelles**.
- Calendrier : 4 saisons × 28 jours = 112 jours par année de jeu (≈ 45 h de jeu réel par année), cycle indéfiniment répété.
- Le temps ne s'écoule **que lorsque le jeu est ouvert** — jamais hors connexion.
- Le temps s'écoule **partout de la même manière** (ferme, village, mine), quoi que fasse le joueur.
- **Exception unique — pause automatique** : pendant les mini-jeux (pêche, énigmes de mine), les dialogues et tout menu/modale ouvert, l'horloge est en pause (décision John 10/07/2026 — évite qu'un joueur lent perde sa journée dans une énigme).
- **Minuit sans dormir** : le personnage s'évanouit, se réveille au lit le lendemain avec un léger malus d'énergie (règle Stardew reprise, décision John 10/07/2026).

### Sommeil
- Le sommeil (lit de la ferme ou point de repos aménagé dans la mine, §5) fait avancer le temps au matin suivant, calcule la croissance des cultures, les productions animales et les transformations en cours, **déclenche la sauvegarde** et recalcule/soumet le score (voir ci-dessous).

### Météo (système à part entière — catalogue détaillé : GDD §10)
- Chaque jour a un état météo tiré aléatoirement selon la saison (soleil, pluie, orage, neige, gel…).
- La météo **affecte le gameplay** : la pluie arrose automatiquement les cultures (§2) et améliore les prises de pêche (§4) ; les défis météo (§7) sont des événements extrêmes tirés de ce même système.
- La météo du jour est visible dans le HUD (et idéalement une tendance pour le lendemain, à trancher en phase contenu).

### Énergie
- Une jauge d'énergie limite les actions ; sa gestion reste un frein stratégique (comme dans Stardew), pas un chronomètre de stress.
- **Les actions physiques coûtent de l'énergie** : labourer, arroser, récolter, nourrir, pêcher (le lancer), extraire dans la mine…
- **Les choix ne coûtent rien** : dialogues, menus, achats/ventes, réflexion et manipulation pendant une énigme (décision John 10/07/2026).
- L'énergie est restaurée par le sommeil (complètement si le joueur se couche avant minuit, partiellement après un évanouissement).

### Score (formule détaillée : GDD §11)
- La partie est sans fin, donc le score est **cumulatif et toujours croissant** : recalculé à chaque nuit et soumis via `GameSystem.Score.submit()` (la plateforme conserve le meilleur score, donc ici le plus récent).

### Partie sans fin
- Pas d'objectif de complétion globale : la boucle de jeu est infinie, portée par l'entretien de la ferme, la progression des compétences/relations et la gestion des défis récurrents.

## 10. Économie & marché asynchrone inter-joueurs

### Règles économiques (décision John 10/07/2026)
- **Une seule monnaie en jeu.** Les joueurs vendent et reçoivent de l'argent ; l'argent sert à acheter. Rien d'autre.
- **Tous les prix sont fixés à l'avance par le catalogue du jeu et ne changent jamais.** Aucun joueur ne peut influencer un prix, ce n'est pas de la bourse. Seule modulation autorisée : les réductions permanentes liées aux relations PNJ (§6), qui sont des récompenses de progression.

### Marché asynchrone
- Chaque joueur possède sa propre partie indépendante ; aucune partie n'est jamais jouée à plusieurs en simultané.
- Un espace commun (type "marché régional" ou "petites annonces du village") permet : mettre en vente un lot de ressources/produits (au prix fixe du catalogue), acheter un lot mis en vente par un autre joueur, publier une information courte visible par les autres joueurs (ex. alerte météo, bon plan).
- L'intérêt du marché n'est pas la spéculation (impossible, prix fixes) mais la **disponibilité** : acheter des produits qu'on ne produit pas soi-même ou qui sont hors saison.
- Les transactions sont asynchrones : le vendeur est crédité à sa prochaine connexion, pas en temps réel.
- Nécessite une donnée partagée entre comptes joueurs côté plateforme (voir note technique `PRD.md` §8) — hors scope de conception fonctionnelle plus poussée tant que le cadrage technique n'est pas fait avec John.

## 11. Interface (HUD, inventaire, modales)

- Reprise des règles UI validées dans `documentation/ferme/lessons_learned.md` et `ui_modals.md` pour tout ce qui reste en overlay DOM (inventaire, boutique, dialogues, menus) :
  - `display:none` strict pour masquer une interface (jamais `opacity:0`).
  - `event.stopPropagation()` systématique sur les éléments cliquables de l'UI.
  - Garde `UIManager.isAnyModalOpen()` dans la boucle d'input du monde de jeu.
  - Pas de drag & drop, interactions simples (clic/tap).
- Cible plutôt senior (PRD §3, décision 10/07/2026) : zones cliquables généreuses, textes grands et contrastés, aucune action sous pression temporelle (les pauses automatiques du §9 y contribuent).
- Différence avec l'ancien projet : le HUD doit désormais cohabiter avec un personnage animé à l'écran, mais l'interaction reste 100 % clic/tap (clic = déplacement ou action selon la portée, voir §0) — prévoir une barre d'objets/outils équipables et des boutons de zoom toujours visibles, en plus des stats vitales (énergie, argent, heure/saison, météo du jour).

## 12. Contraintes techniques de plateforme (rappel, non négociables)

- **Moteur : p5.js seul**, JavaScript ES6+, pas de TypeScript dans le dossier du jeu. Décision John 10/07/2026, alignée sur le template officiel (`_template/v1`) et Elsass Frost v2. Pas de p5.play ni planck.js (la mention "p5.play v3 + planck.js" de `GAME_WORKFLOW.md` est obsolète, à corriger).
- Le jeu doit se conformer au contrat `window.GameSystem` (`ARCHITECTURE_CIBLE.md` §3.2) : `Lifecycle.notifyReady()`, `Score.submit()`, `Save.read()/write()`. Aucun appel direct à `/api/...` depuis le code du jeu.
- **État réel du socle** (vérifié 10/07/2026) : `system/engine/v1/` ne contient que `LoadingManager.js` et `SaveManager.js`. Les modules InputManager/GridSystem/GameStateBase/caméra de l'ancien city-builder ont été sortis du socle (`test-system/v1`, hors catalogue) et ne sont pas à reprendre. Les modules communs nécessaires à ce jeu (déplacement au clic + zone d'action, caméra/zoom, grille, machine d'états) sont **à créer de zéro**, en les concevant réutilisables pour les futurs jeux → très probablement une évolution `engine/v2` du socle (voir `ARCHITECTURE_CIBLE.md` §4.2). La base commune reste un principe fondateur de la plateforme (décision John 10/07/2026).
- Le marché asynchrone est la seule brique qui dépasse le contrat actuel (donnée inter-utilisateurs) — à cadrer techniquement séparément avant développement.

## 13. Hors périmètre V1 (rappel explicite)

- Combat sous toute forme.
- Multijoueur temps réel ou partie partagée entre plusieurs joueurs.
- Fin de jeu / objectif de complétion globale.
- Personnalisation avancée du personnage.
- Dialogues à choix multiples ramifiés.
- Prix dynamiques / spéculation / manipulation de marché sous toute forme.
- Mécaniques annexes type FarmVille : décoration, collections/albums, cadeaux quotidiens, bonus de connexion (décision John 10/07/2026 — rester simple).
