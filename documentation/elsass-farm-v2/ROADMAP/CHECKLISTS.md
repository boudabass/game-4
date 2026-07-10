# Checklists réutilisables

> Référencées par chaque fichier de phase, pour éviter la duplication. Toute checklist ci-dessous doit être passée en revue avant de valider un gate de sortie.

## Checklist "Definition of Done" (une fonctionnalité)

- [ ] Fonctionne au clic/tap seul, zéro clavier/manette.
- [ ] Testée manuellement sur desktop **et** sur mobile/tablette réels.
- [ ] Passe exclusivement par `window.GameSystem` (`Lifecycle`, `Score`, `Save`).
- [ ] Sauvegarde persistante vérifiée après fermeture/réouverture.
- [ ] Aucune régression sur un système déjà validé.
- [ ] Toute divergence par rapport au GDD/CDC est documentée.

## Checklist QA cross-device (à répéter à chaque gate de phase)

- [ ] Déplacement au clic fonctionne (souris **et** tactile).
- [ ] Zone d'action correcte : actions à portée déclenchées, hors de portée = déplacement.
- [ ] Boutons de zoom fonctionnels au clic/tap (aucun geste pincer-zoomer requis).
- [ ] Barre d'objets/outils sélectionnable au clic/tap uniquement.
- [ ] Sauvegarde persiste après fermeture complète du navigateur.
- [ ] Testé sur au moins : 1 smartphone réel, 1 tablette réelle, 1 PC (2 navigateurs différents si possible).
- [ ] Aucune régression sur les systèmes validés dans les phases précédentes.

## Checklist gate de sortie de phase (générique)

- [ ] Tous les critères spécifiques listés dans le fichier de la phase sont cochés.
- [ ] Checklist "Definition of Done" passée pour chaque fonctionnalité livrée dans la phase.
- [ ] Checklist QA cross-device passée sur le périmètre de la phase.
- [ ] Validation explicite de John, consignée avec la date.
