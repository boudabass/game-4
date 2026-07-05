# 🔍 Audit de la documentation

> État de chaque document au **2 juillet 2026**, après finalisation de la migration vers Odoo.
> ⚠️ **05/07/2026** : migration **PostgreSQL** effectuée (Odoo = login seul). `ARCHITECTURE.md`,
> `developer_guide.md`, `GAME_WORKFLOW.md`, `TROUBLESHOOTING.md`, `JOURNAL_FONDATION.md` et
> `MIGRATION_POSTGRES.md` ont été remis à jour ce jour-là ; les statuts ci-dessous datent du 02/07.
> Objectif : savoir quoi croire. Beaucoup de docs ont été écrites au fil de mutations successives ;
> ce fichier signale ce qui est fiable, ce qui est obsolète, et ce qui décrit une **intention de design**
> (pas forcément le code réellement livré).

## Légende
- ✅ **À jour** — fiable, reflète le code actuel.
- ⚠️ **Design / intention** — décrit ce qui est *voulu* pour un jeu, pas forcément ce qui est codé. À lire comme un cahier des charges, pas comme une description du réel.
- 🔴 **Obsolète** — contient des infos fausses aujourd'hui, à corriger ou ignorer.

---

## Documentation de plateforme (architecture & process)

| Fichier | État | Notes |
|---|---|---|
| `ARCHITECTURE.md` | ✅ | **Nouveau** — la vue d'ensemble de référence. |
| `../README.md` | ✅ | **Réécrit** — était 🔴 (lowdb, Supabase, `/admin`, `src/lib/database.ts`). |
| `../AI_RULES.md` | ✅ | Règles d'archi « Odoo Edition », correctes. |
| `developer_guide.md` | ✅ | Guide technique Odoo, correct. Mentionne lowdb/Supabase **uniquement pour dire qu'ils sont supprimés** — donc juste. |
| `GAME_WORKFLOW.md` | ✅ | Process de création de jeu, correct (mention `db.json` = « supprimé », OK). |
| `TROUBLESHOOTING.md` | ✅ | Erreurs p5.play + section 500 sur `/api/scores` : correcte. |
| `base_parametre.md` | ✅ | Valeurs de tuning « game feel ». Intemporel. |

## Patterns de développement (p5.js / p5.play)

| Dossier | État | Notes |
|---|---|---|
| `patterns/*.md` (13 fichiers) | ✅ | Patterns techniques p5.play (structure, physique, collisions, caméra, scènes, intégration GameSystem…). Cohérents avec `system.js` actuel (`window.DyadGame`, `GameSystem.Score.submit`). Réutilisables tels quels. |

> Nuance : `patterns/10_system_integration.md` montre `states.next('gameover')` alors que `TROUBLESHOOTING.md` déconseille le gestionnaire d'états de p5.play (instable) et recommande un `switch/case` maison. Simple incohérence de style, pas un bug d'archi.

## Documents de design des jeux

Ces docs décrivent **la conception voulue** de chaque jeu. Ils sont précieux comme cahier des charges, mais **ne garantissent pas** que la fonctionnalité est codée. À confronter au code dans `public/games/<jeu>/` avant de s'y fier.

| Dossier | État | Notes |
|---|---|---|
| `ferme/*.md` (17 fichiers) | ⚠️ | Design d'Elsass Farm (cycle agricole, quêtes, inventaire, mine, temps, UI…). `ferme/save_system.md` décrit un save **hybride localStorage + Odoo** cohérent avec l'archi actuelle. |
| `elsass-frost/*.md` (14 fichiers) | ⚠️ | Design d'un city-builder (bâtiments, citoyens, économie, tech tree, météo…). Ambitieux ; vérifier l'état réel du code `elsass-frost/v1`. |
| `similitude/*.md` (7 fichiers) | ⚠️ | Design du jeu Similitude (game loop, scoring, animations, UI). |
| `cerebro/PRD.md` | ⚠️ | PRD du jeu Cerebro (éditeur de graphes / mind-map). |

### Points obsolètes précis à corriger dans les docs de design
- 🔴 `elsass-frost/PRD.md` (~ligne 45) : « Persistance **LocalStorage** synchronisée avec la base de données centrale **`db.json`** ». → Faux aujourd'hui : la persistance passe par **Odoo** (`x_game_save` via `/api/storage`). À reformuler comme dans `ferme/save_system.md`.

---

## Recommandations

1. **Point d'entrée unique** : commencer par `ARCHITECTURE.md`, puis `AI_RULES.md`. Les deux forment la source de vérité de la plateforme.
2. **Corriger le résidu** dans `elsass-frost/PRD.md` (une phrase) pour retirer la mention `db.json`.
3. **Docs de design (`⚠️`)** : ne pas les traiter comme une description du réel. Avant de développer, comparer au code du jeu concerné.
4. **Tenir `ARCHITECTURE.md` à jour** à chaque changement structurel (nouveau modèle Odoo, nouvelle route, changement de déploiement).
