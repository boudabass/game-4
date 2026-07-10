# 07 — Post-lancement / Live-ops

> Objectif : maintenir l'engagement dans la durée, cohérent avec le principe de "partie sans fin" (`PRD.md` §2, rétention). C'est ici, et seulement ici, que le feature freeze de la Beta est levé.

## Sous-actions

- **Cadence de contenu additionnel** (façon "live-ops" AAA) : événements saisonniers limités dans le temps (ex. un événement spécial "Marché de Noël" en hiver), nouvelles recettes/cultures ajoutées progressivement.
- **Boucle de feedback client** : collecte régulière des retours qualitatifs des joueurs.
- **Suivi des KPIs** définis dans `PRD.md` §10 (taux de retour, temps de session moyen, nombre de parties actives, volume d'échanges sur le marché asynchrone).
- **Backlog des idées non retenues en V1** : combat, multijoueur temps réel, personnalisation avancée du personnage, dialogues à choix multiples ramifiés — à réévaluer seulement ici, jamais avant (voir `PRD.md` §7 "hors scope V1").
- **Maintenance / dette technique** : revue régulière du socle `engine/` partagé avec les autres jeux de l'arcade, pour éviter que les évolutions d'Elsass Farm V2 ne cassent les autres jeux.

## Règle

Chaque ajout post-lancement suit son propre mini-cycle (design → implémentation → test → mini-gate de validation par John) — pas de scope creep silencieux, même en phase de vie du jeu.
