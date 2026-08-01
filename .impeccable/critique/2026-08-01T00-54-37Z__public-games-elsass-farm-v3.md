---
target: public/games/elsass-farm/v3
total_score: 15
max_score: 40
na_heuristics: 
p0_count: 3
p1_count: 2
timestamp: 2026-08-01T00-54-37Z
slug: public-games-elsass-farm-v3
---
# Critique — Elsass Farm v3 (public/games/elsass-farm/v3)

Method: dual-agent (A: revue design en sous-agent · B: détecteur/navigateur en sous-agent)

## Design Health Score

| # | Heuristique | Score | Problème clé |
|---|---|---|---|
| 1 | Visibilité du statut système | 2 | Bon HUD, mais échecs silencieux (énergie insuffisante, achat sans or : aucun feedback) |
| 2 | Correspondance monde réel | 2 | Dollar dans une ferme alsacienne, bidon d'essence pour l'énergie, emojis mensongers (navet=olive, poireau=poivron) |
| 3 | Contrôle et liberté | 1 | Lit = nuit passée sans confirmation ; 2e clic PNJ = don automatique d'une récolte sans choix ni annulation |
| 4 | Cohérence et standards | 1 | Couleurs Vendre/Acheter inversées entre dialogue PNJ et boutique ; pièce d'or au HUD vs dollar en boutique |
| 5 | Prévention des erreurs | 1 | La boutique vend 21 graines mais seule la 1re culture de saison est plantable : achats-pièges silencieux |
| 6 | Reconnaissance vs rappel | 2 | Aucun écran d'inventaire ; aucun compteur de graines sur l'outil Graines |
| 7 | Flexibilité et efficience | 2 | Raccourcis V/A/ESC (desktop only), action contextuelle intelligente ; quantités +1/−1 seulement |
| 8 | Esthétique et minimalisme | 2 | Rendu de debug livré en prod (grille monde, chemins) ; 2 outils placeholder morts (hache, pioche) |
| 9 | Récupération d'erreurs | 2 | Défis « jamais permanents » (excellent) mais mitigations promises inexistantes ; évanouissement inexpliqué |
| 10 | Aide et documentation | 0 | Zéro tutoriel/onboarding ; icône d'aide dessinée en boutique SANS handler de clic |
| **Total** | | **15/40** | **Poor — refonte UX majeure requise avant le gate** |

## Verdict de spécificité design

**L'Alsace est dans les données, pas dans le design.** Contenu authentiquement signé (choux à choucroute, houblon, mirabelle, kougelhopf, colombages dessinés) mais interface assemblée d'assets recyclés d'autres jeux : jauge d'énergie = bidon de carburant (`battle_hud_carburant`), monnaie = dollar (`fish_hud_dollar`), boutons `rogrpg_*`, croix `shmup_*`. Masquez les textes : jeu de ferme interchangeable. Ni cigogne ni waggis — les mascottes maison — dans le jeu vitrine de la marque.

**Scan déterministe (Assessment B)** : 1 seul finding — `transition: width` sur la barre du loader (index.html:16), **faux positif** (overlay fixe éphémère, aucun reflow du jeu). Attendu : toute l'UI vit dans le canvas p5.js, hors de portée du détecteur HTML/CSS. Le détecteur et la revue humaine sont d'accord : le vrai sujet est dans le canvas.

**Overlay navigateur** : injection impossible — l'extension Chrome n'a pas répondu (timeout ×3, probablement une invite de permission en attente dans le side panel). Aucune capture d'écran ; toute la revue A cite des lignes de code vérifiées. Les serveurs temporaires (8130, 8400) ont été arrêtés.

## Impression générale

La philosophie produit est exactement la bonne (anti-frustration architecturée, fallbacks robustes, discipline tactile) mais l'exécution laisse trois trous bloquants dans la boucle cœur : un nouveau joueur démarre avec 0 pièce et 0 graine (softlock minute 1), 16 graines sur 21 sont inachetables (liste tronquée à 5 sans scroll), et les graines achetées ne déterminent pas ce qui pousse. La plus grande opportunité : faire parler le jeu — chaque échec est muet là où un enfant a besoin d'une phrase gentille.

## Ce qui marche

1. **Anti-frustration dans les données** : `reconciliation.neverPermanent`, retour à l'état labouré, replantation immédiate — la bonne philosophie pour le public familial ; il ne manque que de la dire au joueur.
2. **Chaîne de fallback des assets** (emoji puis forme/couleur) : le jeu ne casse jamais visuellement — rare à ce niveau de rigueur.
3. **Discipline tactile réelle** : `u()` avec boost mobile ~44 px, source unique dessin/clic pour la boutique (`_buildShopItemList`/`_shopLayout`).

## Problèmes prioritaires

1. **[P0] Softlock du premier lancement** — or initial = 0, inventaire vide, aucune graine de départ (`HarvestSystem.js:17`, aucun kit dans `boot()`). Planter exige une graine, acheter exige de l'or, l'or ne vient que de la récolte : un nouveau joueur ne peut rien faire. **Fix** : 5 graines de saison + ~50 pièces à la première partie. Commande : /impeccable onboard.
2. **[P0] 16 graines sur 21 inachetables** — `_shopLayout` plafonne à `maxVisible = 5` (sketch.js:1608), aucun scroll/pagination dans le dessin ni les clics. **Fix** : scroll ou pagination + filtre par saison courante. Commande : /impeccable harden.
3. **[P0] Les graines achetées ≠ ce qui pousse** — la plantation prend « la première culture de la saison » (`break`, sketch.js:2123-2124/2197-2198) en ignorant l'inventaire : seules 3 cultures réellement plantables, tout autre achat vole l'argent du joueur en silence. **Fix** : planter la graine possédée (sélecteur si plusieurs), refuser l'achat hors-saison avec message. Commande : /impeccable harden.
4. **[P1] Les trois échecs muets** — énergie insuffisante, achat sans or, évanouissement : aucun feedback (sketch.js:2115/2130/2141, 2353 ; SleepSystem réveil sans message). **Fix** : un composant toast unique réutilisant le bandeau météo : « 😴 Plus d'énergie — va te coucher ! », « Il te manque X pièces », « Tu t'es endormi de fatigue ! ». Commande : /impeccable clarify.
5. **[P1] Cadeau involontaire + couleurs inversées** — 2e clic PNJ = don auto de la 1re récolte (sketch.js:2248-2252) ; Vendre/Acheter vert-orange inversés entre dialogue (1501-1507) et boutique (1705-1716). **Fix** : bouton « 🎁 Offrir » explicite avec choix ; un seul couple de couleurs partout. Commande : /impeccable clarify + /impeccable polish.

## Charge cognitive

4 échecs sur 8 (charge élevée — correction critique) : >4 options par décision (toolbar 5 outils dont 2 morts, ~30 éléments à l'écran en boutique), pas de divulgation progressive (21 graines + 5 outils dès la minute 1), mémoire de travail (aucune UI ne montre les graines possédées ni la saison plantable), plusieurs décisions simultanées dans le dialogue PNJ (+ mécanique cachée du don au re-clic).

## Parcours émotionnel

- Pics : récolte (flash doré + or immédiat), dialogues chaleureux à paliers.
- Les 3 moments à enjeu échouent sans réassurance : évanouissement muet, énergie 0 = jeu qui semble cassé, bandeau gel/grêle alarmant sans la consolation « rien n'est jamais perdu » pourtant vraie dans les données.
- Pic-fin : aucun récap de fin de journée (« Aujourd'hui : 3 récoltes, +90 pièces ») — le meilleur moment de célébration du genre est vide.

## Red flags par persona

**Casey (mobile, une main, distraite)** : `touchHighlight` déclaré mais jamais assigné — tout le pré-feedback (survol, hachures interdites, curseur) est invisible en tactile, le canal principal du public cible ; croix de fermeture boutique hors zone du pouce (le tap extérieur ferme mais rien ne l'indique) ; boutons quantité 38 px < 44 pt, « − » adjacent à « VENDRE » (vente accidentelle). Positif : bonne résilience aux interruptions (save fin de trajet + beforeunload + cloud 5 min).

**Jordan (grand débutant)** : premier geste découvrable (tap → marche) mais premier objectif indevinable (labourer → échec silencieux → portail colonne 27 → village → acheter… avec 0 pièce) ; jargon « J 12 », dollar inexpliqué ; hache/pioche sélectionnables sans effet → « je fais mal quelque chose ».

**Léa, 8 ans (lectrice débutante)** : dialogues en une ligne sans boîte de largeur → ~100 caractères débordent du panneau sur mobile, illisible là où c'est le plus important (sketch.js:1485) ; registre incohérent (le maraîcher vouvoie puis tutoie) — choisir le tutoiement, standard des jeux enfants ; emojis mensongers = elle plantera « la mauvaise chose » ; punitions opaques et aucun feedback positif verbal (« Bravo ! ») nulle part.

## Observations mineures

- Récolter paie deux fois (or à la récolte + revente du même objet) : boutique VENDRE économiquement absurde.
- Pixelify Sans chargée mais le monde est en sans-serif système (`textFont` restauré après chaque panneau) : identité typo à moitié appliquée.
- Rendu debug en prod : `Engine.Grid.drawDebug` (sketch.js:856), `drawDebug`/`drawDebugPath` (940-941).
- `keyPressed` V/A sans garde pendant un dialogue-cadeau.
- Contour pointillé jaune de la zone cultivable = excellent affordance, à généraliser (portails, lit).
- Plancher tactile 38 px à relever à 44.
- Faute : « PANNAU CRÈME » (commentaire sketch.js:1639).

## Questions à considérer

1. Si on retirait tous les textes, qu'est-ce qui dirait « Alsace » à l'écran ? Où sont la cigogne et le waggis dans le jeu vitrine de la marque ?
2. Le seul système de feedback riche (`mouseMoved`) n'existe que pour la souris : une session complète au doigt sur un vrai téléphone a-t-elle déjà été testée ?
3. Le gate v0.3 peut-il être validé sans un test naïf filmé, alors qu'un joueur qui n'a pas lu le code ne peut pas dépasser la minute 3 ?
