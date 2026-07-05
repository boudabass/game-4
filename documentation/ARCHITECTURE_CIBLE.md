# 🎯 Architecture cible de la fondation

> **But** : rendre la base *solide* avant de développer les vrais jeux.
> Ce document décrit la fondation visée, pourquoi, et un plan de migration **incrémental et non-cassant**.
> Statut : socle engine/v1 + template en place (03/07/2026) ; reste la refonte
> des jeux un par un. NB 05/07/2026 : le backend de données est passé d'Odoo à
> PostgreSQL (voir `MIGRATION_POSTGRES.md`) — les mentions Odoo ci-dessous
> valent pour l'époque ; l'ID numérique injecté via `?gid=` est désormais
> l'ID de la table `game`.
> Date : 2 juillet 2026.

---

## 1. Principes directeurs

1. **Un seul socle partagé, versionné.** Le code commun aux jeux (boot, save, input, HUD…) vit à **un seul endroit**, chargé par tous les jeux. Fini le copier-coller par jeu.
2. **Contrat d'intégration explicite et testable.** Un jeu sait exactement comment se déclarer, envoyer un score, sauvegarder — et ça marche de façon identique partout.
3. **`system/` = plateforme, pas un jeu.** Le dossier `system/` ne contient que ce qui est universel. Le moteur d'un jeu précis (city-builder) sort de là.
4. **Non-cassant.** On introduit la nouvelle base à côté de l'existant, on migre jeu par jeu. À aucun moment le site ne casse.
5. **Simplicité d'abord.** Les jeux ne sont pas encore fonctionnels : c'est le bon moment pour poser des fondations minimales et claires, pas une usine.

---

## 2. Le problème aujourd'hui (rappel)

| Constat | Conséquence |
|---|---|
| Seul `system/system.js` est mutualisé | Chaque jeu réimplémente `GameState`, `SaveManager`, `LoadingManager`, `InputManager`, `GridSystem`, `UIManager`… |
| Ces copies divergent d'un jeu à l'autre | Un correctif doit être refait N fois ; comportements incohérents |
| `system/core/` + `system/config/` = moteur city-builder (~70 fichiers) chargé par le seul `test-system` | Le « système » n'est pas universel ; il pollue la fondation |
| Les jeux se déclarent avec un **slug** (`DyadGame.id = 'similitude-v1'`) alors que le backend attend l'**ID numérique Odoo** (`parseInt`) | **Score & sauvegarde cassés** depuis l'intérieur des jeux (`parseInt('similitude-v1') = NaN`) |
| `cerebro` ne charge pas `system.js` | Aucune intégration plateforme possible |
| `middleware.ts` passe-tout | Pas de protection des routes ni de redirection login |

---

## 3. Le contrat d'intégration jeu ↔ plateforme (cible)

C'est la pièce maîtresse. Un jeu n'a besoin de connaître **que ça**.

### 3.1 Identité du jeu — via l'URL, injectée par la plateforme
Problème actuel : l'ID est codé en dur (et faux) dans chaque `index.html`.

**Cible** : la plateforme injecte l'ID numérique Odoo dans l'URL de l'iframe. Le jeu n'a **rien à coder en dur**.

- Côté plateforme (`play/[gameId]/page.tsx` → `GamePlayer`) : construire l'URL de l'iframe en ajoutant l'ID :
  `.../games/similitude/v1/index.html?gid=7` (où `7` = `x_game_release.id`).
- Côté socle (`system.js`) : lire l'ID dans l'ordre `?gid=` → puis `window.DyadGame.id` (repli). Exposer `GameSystem.config.id` (numérique).

Bénéfices : plus de slug cassé, `cerebro` fonctionne sans config, et déplacer un jeu dans Odoo ne demande aucune modif de code.

### 3.2 API `window.GameSystem` (stable, la seule surface publique)

```javascript
GameSystem.config            // { id, version } — id numérique Odoo
GameSystem.Lifecycle.notifyReady()          // masque le loader, signale « prêt »
GameSystem.Score.submit(score)              // POST /api/scores
GameSystem.Score.getLeaderboard()           // GET  /api/scores?gameId=
GameSystem.Save.write(data)                 // POST /api/storage
GameSystem.Save.read()                      // GET  /api/storage?gameId=
GameSystem.Display.toggleFullscreen()
```

Règle : **un jeu ne fait jamais de `fetch('/api/...')` en direct** — il passe toujours par `GameSystem`. (Aujourd'hui les `SaveManager` locaux appellent `/api/storage` eux-mêmes : à centraliser.)

### 3.3 Cycle de vie standard d'un jeu

```
1. Chargement des scripts (p5, p5play, system.js, socle, jeu)
2. GameSystem lit l'ID (?gid) et s'initialise
3. p5 setup() : le jeu s'initialise
4. GameSystem.Save.read() : charge la sauvegarde (ou new game)
5. GameSystem.Lifecycle.notifyReady() : retire le loader
6. p5 draw() : boucle de jeu (switch/case d'états)
7. À la fin / périodiquement : GameSystem.Save.write() et Score.submit()
```

---

## 4. Le socle p5.js partagé (`system/engine/`)

Aujourd'hui dupliqué dans chaque jeu → demain **un seul exemplaire versionné**, chargé par tous.

### 4.1 Contenu du socle (candidats à mutualiser)
Modules communs, dans leur version **générique** (sans logique spécifique à un jeu) :

- **`LoadingManager`** — écran de chargement + barre de progression (déjà quasi identique partout).
- **`SaveManager`** — save hybride **localStorage + cloud Odoo** (via `GameSystem.Save`), avec l'algo « le plus récent gagne » (comparaison `savedAt` local vs `write_date` cloud). Aujourd'hui réécrit dans chaque jeu.
- **`InputManager`** — clavier + tactile (patterns déjà décrits dans `patterns/05_inputs.md`).
- **`GridSystem`** — grille générique (beaucoup de jeux en ont une).
- **`GameStateBase`** — squelette d'état + machine `switch/case` (MENU / GAME / GAMEOVER), conforme à `TROUBLESHOOTING.md` (ne pas utiliser `states` de p5.play).
- **`Camera` helper** — suivi manuel `lerp` (déjà « solution validée » dans `TROUBLESHOOTING.md`).

> Chaque jeu garde sa **logique propre** (sa `sketch.js`, ses entités). Le socle fournit la **plomberie**, pas le gameplay.

### 4.2 Versionnement du socle
Le socle est **versionné** pour ne jamais casser un jeu existant en le faisant évoluer :

```
public/games/system/
├── system.js              # pont plateforme (stable, non versionné : surface minimale)
└── engine/
    └── v1/
        ├── LoadingManager.js
        ├── SaveManager.js
        ├── InputManager.js
        ├── GridSystem.js
        ├── GameStateBase.js
        └── camera.js
```

Un jeu choisit sa version de socle : `<script src="../../system/engine/v1/SaveManager.js">`. On peut publier `engine/v2` sans toucher aux jeux sur `v1`.

### 4.3 Convention technique
On **garde le pattern actuel** (`window.XxxManager`, scripts classiques chargés dans `index.html`) — pas de bundler, pas d'ES modules, pour rester simple et coller à l'existant. Décision réévaluable plus tard (voir §8).

---

## 5. Réorganisation de `system/` : sortir le moteur city-builder

Le gros `system/core/` + `system/config/` + `system/assets/` (bâtiments, intérieurs, citoyens, tech…) n'est **pas** de la plateforme : c'est le moteur d'un jeu de gestion.

**Cible** : le déplacer dans son propre jeu, ex. `public/games/citybuilder/v1/`, et ne laisser dans `system/` que `system.js` + `engine/`.

- `test-system` (le seul consommateur) devient une version de ce jeu ou est archivé.
- `system/` redevient **léger et universel**.

> À faire prudemment : vérifier les chemins relatifs (`../../system/core/...`) au moment du déplacement.

---

## 6. Structure cible d'un jeu + template

```
public/games/<jeu>/<version>/
├── index.html      # charge : p5 + p5play (CDN) → system.js → engine/v1/* → fichiers du jeu
├── config.js       # constantes du jeu (tuning, couleurs)
├── sketch.js       # setup() / draw() + machine d'états
├── entities/       # classes du jeu (player.js, …) — spécifique au jeu
└── assets/         # images/sons du jeu
```

Un **template de démarrage** (`public/games/_template/v1/`) servira de point de départ propre pour tout nouveau jeu : un jeu minimal fonctionnel (menu → play → game over → score envoyé → save), déjà câblé au socle et au contrat. C'est le meilleur test que la fondation est solide.

---

## 7. Fixes côté plateforme (Next.js)

Indépendants du socle jeu, à traiter en parallèle :

1. **Protection des routes (`middleware.ts`)** : rediriger vers `/login` les pages privées (`/dashboard`, `/games`, `/play`, `/scores`, `/profile`) si `arcade_session` absent. Aujourd'hui : passe-tout.
2. **Expiration de session** : centraliser dans `src/lib/odoo.ts` la détection « session expirée » d'Odoo → purger les cookies → rediriger `/login`. (Règle déjà écrite dans `AI_RULES.md`, à implémenter.)
3. **Lien score ↔ utilisateur** : à la création d'un `x_game_score` / `x_game_save`, renseigner `x_studio_user` (aujourd'hui non fourni ; le classement affiche mal l'auteur).
4. **Résolution native du jeu** : passer `width`/`height` du jeu (métadonnée Odoo) à `GamePlayer` au lieu du 800×600 par défaut.
5. **Cohérence de marque** : titre (`layout.tsx` = « Game Center Seniors ») vs `ARCADE.OS` vs `GameCenter`. Choisir un nom.

---

## 8. Décisions ouvertes (à trancher avec John)

| Sujet | Options | Reco |
|---|---|---|
| Convention du socle | (a) scripts `window.*` classiques / (b) ES modules + bundler | **(a)** pour rester simple maintenant |
| Sort du moteur city-builder | (a) le sortir en `games/citybuilder/` / (b) le supprimer si abandonné / (c) le laisser | Dépend : comptes-tu faire ce jeu ? |
| Save : hybride local+cloud | garder / simplifier en cloud-only | Garder l'hybride (déjà conçu, robuste) |
| Périmètre du socle v1 | minimal (Loading+Save+Input) / complet (avec Grid, Camera, State) | Commencer **minimal**, étoffer au besoin |

---

## 9. Plan de migration incrémental (proposé)

Chaque étape est autonome, testable, et ne casse rien.

1. **Corriger le contrat d'ID** (rapide, gros impact) : injection `?gid=` côté plateforme + lecture dans `system.js`. → score/save re-fonctionnels.
2. **Créer `system/engine/v1/`** avec la première brique mutualisée : `SaveManager` générique branché sur `GameSystem.Save`. + `LoadingManager`.
3. **Créer le template `_template/v1/`** : jeu minimal câblé au socle. Sert de preuve + de base pour les futurs jeux.
4. **Migrer un jeu pilote** (le plus simple, ex. `similitude`) vers le socle : supprimer ses copies locales, pointer sur `engine/v1`.
5. **Sortir le moteur city-builder** de `system/` → `games/citybuilder/`.
6. **Fixes plateforme** : middleware, expiration de session, `x_studio_user`.
7. Migrer les autres jeux au fur et à mesure (ou les archiver si ce sont de purs tests).

---

## 10. Ce qu'on obtient

- Un **socle unique** : un correctif profite à tous les jeux.
- Un **contrat clair** : créer un jeu = partir du template, coder son gameplay, c'est tout.
- Un **`system/` propre** : plateforme d'un côté, jeux de l'autre.
- Une plateforme **fiabilisée** : routes protégées, session gérée, scores bien attribués.

Sur cette base saine, on pourra enfin faire un premier **vrai** jeu fonctionnel de bout en bout.
