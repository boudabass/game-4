# 📊 Scoring — Similitude (Calcul des Points)

Le score est calculé uniquement lors d'une fusion (match de 3 items ou plus).

## 1. Formule de Base

$$
\text{Score Gagné} = \text{Base Score} \times \text{Nombre d'Items Fusionnés} \times \text{Multiplicateur Combo}
$$

*   **Base Score :** 10 points (fixe).

## 2. Multiplicateurs de Combo (Alignement)

Le multiplicateur dépend du nombre d'items alignés dans la fusion :

| Items Alignés | Multiplicateur | Exemple (Score Base 10) |
| :--- | :--- | :--- |
| **3** (Minimum) | x1 | $10 \times 3 \times 1 = 30$ points |
| **4** | x2 | $10 \times 4 \times 2 = 80$ points |
| **5+** | x3 | $10 \times 5 \times 3 = 150$ points |

## 3. Ressources

| Ressource | Rôle | Limite |
| :--- | :--- | :--- |
| **⚡ Énergie** | Limite le nombre de mouvements (clics de déplacement). | Initial : 20 (configurable). |
| **💰 Or** | Monnaie inter-niveaux (non utilisée dans la v1). | Initial : 0. |
| **⏱ Chrono** | Temps restant avant la fin de partie. | Initial : 120s (configurable). |

## 4. Fin de Partie

La partie se termine si :

1.  Le `Chrono` atteint 0.
2.  L'`Énergie` atteint 0 (et aucune fusion n'est possible pour la recharger).