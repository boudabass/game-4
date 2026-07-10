# 05 — Certification / Release Candidate

> Équivalent adapté de la certification AAA (au lieu d'une certification console Sony/Microsoft/Nintendo, ici c'est la conformité stricte au contrat technique de la plateforme game-4).

## Checklist de conformité technique (reprise des "Règles d'Or" de `GAME_WORKFLOW.md` §3)

- [ ] `window.GameSystem.Lifecycle.notifyReady()` appelé à la fin du `setup()`.
- [ ] `Score.submit()` et `Save.read()/write()` utilisés exclusivement — aucun `fetch` direct vers `/api/...`, aucun `localStorage` pour la progression.
- [ ] Dimensions responsives gérées (redimensionnement du canvas p5.js écouté et pris en compte).

## Tests de robustesse

- [ ] Perte de connexion en cours de partie.
- [ ] Session Odoo expirée en cours de jeu (`/login?expired=1&next=...`).
- [ ] Reprise de partie après fermeture brutale du navigateur/onglet.

## Revue de sécurité minimale

- [ ] Aucune donnée sensible exposée côté client.
- [ ] L'uid utilisé par les routes provient toujours du jeton signé (`arcade_session`), jamais du cookie `arcade_user` ni d'une valeur envoyée par le client.

## Validation terrain

- [ ] Publication en mode **masqué** sur `/admin`.
- [ ] John joue une partie complète en conditions réelles, comme un client, avant toute publication publique.

## Gate de sortie (obligatoire avant la phase 06)

- [ ] Toutes les cases ci-dessus cochées.
- [ ] Si un bug bloquant est trouvé : retour en Beta (04) le temps du correctif — pas de nouvelle feature ajoutée pour autant, le feature freeze reste actif.
- [ ] Validation explicite de John pour publication publique.
- [ ] Version taguée v1.0-rc, puis v1.0 (Gold) une fois validée.
