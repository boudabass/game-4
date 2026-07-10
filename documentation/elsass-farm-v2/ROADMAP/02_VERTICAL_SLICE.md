# 02 — Vertical Slice

> Terme standard AAA : une tranche verticale complète et représentative du jeu final, sur un périmètre volontairement restreint, mais avec un niveau de finition proche du produit fini. Objectif : prouver que "c'est amusant" avant d'investir dans tout le contenu.

## Périmètre (volontairement restreint)

- Une mini-ferme + un mini-village : quelques cases cultivables, un seul PNJ, un seul point de vente.
- Système de culture complet de bout en bout : labourer → planter → arroser → récolter → vendre.
- Cycle jour/nuit + sommeil + sauvegarde persistante réelle (via `GameSystem.Save`).
- HUD complet : barre d'objets + boutons de zoom fonctionnels.
- Un PNJ fonctionnel : dialogue, don de cadeau, jauge de relation qui évolue.
- **Un défi/catastrophe fonctionnel de bout en bout** (ex. gel tardif qui détruit une culture) — objectif : valider tôt le concept de "régression réparable, jamais définitive" avant de construire tout le catalogue de défis en phase 03-04.

## Sous-actions par discipline

- **Programmation** : intégrer les modules validés en pré-production (déplacement, zone d'action, zoom) dans un vrai contexte de jeu.
- **Contenu** : 2-3 cultures réelles (pas de placeholder à ce stade, contrairement à l'Alpha).
- **Art** : assets définitifs, mais uniquement sur ce petit périmètre.
- **QA** : checklist complète de `CHECKLISTS.md` appliquée à ce périmètre restreint.

## Gate de sortie (obligatoire avant la phase 03)

- [ ] Jouable de bout en bout, sans bug bloquant.
- [ ] Validée par John comme représentative de l'expérience cible — le "feeling" du jeu est confirmé, pas seulement la mécanique brute.
- [ ] Testée sur les 3 form factors : smartphone, tablette, PC.
- [ ] Version taguée v0.3.
