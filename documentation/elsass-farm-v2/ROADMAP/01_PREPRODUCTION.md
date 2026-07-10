# 01 — Pré-production

> Objectif : réduire les risques avant d'investir dans la production complète. Valider les partis pris les plus incertains (surtout le pivot d'interaction) avant de construire tout le reste dessus.

## Game Design

- Rédiger les **piliers de design** non négociables du jeu (3 à 5 règles simples, ex. : "100 % clic/tap", "jamais de fin définitive", "aucun défi non réparable", "thème alsacien assumé partout", "prix fixes, jamais de spéculation", "simple et fun avant tout — pas de mécanique annexe superflue"). Ces piliers servent de filtre pour toute décision future.
- Identifier dans le GDD les systèmes les plus risqués à valider en premier : ici, le déplacement au clic + zone d'action (c'est le vrai changement par rapport à la V1, tout le reste en découle).

## Programmation / Moteur

- **Moteur : p5.js seul** (décision John 10/07/2026 — pas de p5.play ni planck.js, comme le template `_template/v1` et Elsass Frost v2).
- Rappel de l'état réel du socle (vérifié 10/07/2026) : `engine/v1` ne contient que `LoadingManager` et `SaveManager`. Les modules InputManager/GridSystem/caméra de l'ancien city-builder sont partis dans `test-system/v1` (hors socle) et ne sont pas à reprendre.
- Les modules communs nécessaires sont donc **à créer de zéro**, pensés réutilisables pour les futurs jeux : déplacement au clic (trajet simple + contournement basique), zone d'action, caméra + boutons de zoom, horloge de jeu (échelle 1 min = 1 h, pause pendant mini-jeux/menus). Destination probable : `engine/v2` (évolution non cassante — voir `ARCHITECTURE_CIBLE.md` §4.2), à confirmer au gate.
- Construire un **prototype gray-box** : un personnage qui se déplace au clic sur une grille sans art final, avec la zone d'action visible en mode debug. Rien d'autre (pas de culture, pas de PNJ).
- Trancher formellement : extension de `engine/v1` (non cassante) ou nouvelle version `engine/v2` ?

## Contenu & Données

- Définir le format de données du contenu (JSON pour cultures / animaux / PNJ / recettes / météo) pour que l'ajout de contenu en Production (phases 03-04) soit rapide et ne demande pas de toucher au code à chaque fois.

## Art & Audio

- Définir une charte graphique minimale : taille de tuile, résolution de référence, palette de couleurs — style minimaliste lisible (décisions 10/07/2026, GDD §12 : lisibilité avant beauté, pas de rendu façon Game Boy).
- Production des assets tranchée (10/07/2026) : **formes géométriques dessinées en code + emoji**, pas d'assets externes spéciaux. Dès le gray-box, vérifier le rendu des emoji sur Windows/Android/iOS et prévoir le fallback en forme géométrique.

## QA / Tests

- Écrire la checklist de test manuelle de base, réutilisée à chaque phase (voir `CHECKLISTS.md`).

## Intégration Plateforme

- Créer l'entrée du jeu en mode **masqué** sur `/admin` dès maintenant, pour pouvoir tester en conditions réelles dès le prototype gray-box.

## Gate de sortie (obligatoire avant la phase 02)

- [ ] Le prototype gray-box (déplacement au clic + zone d'action) est jouable, testé sur desktop **et** mobile, et validé par John.
- [ ] Les piliers de design sont écrits et validés.
- [ ] Le format de données de contenu est défini.
- [ ] La décision `engine/v1` étendu vs `engine/v2` est prise.
