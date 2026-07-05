# Migration : sortir les données de jeu d'Odoo → PostgreSQL sur Coolify

> ✅ **RÉALISÉE le 05/07/2026.** Écarts par rapport au plan ci-dessous :
> - Phase 2 (migration des données) **sautée** : il n'y avait que des données de test.
> - Phase 3 : les modèles Studio et tous leurs restes (menus, actions, règles,
>   champs) ont été supprimés d'Odoo le 05/07/2026. Reste à confirmer avec
>   Emilie que la ligne 16 €/mois disparaît de la facture.
> - Gestion du catalogue : **option B retenue** → page `/admin` (réservée à
>   `ADMIN_UID`), avec en bonus la détection automatique des jeux présents
>   dans `public/games/` et l'accès admin aux jeux masqués.
> - Piège rencontré : `DATABASE_URL` doit finir par `?sslmode=disable`
>   (certificat auto-signé du Postgres Coolify ; réseau interne, SSL inutile).
> Ce document reste utile comme trace du raisonnement. L'état courant est
> décrit dans `ARCHITECTURE.md`.

> Rédigé le 03/07/2026. Objectif : supprimer les 3 modèles personnalisés Odoo
> (`x_game_release`, `x_game_score`, `x_game_save`) pour arrêter la ligne
> "Maintenance modules supplémentaires : 16 €/mois" (facturée par lignes de
> CODE des modèles Studio, pas par lignes de données) et supprimer la limite
> de requêtes Odoo SaaS. **La connexion des clients reste 100 % Odoo** (compte
> portail = standard, 0 € de surcoût).

## Vue d'ensemble

Aujourd'hui :   jeux → /api/* → Odoo (auth + catalogue + scores + saves)
Demain :        jeux → /api/* → PostgreSQL (catalogue + scores + saves)
                login → Odoo (authentification uniquement, au moment du login)

Les jeux ne changent PAS (ils parlent déjà uniquement à /api/scores et
/api/storage). Le socle engine/v1 ne change pas non plus.

## Endroits du code qui touchent Odoo (état des lieux 03/07/2026)

| Fichier | Modèle | Devient |
|---|---|---|
| src/app/actions/auth.ts | /web/session/authenticate | INCHANGÉ (login Odoo) |
| src/app/api/games/route.ts | x_game_release | lecture Postgres |
| src/app/api/scores/route.ts | x_game_score | lecture/upsert Postgres |
| src/app/api/storage/route.ts | x_game_save | lecture/upsert Postgres |
| src/app/dashboard/page.tsx | x_game_release | lecture Postgres |
| src/app/games/page.tsx | x_game_release | lecture Postgres |
| src/app/play/[gameId]/page.tsx | x_game_release | lecture Postgres |
| src/app/profile/page.tsx | x_game_score | lecture Postgres |
| src/app/scores/page.tsx | x_game_score | lecture Postgres |

## Schéma PostgreSQL

On CONSERVE les ID numériques Odoo des jeux : c'est le `?gid=` injecté dans
les iframes et la clé des scores/saves existants. Rien ne casse.

```sql
CREATE TABLE IF NOT EXISTS game (
  id          integer PRIMARY KEY,      -- ancien ID Odoo conservé
  name        text NOT NULL,
  description text DEFAULT '',
  url         text NOT NULL,            -- chemin du jeu (public/games/...)
  published   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS score (
  game_id    integer NOT NULL REFERENCES game(id),
  user_id    integer NOT NULL,          -- uid Odoo du client
  user_name  text NOT NULL,             -- nom affiché (copié au moment du score)
  score      bigint NOT NULL,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (game_id, user_id)        -- garde la règle 1 ligne par jeu+joueur
);

CREATE TABLE IF NOT EXISTS save (
  game_id    integer NOT NULL REFERENCES game(id),
  user_id    integer NOT NULL,
  data       jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (game_id, user_id)
);
```

L'upsert score devient un simple
`INSERT ... ON CONFLICT (game_id, user_id) DO UPDATE ... WHERE EXCLUDED.score > score.score`
(atomique, plus robuste que le search+write actuel).

## Sécurité : cookie de session signé (nouveau)

Aujourd'hui la sécurité vient d'Odoo (règles d'enregistrement par user).
Sans Odoo dans la boucle, il faut empêcher un petit malin de se faire passer
pour un autre uid. Solution : au login, l'app signe elle-même le cookie
(HMAC avec un secret `SESSION_SECRET`) contenant `{uid, name, username, exp}`.
- Odoo n'est appelé QU'AU LOGIN → plus aucun souci de limite de requêtes.
- Bonus : c'est NOUS qui choisissons la durée du cookie. Le palliatif
  "session persistante 90 jours" (doc DOMAINE_COOKIES_SSO.md) devient
  possible gratuitement si John le veut un jour.

## Étapes

### Phase 0 — Préparatifs (John, avec guidage, ~15 min)
1. Coolify → projet de l'arcade → "+ New Resource" → Database → PostgreSQL.
2. Récupérer l'URL interne de connexion (postgres://...@nom-interne:5432/db).
3. L'ajouter dans les variables d'environnement de l'app Coolify :
   `DATABASE_URL` + `SESSION_SECRET` (chaîne aléatoire longue).
4. Ne PAS exposer la base sur internet (pas de port public) : seule l'app
   Next.js lui parle, en réseau interne Coolify.

### Phase 1 — Code (Claude, en local)
1. Ajouter la dépendance `pg` (⚠️ régénérer pnpm-lock.yaml, cf. CLAUDE.md).
2. Créer `src/lib/db.ts` : pool pg + création auto des tables au démarrage.
3. Créer `src/lib/session.ts` : signature/vérification HMAC du cookie.
4. Réécrire les 3 routes API + adapter les 5 pages (tableau ci-dessus).
5. `src/lib/odoo.ts` : ne garde que l'authentification.
6. `.env.example` : documenter DATABASE_URL et SESSION_SECRET (placeholders,
   jamais de vraies valeurs — règle anonymisation du repo public).
7. Test local, commit local, push par John (GitHub Desktop).

### Phase 2 — Migration des données (Claude via connecteur Odoo)
1. Lire x_game_release, x_game_score, x_game_save dans Odoo.
2. Générer un script SQL d'import (`documentation/import-donnees.sql`).
3. L'exécuter sur la base Coolify (via l'app ou le terminal Coolify).

### Phase 3 — Bascule et nettoyage
1. Push → déploiement Coolify automatique.
2. Tests : login, catalogue, jouer, score, save/load (template /play/5).
3. Après quelques jours sans problème : supprimer les 3 modèles dans
   Odoo Studio (⚠️ irréversible → faire l'export Phase 2 AVANT, et garder
   une copie CSV de secours).
4. Confirmer avec Emilie (contact Odoo) que la ligne 16 €/mois disparaît
   de la facture suivante. Sinon, réclamer.

### Gestion du catalogue après migration
x_game_release n'existera plus → le catalogue se gère soit :
- **Option A (simple)** : Claude ajoute/modifie les jeux en base avec John
  à la demande (SQL direct) — suffisant vu la fréquence.
- **Option B (confort)** : petite page /admin dans l'arcade, accessible
  uniquement à l'uid de John (liste des jeux, ajout, publication).
Décision à prendre en fin de Phase 1 ; l'option B peut venir plus tard.

## Ce qui ne change PAS
- Login client = compte portail Odoo (un seul compte pour site + arcade).
- Les jeux, le socle system/engine/v1, le template, les URLs, le ?gid=.
- Le déploiement Docker/Coolify, le domaine arcade.monsite.com.

## Gains
- −16 €/mois (−192 €/an) après suppression des modèles Studio.
- Plus AUCUNE limite de requêtes liée à Odoo SaaS pendant le jeu.
- Odoo appelé uniquement au login → moins fragile, plus rapide.
- Classements plus riches possibles (top 10, historique) sans surcoût.
- Prépare l'auto-hébergement Odoo prévu dans ~1 an (rien à refaire).
