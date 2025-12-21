# 🌾 Tableau Temps Farming — Cycle Simplifié (v3)

> Saison = 28 jours | Cycle récolte = 10 jours | Auto-suffisance

## 📊 États et Durées
| État | Durée | Condition | Arrosage requis |
| :--- | :--- | :--- | :--- |
| Planté | Jour 0 | Stock > 0 | Non |
| Croissance | **10 jours** | Arrosé quotidien | **OUI** |
| Prêt récolte | Jour 10+ | Complète | Récolter |

## ⚙️ Règles de Rendement (v3)
La mécanique repose sur un principe de multiplication naturelle.

| Action | Coût Stock | Gain Stock | Net |
| :--- | :--- | :--- | :--- |
| Planter | -1 | 0 | -1 |
| Récolter | 0 | **+2** | +2 |
| **Cycle Complet** | **-1** | **+2** | **+1** |

> **Note :** Si le joueur n'a plus de stock (0), il ne peut plus planter. Il doit acheter au moins 1 unité au magasin (Marcel) pour relancer la machine.

## 🌸 Gestion Saisons
| Cas | Effet |
| :--- | :--- |
| Plantation hors saison | Refusée |
| Changement saison | Cultures meurent (perte sèche du stock planté) |
| Récolte | Toujours +2 |