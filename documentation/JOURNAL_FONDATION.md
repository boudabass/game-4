# 📓 Journal de fondation & leçons apprises

> Bilan de la session de refonte de la fondation (juillet 2026).
> À lire avant tout nouveau développement sur l'arcade. Complète `ARCHITECTURE.md`
> (le « comment ça marche ») avec le « pourquoi », « ce qui marche / ne marche pas »
> et les pièges à éviter.

---

## 1. Contexte & objectif

Le projet avait subi beaucoup de mutations (Supabase → Odoo, lowdb abandonné, intégration iframe). Aucun jeu n'était réellement fonctionnel. Objectif de la session : **rendre la fondation solide et prouvée de bout en bout** avant de développer de vrais jeux. Résultat : ✅ atteint — scores et sauvegardes fonctionnent en production dans l'iframe, cloisonnés par client, à coût maîtrisé.

---

## 2. Topologie des domaines (IMPORTANT)

- **Site Odoo** : `monsite.com` (héberge aussi le site web + le portail client).
- **Coolify** : `monserveur.fr`.
- **App arcade** : `arcade.monserveur.fr`.
- **Intégration** : le site Odoo (`monsite.com/arcade`) embarque l'app en **iframe**.

Conséquence majeure : l'app (`.fr`) et le site parent (`.com`) sont sur des **domaines différents** → dans l'iframe, les cookies de l'app sont des **cookies tiers** (cross-site). C'est la source de la plupart des soucis de session. Voir §6.

---

## 3. Ce qui MARCHE (validé en prod)

- **Catalogue** : lecture de `x_game_release` (accès public en lecture) → la liste des jeux s'affiche.
- **Connexion** : login via compte **portail** Odoo (`/web/session/authenticate`) → cookie `arcade_session` (session Odoo).
- **Lancement d'un jeu** : `/play/[id]` embarque `x_studio_url` en iframe, avec l'ID Odoo injecté via `?gid=`.
- **Contrat d'intégration** : `system.js` lit `?gid=` (source de vérité) et normalise `window.DyadGame.id` (ID numérique Odoo). Répare les jeux hérités qui utilisaient un slug.
- **Socle partagé** `public/games/system/engine/v1/` : `Engine.Loader` (écran de chargement) + `Engine.Save` (save hybride local + cloud).
- **Template** `public/games/_template/v1/` (release Odoo id 5, testable sur `/play/5`) : menu → partie → game over → score + save. Sert de base à tout nouveau jeu.
- **Scores** : 1 ligne unique par (jeu, joueur), mise à jour avec le **meilleur** score (upsert).
- **Sauvegardes** : 1 ligne unique par (jeu, joueur), cloisonnée (chaque client ne voit que la sienne).
- **Chaîne d'écriture** : le jeu (iframe) → `GameSystem` → `/api/scores` & `/api/storage` (même origine, cookie transmis) → Odoo via la **session du client** (droits portail).

---

## 4. Ce qui NE marche PAS / limites connues

- **Safari (et navigateurs qui bloquent tout cookie tiers)** : la session en iframe ne tient pas. Le correctif `Partitioned` (CHIPS) couvre Chrome/Edge/Firefox mais **pas Safari**. → Correctif durable = passer l'app sur un **sous-domaine de monsite.com** (voir §7, TODO).
- **Pas de SSO** : le client doit se connecter à l'arcade même s'il est déjà connecté au site Odoo parent. Dépend du passage en sous-domaine.
- **Jeux existants non migrés** : `similitude`, `elsass-farm`, `elsass-frost`, `cerebro`, `test-personnage` dupliquent chacun leur propre `core/`/`systems/` (GameState, SaveManager…). Ils ne sont PAS encore branchés sur `engine/v1`. Ce sont des tests.
- **`cerebro`** : la release Odoo (id 4) pointe vers `/games/cerebro/v2/` alors que le code n'a que `cerebro/v1` → URL cassée.
- **Moteur city-builder** dans `public/games/system/core` + `config` (~70 fichiers, bâtiments/citoyens/tech) : c'est le moteur d'UN jeu, mal rangé sous `system/`. À sortir (John a confirmé que c'était un test).
- **`next@15.3.4`** : faille de sécurité connue (CVE-2025-66478) → à mettre à jour.
- **Vieilles lignes de test** dans `x_game_score` (« Score 3 » / « Score 5 » sans utilisateur) : à supprimer manuellement dans Odoo.

---

## 5. Décisions clés (et pourquoi)

- **Backend 100 % Odoo** : Supabase (projet gratuit auto-supprimé pour inactivité) et lowdb/SQLite retirés. Un seul backend = moins de surface, cohérence.
- **Écritures via la session du CLIENT + droits portail** (et NON via un compte de service interne) : parce qu'un utilisateur interne dédié = **siège payant** sur Odoo SaaS. Le mode « droits portail » est gratuit **et plus sûr** (moindre privilège : aucun secret admin stocké, chaque client confiné à ses données). Le code d'un éventuel compte de service reste présent dans `odoo.ts` (`getServiceSession`/`callKwService`) mais **inutilisé** — repli possible si un jour un siège interne est dispo.
- **1 ligne par (jeu, joueur)** pour scores ET saves (upsert) : Odoo SaaS facture au volume de lignes. On borne à `joueurs × jeux × 2`. Sans ça, une ligne par partie ferait exploser les coûts.
- **ID de jeu injecté par la plateforme (`?gid=`)** plutôt que codé en dur : découple le code jeu de l'ID Odoo, répare le contrat, fonctionne même sans config dans le jeu.
- **Cookie `arcade_user` minimal** (`{uid, name, username}`) : l'objet session Odoo complet était trop gros → cookie tronqué/rejeté (surtout en iframe) → uid nul. Ne stocker que le nécessaire.

---

## 6. Pièges techniques rencontrés (À CONNAÎTRE)

### 6.1 `x_name` est OBLIGATOIRE sur les modèles Studio
Les modèles `x_game_score` et `x_game_save` ont un champ `x_name` (Description) **requis**. Toute création DOIT le fournir, sinon Odoo renvoie une erreur → l'API renvoie 500. C'était la cause initiale des 500 sur scores/saves.

### 6.2 Droits d'accès : le portail n'a RIEN par défaut
Les modèles custom ne donnent l'accès qu'aux groupes internes (Role/User, Administrator). Les comptes **portail** (= tes clients) ne peuvent ni lire ni écrire sans configuration explicite. Voir la recette §8.

### 6.3 Cookies tiers dans l'iframe
Dans l'iframe cross-site, les cookies `SameSite=None` sont bloqués par défaut (Chrome/Safari). On a ajouté l'attribut **`Partitioned` (CHIPS)** → OK sur Chrome/Edge/Firefox, KO sur Safari. Symptômes typiques : session qui saute, obligation de se reconnecter, ou 401 sur les API. Vérifier dans l'onglet Application/Réseau du navigateur si le cookie `arcade_session` est bien présent.

### 6.4 Taille des cookies
Un cookie dépassant ~4 Ko est tronqué/rejeté. Ne jamais stocker un gros objet (ex. session Odoo complète) dans un cookie. Stocker le strict minimum.

### 6.5 Corruption d'écriture par le montage (outil de dev)
⚠️ **Spécifique à l'environnement de dev utilisé cette session** : l'écriture de fichiers via les outils automatiques sur le dossier connecté **tronquait les fichiers > ~4 Ko** et/ou ajoutait des **octets nuls** (a corrompu `package.json`, `README.md`, `system.js`, et même `.git/index` → un commit à arbre vide). Contournements : écrire les fichiers via le shell (heredoc), vérifier `node --check` et l'absence d'octets nuls ; pour git, isoler l'index hors du montage. Après toute écriture importante : vérifier l'intégrité (équilibre des accolades, `git cat-file -p HEAD` doit montrer un arbre non vide).

### 6.6 Build Docker : lockfile figé
Le Dockerfile fait `pnpm install --frozen-lockfile`. Toute modif de `package.json` **impose** de régénérer `pnpm-lock.yaml` (`pnpm install --lockfile-only`), sinon le déploiement Coolify échoue.

---

## 7. Flux de données (rappel condensé)

```
Jeu (iframe) --GameSystem--> /api/scores & /api/storage (Next, meme origine)
   --session du client (cookie arcade_session)--> Odoo (call_kw)
        x_game_score  : UPSERT 1 ligne / (jeu, joueur), garde le meilleur
        x_game_save   : UPSERT 1 ligne / (jeu, joueur), cloisonnee (regle)
```

Cookies posés au login (`sameSite=none; secure; partitioned`) :
- `arcade_session` (httpOnly) = session Odoo du client.
- `arcade_user` (lisible JS) = `{ uid, name, username }` (minimal).

---

## 8. Recette : configurer les droits Odoo pour un nouveau modèle "joueur"

Si tu ajoutes un modèle custom que le portail doit pouvoir écrire (comme score/save) :

1. **Mode développeur** : Réglages → Activer le mode développeur.
2. **Droits d'accès** (Réglages → Technique → Sécurité → Droits d'accès) : créer une ligne pour le groupe **Role / Portal** avec les permissions minimales (ex. Lecture + Création ; ajouter Écriture seulement si upsert/mise à jour nécessaire ; jamais Suppression sauf besoin).
3. **Règle d'enregistrement** (Réglages → Technique → Sécurité → Règles d'enregistrement) : pour confiner chaque client à SES données. Domaine `[('x_studio_user', '=', user.id)]`. ⚠️ **Ajouter le groupe** dans la section GROUPES (sinon la règle est « Globale » et s'applique à tout le monde). Cocher uniquement les opérations à restreindre (ex. pour un classement lisible par tous : restreindre seulement l'Écriture, laisser la Lecture ouverte).

Config d'époque (obsolète depuis le 05/07/2026 — les modèles x_game_* n'existent plus,
le cloisonnement par joueur est désormais fait par les routes /api/* avec l'uid du jeton signé) :
- `x_game_score` / Portal : Lecture ✓, Création ✓, Écriture ✓, Suppression ✗.
- `x_game_save` / Portal : Lecture ✓, Création ✓, Écriture ✓, Suppression ✗.

Groupes Odoo (référence) : Role/User = id 1, Role/Administrator = id 4, Role/Portal = id 10.

---

## 9. Créer un nouveau jeu (checklist rapide)

1. Copier `public/games/_template/v1/` vers `public/games/<mon-jeu>/v1/`.
2. Dans `index.html` : charger `system.js` puis `engine/v1/*` puis les scripts du jeu.
3. Coder le gameplay dans `sketch.js` (machine d'états switch/case, pas `states` de p5.play — voir TROUBLESHOOTING).
4. Utiliser `Engine.Save` (gather/apply) et `GameSystem.Score.submit()` — jamais de `fetch` direct.
5. Ajouter le jeu au catalogue via **`/admin`** (il apparaît dans « Jeux détectés dans le dossier » après déploiement). L'ID est injecté via `?gid=`, rien à coder en dur. Le laisser **masqué** le temps des tests (jouable par l'admin seul).
6. Pousser (GitHub Desktop) → attendre l'Action GitHub verte → **Redeploy** dans Coolify → tester sur `/play/<id>`.

---

## 10. TODO (prochaines étapes)

- [x] Passer l'app sur un **sous-domaine de monsite.com** → fait le 02/07/2026 (`COOKIE_DOMAIN` défini, cookies first-party dans l'iframe).
- [ ] **SSO** avec la session du site parent — impossible tant qu'Odoo est en SaaS (voir doc domaine/cookies) ; auto-hébergement prévu à ~1 an.
- [x] **Sortir le moteur city-builder** de `system/` → fait le 03/07/2026 (déplacé dans `test-system/v1/`).
- [x] **Mettre à jour Next** (CVE-2025-66478) → fait le 03/07/2026 (15.3.6).
- [x] Corriger la release **cerebro** (v2 → v1) → fait le 03/07/2026.
- [x] Supprimer les vieilles lignes de test de scores → réglé par la migration (base repartie de zéro).
- [ ] **Refaire les jeux DE ZÉRO un par un** sur le socle `engine/v1` + template responsive (décision du 03/07/2026 : pas de migration-bidouille des jeux de test).
- [ ] Faire un **premier vrai jeu** complet à partir du template.

---

## 11. Migration PostgreSQL (05/07/2026)

**Décision** : sortir catalogue/scores/saves d'Odoo (16 €/mois de maintenance des
modèles Studio + limites de requêtes SaaS) vers un **PostgreSQL sur Coolify**.
Odoo ne sert plus qu'à vérifier les identifiants portail **au login**.

**Ce qui a été fait** (détail : `MIGRATION_POSTGRES.md`) :
- `src/lib/db.ts` (pool pg, schéma auto), `src/lib/session.ts` (cookie signé HMAC,
  7 jours — c'est l'app qui décide de la durée désormais).
- Routes `/api/*` et pages sur PostgreSQL ; upsert atomiques `ON CONFLICT`.
- Page **`/admin`** (uid `ADMIN_UID`) : catalogue, détection auto des jeux du
  dossier, publication/masquage ; l'admin voit et teste les jeux masqués.
- Ménage Odoo complet : modèles, champs, menus, actions, règles supprimés.

**Leçons apprises** :
- `DATABASE_URL` : URL **interne** Coolify + `?sslmode=disable` (cert auto-signé).
- Le déploiement est en **deux temps** : Action GitHub (build image, quelques
  minutes) **puis** Redeploy Coolify. Redéployer trop tôt = ancienne version.
- Après changement du format de session, l'ancien cookie ne vaut plus rien :
  il faut se **déconnecter/reconnecter** (sinon 404 sur /admin, pages vides).
- Le stockage **jsonb** renvoie un objet (et non plus une chaîne comme le champ
  texte Odoo) : la comparaison local/cloud d'`Engine.Save` (`_savedAt`)
  fonctionne enfin comme prévu.
