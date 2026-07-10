# 00 — Méthodologie & règles strictes

> Chapeau de toute la roadmap. À lire avant toute phase. Aucun code à ce stade — ce fichier définit les règles du jeu (au sens propre) pour la suite du projet.

## 1. Principe général

Pipeline inspiré des studios AAA (Pré-production → Production [Alpha → Beta] → Certification/Gold → Lancement → Post-lancement/Live-ops), adapté à une équipe de deux (John + Claude) : on garde la **rigueur** (jalons, critères de sortie obligatoires, definition of done écrite) sans prétendre à l'échelle ou aux moyens d'un studio AAA.

Terminologie standard reprise (Alpha = feature complete, Beta = content complete, Gold = version certifiée prête à sortir) : voir sources en bas de ce fichier.

## 2. Règle des jalons (gates)

Chaque phase de la roadmap (`01_...md` à `07_...md`) se termine par une section **Gate de sortie** : une liste de critères obligatoires.

**Règle stricte : il est interdit d'entamer la phase suivante tant que le gate de la phase en cours n'est pas explicitement validé par John.** Un gate non atteint = on reste dans la phase en cours et on corrige, on ne contourne pas.

## 3. Definition of Done (DoD) — commune à toute fonctionnalité livrée, quelle que soit la phase

Une fonctionnalité n'est "terminée" que si elle coche tous ces points :

1. Fonctionne au clic/tap seul, zéro clavier/manette (voir `CAHIER_DES_CHARGES.md` §0).
2. Testée manuellement sur desktop **et** sur mobile/tablette réels (pas seulement en responsive simulé dans un navigateur desktop).
3. Passe exclusivement par le contrat `window.GameSystem` (`Lifecycle`, `Score`, `Save`) — jamais de `fetch` direct, jamais de `localStorage` pour la progression (règles d'or de `GAME_WORKFLOW.md`).
4. Sauvegarde persistante vérifiée : fermer le jeu, le rouvrir, l'état est conservé.
5. Ne casse aucun système déjà validé dans une phase précédente (non-régression vérifiée manuellement, checklist dans `CHECKLISTS.md`).
6. Toute divergence par rapport au GDD ou au cahier des charges est documentée (pas de dérive silencieuse).

## 4. Découpage par discipline

Chaque phase organise ses sous-actions selon ces catégories, systématiquement :

- **Game Design** — règles, équilibrage, contenu narratif/fonctionnel.
- **Programmation / Moteur** — code jeu, socle `engine/`, intégration plateforme.
- **Contenu & Données** — listes de cultures/animaux/PNJ/recettes, structuré en données (pas en dur dans le code).
- **Art & Audio** — assets graphiques et sonores.
- **QA / Tests** — vérification manuelle selon checklists.
- **Intégration Plateforme** — catalogue `/admin`, `/play/<id>`, conformité au contrat `GameSystem`.

## 5. Versionnement du jeu

Aligné sur les jalons de la roadmap :

| Version | Jalon | Phase |
|---|---|---|
| v0.1 | Prototype interne (gray-box) | 01 — Pré-production |
| v0.3 | Vertical slice validée | 02 — Vertical Slice |
| v0.5 | Alpha — feature complete | 03 — Alpha |
| v0.9 | Beta — content complete | 04 — Beta |
| v1.0-rc | Release Candidate | 05 — Certification |
| v1.0 | Gold / lancement public | 06 — Lancement |
| v1.x | Évolutions post-lancement | 07 — Post-lancement |

## 6. Feature freeze

**À partir du début de la phase Beta (04), aucune nouvelle fonctionnalité n'est ajoutée.** Toute idée qui émerge en cours de Beta ou après va dans le backlog post-lancement (`07_POST_LANCEMENT_LIVEOPS.md`), jamais dans la phase en cours. C'est la règle anti-dérive-de-scope la plus importante de cette roadmap.

## 7. Traçabilité

Chaque gate validé (date + décision de John) doit être consigné, sur le modèle déjà utilisé par le projet dans `documentation/JOURNAL_FONDATION.md`.

## 8. Sources (terminologie AAA)

Recherche effectuée le 08/07/2026 sur les phases standard de développement (pré-production / production / alpha / beta / gold / post-production) pour ancrer le vocabulaire utilisé dans cette roadmap.
