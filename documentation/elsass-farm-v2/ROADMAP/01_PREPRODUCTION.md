# 01 — Pré-production

> Objectif : réduire les risques avant d'investir dans la production complète. Valider les partis pris les plus incertains avant de construire tout le reste dessus. Deux pivots à risque ont été identifiés, traités en deux parties de la même phase : **Partie 1** — déplacement au clic + zone d'action (codée) — et **Partie 2** — monde multi-zones + portails (à prototyper, ajout 10/07/2026). Le gate vers la phase 02 ne s'ouvre qu'une fois les deux parties validées par John.

## Partie 1 — Pivot d'interaction (déplacement au clic + zone d'action)

### Game Design

- Rédiger les **piliers de design** non négociables du jeu (3 à 5 règles simples, ex. : "100 % clic/tap", "jamais de fin définitive", "aucun défi non réparable", "thème alsacien assumé partout", "prix fixes, jamais de spéculation", "simple et fun avant tout — pas de mécanique annexe superflue"). Ces piliers servent de filtre pour toute décision future.
- Identifier dans le GDD les systèmes les plus risqués à valider en premier : ici, le déplacement au clic + zone d'action (c'est le vrai changement par rapport à la V1, tout le reste en découle).

### Programmation / Moteur

- **Moteur : p5.js seul** (décision John 10/07/2026 — pas de p5.play ni planck.js, comme le template `_template/v1` et Elsass Frost v2).
- Rappel de l'état réel du socle (vérifié 10/07/2026) : `engine/v1` ne contient que `LoadingManager` et `SaveManager`. Les modules InputManager/GridSystem/caméra de l'ancien city-builder sont partis dans `test-system/v1` (hors socle) et ne sont pas à reprendre.
- Les modules communs nécessaires sont donc **à créer de zéro**, pensés réutilisables pour les futurs jeux : déplacement au clic (trajet simple + contournement basique), zone d'action, caméra + boutons de zoom, horloge de jeu (échelle 1 min = 1 h, pause pendant mini-jeux/menus). Destination probable : `engine/v2` (évolution non cassante — voir `ARCHITECTURE_CIBLE.md` §4.2), à confirmer au gate.
- Construire un **prototype gray-box** : un personnage qui se déplace au clic sur une grille sans art final, avec la zone d'action visible en mode debug. Rien d'autre (pas de culture, pas de PNJ).
- Trancher formellement : extension de `engine/v1` (non cassante) ou nouvelle version `engine/v2` ?

### Contenu & Données

- Définir le format de données du contenu (JSON pour cultures / animaux / PNJ / recettes / météo) pour que l'ajout de contenu en Production (phases 03-04) soit rapide et ne demande pas de toucher au code à chaque fois.

### Art & Audio

- Définir une charte graphique minimale : taille de tuile, résolution de référence, palette de couleurs — style minimaliste lisible (décisions 10/07/2026, GDD §12 : lisibilité avant beauté, pas de rendu façon Game Boy).
- **Décision révisée (10/07/2026, John)** : abandon du "tout dessiné par le code". Assets = texture packs CC0 Kenney.nl, 14 packs retenus comme banque graphique (styles hétérogènes assumés — voir mémoire `game4-texture-packs-kenney`). Pack **Tiny Farm** retenu en premier pour elsass-farm v3. GDD §12 à corriger en conséquence (encore "formes géométriques + emoji").
- Tester dès le gray-box l'intégration du pack **Tiny Farm** : remplacer les formes géométriques provisoires par les tuiles/sprites du pack, vérifier l'échelle de tuile, la lisibilité et le rendu desktop/mobile.

### QA / Tests

- Écrire la checklist de test manuelle de base, réutilisée à chaque phase (voir `CHECKLISTS.md`).
- Tester l'intégration du pack Tiny Farm sur le gray-box (`elsass-farm/v3`) : rendu desktop **et** mobile, lisibilité à la taille de tuile choisie, cohérence avec la caméra/zoom du prototype.

### Intégration Plateforme

- Créer l'entrée du jeu en mode **masqué** sur `/admin` dès maintenant, pour pouvoir tester en conditions réelles dès le prototype gray-box.

### État (10/07/2026)

Codé (commit 4272e02) : `system/engine/v2/` (GameClock, Camera, GridSystem, Movement, ActionZone) + prototype gray-box `public/games/elsass-farm/v3/`. `PILIERS_DESIGN.md` et `FORMAT_DONNEES.md` livrés. Reste : test desktop + mobile par John et validation du gate, + test d'intégration du pack Tiny Farm (ajouté 10/07/2026).

## Partie 2 — Monde multi-zones & portails (ajout 10/07/2026)

> Risque identifié le 10/07/2026 : le monde n'est pas une carte unique mais plusieurs zones indépendantes (extérieur, intérieurs de bâtiments, paliers de mine) reliées par des portails placés à la main. C'est un second pivot structurant, au même titre que le déplacement au clic de la Partie 1 : à valider en gray-box avant de construire le contenu dessus. Conception détaillée : `MONDE_ET_PORTAILS.md`.

### Game Design

- Formaliser le principe de zone générique et les deux types de portail (simple / à choix) — fait, voir `MONDE_ET_PORTAILS.md`.
- Lister les tailles et rôles précis de chaque zone : reporté en phase de contenu (03-04), au cas par cas.

### Programmation / Moteur

- Étendre le prototype gray-box (`elsass-farm/v3`) pour couvrir les 4 cas de zones identifiés (décision John 10/07/2026) :
  1. **zone extérieure** reliée par un portail simple (ex. ferme → village) ;
  2. **bâtiment à un seul étage** (intérieur, portail simple sur la porte) ;
  3. **bâtiment à plusieurs étages** (intérieur, portails entre étages) ;
  4. **mine à plusieurs paliers**, reliés par un ascenseur (portail à choix, popup de sélection d'étage).
- Modèle de données du portail (JSON `from`/`to`/`choices`) : schéma proposé dans `MONDE_ET_PORTAILS.md` §4, à valider en le codant sur ces 4 cas.

### Contenu & Données

- Fichier de portails par zone, conforme aux conventions de `FORMAT_DONNEES.md` (kebab-case, ids uniques).

### QA / Tests

- Vérifier la transition sur desktop et mobile (tap sur portail → déplacement → transition ou popup de choix), avec sauvegarde de la zone courante.

### Intégration Plateforme

- Aucun changement attendu (reste dans le même jeu `/play/<id>`).

## Gate de sortie (obligatoire avant la phase 02)

**Partie 1**

- [ ] Le prototype gray-box (déplacement au clic + zone d'action) est jouable, testé sur desktop **et** mobile, et validé par John.
- [ ] Les piliers de design sont écrits et validés.
- [ ] Le format de données de contenu est défini.
- [x] La décision `engine/v1` étendu vs `engine/v2` est prise — `engine/v2`.
- [ ] L'intégration du pack Tiny Farm sur le gray-box est testée (desktop + mobile) et validée par John.

**Partie 2**

- [ ] Le prototype gray-box couvre les 4 cas — zone extérieure, bâtiment à un étage, bâtiment à plusieurs étages, mine à plusieurs paliers (ascenseur/portail à choix) — testé sur desktop et mobile, et validé par John.
- [ ] Le modèle de données du portail est écrit et validé (`MONDE_ET_PORTAILS.md` §4).
