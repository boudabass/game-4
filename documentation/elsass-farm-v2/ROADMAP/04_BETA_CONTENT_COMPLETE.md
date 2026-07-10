# 04 — Beta (content complete)

> Jalon AAA standard : Beta = **content complete**. Tout le contenu final est en place (assets graphiques et audio définitifs, tous les textes, toutes les cultures/animaux/PNJ/recettes du GDD, les 20 paliers de la mine, catalogue complet de défis), équilibrage complet. Le travail restant est la correction de bugs.

## Règle stricte : feature freeze

**Aucune nouvelle fonctionnalité à partir du début de cette phase.** Uniquement : contenu final + équilibrage + correction de bugs. Toute idée nouvelle va dans le backlog post-lancement (`07_POST_LANCEMENT_LIVEOPS.md`).

## Sous-actions

- **Contenu & Données** : intégration de toutes les cultures/animaux/poissons/paliers de mine/recettes/PNJ du GDD (remplacement complet des placeholders de la phase Alpha).
- **Art & Audio** : intégration de tous les assets définitifs.
- **Game Design** : rédaction finale de tous les textes/dialogues, cohérents avec le ton de marque The Elsassisch (voir les skills `blog-elsassisch` et `elsassisch-publication-client` pour la charte de ton).
- **Équilibrage** : temps de pousse, prix, fréquence et sévérité des défis (première proposition dans `GAME_DESIGN_DOCUMENT.md` §7), ajustés à partir de tests réels.
- **QA / Tests** : playtest externe — quelques clients volontaires de The Elsassisch en bêta fermée, retours collectés et triés (bug bloquant / majeur / mineur).
- **Programmation** : correction de bugs uniquement, aucune nouvelle feature même petite.

## Gate de sortie (obligatoire avant la phase 05)

- [ ] Zéro bug bloquant ou majeur connu.
- [ ] Contenu 100 % final, plus aucun placeholder.
- [ ] Testé sur les 3 form factors et les navigateurs cibles.
- [ ] Version taguée v0.9.
