# PRD — Elsass Farm V2 (simulation agricole façon Stardew Valley)

> Statut : document de cadrage — phase réflexion, aucun code.
> Date : 07/07/2026. Mis à jour : 10/07/2026 (décisions John : moteur p5.js seul, échelle de temps, prix fixes, météo, score, nom, cible, assets — voir §3, §8-§9 et GDD §10-§12).
> Autres documents liés : `CAHIER_DES_CHARGES.md`, `GAME_DESIGN_DOCUMENT.md`, `ROADMAP.md` (même dossier).

## 1. Contexte

The Elsassisch opère une arcade de jeux gratuits (p5.js, iframe Odoo, `arcade.theelsassisch.com`) pour ses clients. `elsass-farm` existait déjà comme prototype de test (voir `documentation/ferme/`) : une simulation de ferme façon FarmVille, sans avatar, en caméra omnisciente avec interactions "tap sur la grille". Ce prototype ne doit **pas être repris** — ni son code, ni son modèle d'interaction. John veut une refonte complète visant une expérience beaucoup plus proche de **Stardew Valley** : un personnage jouable qui se déplace dans un monde, avec une vraie boucle jour/saison/progression.

## 2. Objectif produit

- Offrir aux clients de The Elsassisch un jeu gratuit à forte rétention, contrairement aux jeux courts existants de l'arcade : ici on vise une **progression longue et un retour régulier** du joueur.
- Renforcer l'image de marque locale/alsacienne via un univers thématisé (§6).
- Servir de vitrine technique : premier "vrai" jeu de la plateforme testant le socle `engine/v1` sur une mécanique complexe (sauvegarde persistante, plusieurs systèmes de jeu imbriqués).

## 3. Public cible

Les clients de The Elsassisch connectés via le portail (compte Odoo). Décision John 10/07/2026 : **grand public, avec une dominante senior assumée**. Les jeunes joueurs ont déjà accès à de gros jeux bien plus riches — ce jeu s'adresse à un public qui n'a pas envie de se prendre la tête. Conséquences de conception : lisibilité avant tout (textes et zones cliquables généreux), rythme doux sans stress, menus simples. Desktop et mobile.

## 4. Pitch

Un village alsacien miniature où chaque client possède sa propre ferme. On y cultive des produits du terroir, on élève des animaux, on pêche dans les canaux, on explore une ancienne mine argentifère des Vosges, on tisse des relations avec les artisans du village — dans un monde vivant qui ne se termine jamais, mais qui peut aussi se retourner contre le joueur (intempéries, sinistres, PNJ retors). Chaque joueur a sa propre partie indépendante, mais tous partagent un marché commun où l'on peut vendre, acheter et s'échanger des informations.

## 5. Inspiration — Stardew Valley (synthèse de recherche)

Cinq systèmes forment le cœur de Stardew Valley et se renforcent mutuellement :

1. **Ferme en grille** avec cycle de culture (labourer → planter → arroser chaque jour → récolter), cultures liées à une saison, sur 4 saisons de 28 jours chacune.
2. **Horloge jour/nuit + calendrier saisonnier**, avec un coucher qui fait progresser le temps et déclenche la sauvegarde.
3. **Boucle outils / inventaire / énergie** : chaque action coûte de l'énergie ; l'argent gagné sert à acheter de meilleurs outils.
4. **Relations avec les PNJ** : cadeaux, dialogues, jauge d'amitié qui débloque du contenu et des effets concrets (prix, recettes).
5. **Économie récursive** : l'argent gagné en vendant permet d'agrandir la ferme et de produire plus vite, ce qui permet de gagner encore plus d'argent.

Progression par compétences (Farming, Fishing, Foraging, Mining, Combat dans l'original), avec des choix de spécialisation aux niveaux 5 et 10. Le jeu original propose aussi un objectif long terme fédérateur (le Centre Communautaire).

## 6. Ce qu'on garde, ce qu'on change, ce qu'on ajoute

### On garde de Stardew Valley
- La boucle quotidienne (jour de travail → coucher → nouveau jour).
- La grille de culture avec états visuels (labouré / planté / arrosé / prêt).
- Les saisons de 28 jours qui contraignent les cultures.
- Les relations PNJ avec jauge et effets concrets (prix, dialogues, quêtes).
- La progression par compétences et déblocages.

### On change par rapport à l'ancien elsass-farm (pivot majeur)
- **Modèle d'interaction** : le joueur incarne désormais un personnage visible qui se déplace à l'écran (la V1 n'avait pas d'avatar, seulement une caméra libre). Le contrôle reste 100 % clic/tap, dans la continuité de la V1 : un clic sur le monde déplace le personnage jusqu'au point cliqué, un clic sur une case à portée du personnage déclenche directement l'action de l'outil équipé. Aucun clavier ni manette, pour une expérience strictement identique sur smartphone, tablette et PC. Le zoom caméra passe par deux boutons dédiés (zoomer/dézoomer), pas par un geste pincer-zoomer.
- La ferme n'est plus un simple god-game de gestion : c'est un monde que l'on parcourt à pied.

### Concepts de l'ancien elsass-farm qu'on récupère (à ré-adapter au nouveau modèle d'interaction)
- La **mine sans combat**, remplacée par des mini-jeux de réflexion (`documentation/ferme/mine.md`) — cohérent avec la décision de ne pas inclure de combat.
- Le **système d'événements** (saisonniers, journaliers, PNJ, spéciaux, `documentation/ferme/event_system.md`) comme base du système de défis/catastrophes (§7 et GDD §7).
- Le **système de quêtes avec réputation PNJ** (`documentation/ferme/quest_system.md`).
- La **sauvegarde hybride** local + cloud, déjà fournie au niveau plateforme par `GameSystem.Save`.
- Les retours d'expérience UI (`documentation/ferme/lessons_learned.md`) pour tout ce qui reste en overlay DOM (inventaire, boutique, dialogues) : `display:none` strict, `stopPropagation`, pas de drag & drop.

### Ce qu'on ajoute (nouveau, spécifique à ce projet)
- **Thème alsacien assumé** : cultures, élevage, pêche et décor du terroir (détail dans `GAME_DESIGN_DOCUMENT.md`).
- **Système de défis/catastrophes** : le monde peut régresser (météo, sinistres, actions de PNJ hostiles), pas seulement progresser — différenciateur fort vis-à-vis de Stardew Valley classique.
- **Marché asynchrone inter-joueurs** : chaque joueur a sa propre partie indépendante, mais un espace d'échange commun (vente, achat, partage d'info) relie toutes les parties. Tous les prix sont fixés d'avance par le catalogue du jeu — aucune spéculation ni manipulation possible (décision John 10/07/2026).
- **Partie sans fin** : pas d'objectif de complétion façon "Centre Communautaire" — la partie continue indéfiniment.

## 7. Périmètre V1 (validé avec John)

**Inclus en V1**
- Système de culture (grille, saisons, cycle de croissance).
- Élevage (animaux, produits dérivés).
- Pêche.
- Mine (exploration + collecte, énigmes, **pas de combat**).
- Relations PNJ (a minima dialogues, cadeaux, réputation) — nécessaires pour porter le système de défis liés aux PNJ.
- Boutique / économie de base (prix fixes, une seule monnaie).
- Météo quotidienne qui affecte le gameplay (arrosage, pêche, défis) — voir CDC §9 et GDD §10.
- Thème visuel et culturel alsacien.
- Système de défis/catastrophes (météo, sinistres, actions PNJ négatives).
- Marché asynchrone inter-joueurs (échange, vente, partage d'info — jamais de partie jouée à plusieurs en simultané).
- Sauvegarde persistante, partie sans fin, score cumulatif (formule : GDD §11).

**Explicitement hors scope V1**
- Combat (aucun ennemi à combattre — la mine le remplace par des puzzles).
- Multijoueur temps réel / partie partagée.
- Fin de jeu ou objectif de complétion type "100%".
- Mécaniques annexes type FarmVille (décoration, collections, cadeaux quotidiens, bonus de connexion) — écartées le 10/07/2026 : le jeu doit rester simple, fun et réaliste à développer, pas un jeu AAA.

Détail système par système : voir `CAHIER_DES_CHARGES.md`. Contenu concret (listes de cultures, PNJ, recettes, catalogue d'événements) : voir `GAME_DESIGN_DOCUMENT.md`.

## 8. Contraintes

### Techniques (héritées de la plateforme)
- **Moteur : p5.js seul** (décision John 10/07/2026), comme le template officiel (`_template/v1`) et Elsass Frost v2. Pas de p5.play ni planck.js — aucun besoin de moteur physique pour ce jeu. ⚠️ `GAME_WORKFLOW.md` mentionne encore "p5.play v3 + planck.js" : cette mention est obsolète, à mettre à jour.
- Pas de TypeScript côté jeu (JavaScript ES6+).
- Le jeu doit passer exclusivement par `window.GameSystem` (jamais de `fetch` direct) : `Lifecycle.notifyReady()`, `Score.submit()`, `Save.read()/write()`.
- **État réel du socle** (vérifié 10/07/2026) : `engine/v1` ne fournit que `LoadingManager` et `SaveManager`. Les anciens modules (InputManager, GridSystem, GameStateBase, caméra) appartiennent au moteur city-builder sorti du socle (`test-system/v1`, décision 03/07/2026) et ne doivent pas être repris tels quels. Les modules communs nécessaires (déplacement au clic, zone d'action, caméra/zoom, machine d'états) sont **à créer de zéro** et à mutualiser dans le socle (probablement `engine/v2`) pour resservir aux futurs jeux — décision John 10/07/2026 : la base commune reste un principe fondateur de la plateforme.
- **Nouveau besoin technique identifié** : le marché asynchrone inter-joueurs suppose une donnée **partagée entre utilisateurs**, alors que la table `save` (jsonb) est aujourd'hui strictement scopée par joueur (`PK (game_id, user_id)`). Cela demandera une nouvelle table/API côté plateforme — hors scope de ce document de réflexion, à cadrer techniquement avant le développement.

### Business / marque
- Jeu 100 % gratuit, aucune monétisation prévue.
- Doit rester cohérent avec l'identité The Elsassisch (voir les skills `blog-elsassisch` et `elsassisch-publication-client` pour le ton de marque).

## 9. Risques & questions ouvertes

| Sujet | Risque | À trancher |
|---|---|---|
| Ampleur | Stardew Valley représente ~4 ans de développement pour une personne. Même réduit, le scope V1 (5 systèmes) reste conséquent. | Prioriser un ordre de construction — voir `ROADMAP.md`. |
| Marché asynchrone | Nécessite une brique technique nouvelle (table partagée, modération anti-abus du "mur du village"). | Cadrage technique dédié avant développement. |
| Système de défis | Doit rester motivant, pas décourageant : perdre sa progression peut lasser un joueur. | Principes d'équilibrage détaillés dans `GAME_DESIGN_DOCUMENT.md` §7. |
| Rendu des emoji | Les assets reposent en partie sur les emoji (GDD §12), dont le dessin varie selon l'OS/navigateur. | Vérifier le rendu sur les 3 form factors dès le prototype ; fallback forme géométrique si besoin. |

> Résolu le 10/07/2026 (décisions John) : nom = **Elsass Farm** (simple, reste dans le thème Alsace) ; cible = grand public à dominante senior ; assets = dessinés par le code + emoji (GDD §12).

## 10. Critères de succès

À affiner avec des données réelles une fois en production, mais pistes retenues :
- Taux de retour (joueurs actifs sur plusieurs jours/semaines).
- Temps de session moyen.
- Nombre de parties actives dans la durée (la persistance est un signal d'engagement direct).
- Volume d'échanges sur le marché asynchrone (signal d'appropriation sociale du jeu).
