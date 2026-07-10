# 03 — Alpha (feature complete)

> Jalon AAA standard : Alpha = **feature complete**, pas content complete. Tous les systèmes prévus au scope V1 existent et fonctionnent de bout en bout, même si le contenu (assets, textes, équilibrage) reste provisoire par endroits. Ne pas attendre que tout soit fini pour valider ce jalon.

## Sous-actions, système par système (référence : `CAHIER_DES_CHARGES.md` et `GAME_DESIGN_DOCUMENT.md`)

- **Élevage** : bâtiments, acquisition d'animaux, cycle de production quotidien.
- **Pêche** : mini-jeu de pêche, zones de pêche, table de prises basique.
- **Mine** : les 4 familles de paliers (GDD §4) avec au moins un type d'énigme fonctionnel par famille — le détail des 20 paliers vient en phase 04 (Beta).
- **Artisanat** : au moins une structure de transformation fonctionnelle de bout en bout (ex. cave à fromage), le reste suit le même patron technique.
- **PNJ** : les 8 PNJ du GDD présents en jeu, dialogues et jauges de relation fonctionnels — le contenu des dialogues peut rester provisoire.
- **Défis/catastrophes** : l'EventHub gère au moins un défi de chaque catégorie (météo / sinistre / PNJ hostile).
- **Marché asynchrone** : le cadrage technique (nouvelle table partagée, API dédiée) est validé, et un flux minimal (mettre en vente / acheter) fonctionne, même basique.

## Gate de sortie (obligatoire avant la phase 04)

- [ ] Tous les systèmes du scope V1 sont jouables et interconnectés, sans crash.
- [ ] Chaque système testé individuellement selon la checklist QA (`CHECKLISTS.md`).
- [ ] Aucune régression sur la vertical slice validée en phase 02.
- [ ] Version taguée v0.5.
