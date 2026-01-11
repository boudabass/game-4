# Document de Spécifications Techniques : Système de Météo et Température

## 1. Modèle de Données : Le Calendrier Météo (Weather Timeline)
La météo est pré-définie par le scénario pour créer une courbe de difficulté progressive.

### 1.1 Structure d'un Événement Météo
| Champ | Type | Description |
| :--- | :--- | :--- |
| `start_day` | Int | Jour du début de la transition. |
| `duration_hours` | Int | Temps (en heures) pour atteindre la nouvelle température. |
| `temp_delta` | Int | Changement en paliers de -10°C (ex: -1 pour -10°C, -2 pour -20°C). |
| `is_storm` | Boolean | Si `true`, active les effets de "Grande Tempête" (gel des ressources, etc.). |
| `forecast_visibility` | Int | Nombre de jours à l'avance où cet événement est visible sur l'UI. |

## 2. L'Algorithme de Chaleur (Heat Calculation)
Le système calcule la température de chaque bâtiment à chaque "Tick" de jeu en **Niveaux de Chaleur (Heat Levels)**.

### 2.1 La Formule Maîtresse
`Temp_finale = Temp_Ambiante + Max(Chaleur_Gen, Chaleur_Hub) + Bonus_Radiateur + Bonus_Isolation`

- **Temp_Ambiante** : La base définie par le calendrier (ex: -20°C = Niveau 0, -40°C = Niveau -2).
- **Max(Gen, Hub)** : La chaleur des zones n'est pas cumulative. On prend la zone la plus puissante.
- **Bonus_Radiateur** : Capacité active (coûte du charbon).
- **Bonus_Isolation** : Fixe par bâtiment + améliorations de l'Arbre Tech.

### 2.2 Table de Correspondance Température/Niveau
| Température (°C) | Niveau de Chaleur | État UI | Risque Maladie |
| :--- | :--- | :--- | :--- |
| -20°C | 4 | Confortable | 0% |
| -30°C | 3 | Vivable | Bas |
| -40°C | 2 | Frais | Moyen |
| -50°C | 1 | Froid | Élevé |
| -60°C | 0 | Très Froid | Très Élevé |
| -70°C+ | < 0 | Glacial | Hospitalisation directe |

## 3. Le Générateur : Consommation et Puissance
Le Générateur convertit le Charbon en Chaleur.

### 3.1 Niveaux de Puissance (Overdrive & Power)
- **Power Levels (1 à 4)** : Augmente le `Temp_delta` fourni à la zone. Consommation de charbon exponentielle.
- **Overdrive** :
    - Actionnable par le joueur.
    - Ajoute immédiatement +1 (ou +2 avec tech) Niveau de Chaleur.
    - **Risque** : Remplit une jauge de Stress. À 100%, le générateur explose.

### 3.2 Consommation de Charbon
`Consommation_Horaire = (Base_Gen * Power_Level) + (Nb_Steam_Hubs * Hub_Level) + (Nb_Heaters_Actifs * Heater_Cost)`

## 4. Spécifications du Système de "Heatmap" (Visualisation)
Mode de vue spécifique (Touche **V**).
- **Shader de Température** : Filtre de couleur sur les bâtiments (Rouge/Orange = Chaud, Bleu/Violet = Glacial).
- **Rayon d'Action** : Cercles au sol pour la portée du Générateur et des Steam Hubs.

## 5. Logique de Transition (Temperature Shifts)
- **Transition visuelle** : Accumulation de givre sur l'écran et les textures de shaders.
- **Réaction des Citoyens** : Forcer les citoyens à rentrer chez eux si leur lieu de travail n'est pas chauffé.
- **Alerte** : Notification `UI_Critical_Cold` en cas de chute brutale.

## 6. Interface Utilisateur (UI Requirements)

### 6.1 Le Thermomètre Central (Top Screen)
- Température actuelle.
- **Timeline** : Barre de temps avec icônes de météo à venir.
- **Tendances** : Flèches de changement de température.

### 6.2 Panneau du Générateur
- **Jauge de Stress** : Progression circulaire pour l'Overdrive.
- **Sélecteurs de Niveau** : Puissance et Portée.
- **Indicateur de Stock** : Temps restant estimé en charbon.

## 7. Scripts et API pour les Développeurs
- `UpdateGlobalTemperature(int new_delta)` : Refresh de tous les bâtiments.
- `CalculateBuildingHeat(BuildingInstance b)` : Retourne le niveau de chaleur final.
- `OnGeneratorOverheat()` : Déclenché à 100% de stress.
- `GetCoalConsumptionRate()` : Pour l'affichage UI.
