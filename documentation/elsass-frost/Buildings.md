# Document de Spécifications Techniques : Système de Construction

## 1. Modèle de Données (Building Data Structure)
Chaque bâtiment est un objet héritant d'une classe de base `Building`.

### 1.1 Propriétés Fondamentales
| Attribut | Type | Description |
| :--- | :--- | :--- |
| `building_id` | String | Identifiant unique (ex: `tent_01`, `workshop_01`). |
| `category` | Enum | `HOUSING`, `HEALTH`, `FOOD`, `RESOURCES`, `TECH`, `PURPOSE`. |
| `icon` | String | Icône du bâtiment. |
| `width` | Int | Largeur du bâtiment. |
| `height` | Int | Hauteur du bâtiment. |   
| `cost` | Dictionary | Ressources requises : `{"wood": 20, "steel": 0, "steam_core": 0}`. |
| `consume` | Dictionary | Ressources consommées : `{"wood": 20, "steel": 0, "steam_core": 0}`. |
| `product` | Dictionary | Ressources produites : `{"wood": 20, "steel": 0, "steam_core": 0, health: 0, "discontent": 0, "hope": 0 , "ration": 0, "food": 0, "science": 0, "prosteses": 0, "automaton": 0, heat: 0,}`. |
| `staff` | Dictionary | Ressources produites : `{"worker": 20, "engineer": 0, "child": 0, "automaton": 0}`. |
| `staff_max` | Int | Nombre max d'employés. |
| `insulation` | Int | Niveau d'isolation. |
| `description` | String | Description du bâtiment. |
| `isUnique` | Boolean | Si le bâtiment est unique. |

## 2. Le Système de Grille standardisée
Le jeu utilise une grille carrée (X, Y).

### 2.1 Structure de la Grille
- **Grille** : La grille est un carré de 40x40 unités.
- **Centre** : Le Générateur 3x3 cases (20,20).

### 2.2 Algorithme de Placement
- **Vérification de Collision** : 
- **Connexion Route** : Le bâtiment doit avoir au moins un segment adjacent à un objet de type Road qui remonte jusqu'au Générateur.
- **Upgrade "Over-place"** : Si un bâtiment de type Bunkhouse est placé sur une Tent, le système soustrait le coût de la tente et lance la déconstruction/reconstruction automatique.

## 3. Système Thermique (Heat & Temperature)
Le fonctionnement d'un bâtiment dépend de sa Température Finale.

### 3.1 Formule de Calcul
`Temp_Finale = Temp_Météo + Chaleur_Générateur + Chaleur_Vapeur + Radiateur + Isolation`

- **Temp_Météo** : Valeur globale (ex: -20°C = 0, -30°C = -1, etc.).
- **Chaleur_Zone** : Bonus si le bâtiment est dans le rayon du Générateur ou d'un Steam Hub (Non cumulatif, on prend la valeur max).
- **Radiateur (Heater)** : Capacité active consommant du charbon (+1 à +3).
- **Isolation** : Bonus passif du bâtiment + recherches technologiques.

### 3.2 Échelle des États
| Niveau (Heat Level) | État | Conséquence |
| :--- | :--- | :--- |
| > 4 | Confortable | Risque de maladie 0%. |
| 3 | Vivable | Risque de maladie très faible. |
| 2 | Frais (Chilly) | Risque de maladie modéré. |
| 1 | Froid | Risque de maladie élevé. |
| 0 | Très Froid | Risque de maladie grave. |
| < 0 | Glacial | Le bâtiment s'arrête (Freeze). |

## 4. Main d'œuvre et Efficacité (Staffing)

### 4.1 Calcul de l'Efficacité Globale
`Efficiency = (Current_Staff / Max_Staff) * Heat_Modifier * Law_Modifiers * Tech_Modifiers`

- **Heat_Modifier** : Si le bâtiment est trop froid, l'efficacité tombe à 0% (sauf pour les automates).
- **Maladie** : Si 2 ouvriers sur 10 sont malades (hospitalisés), Current_Staff passe à 8.
- **Heures de travail** : Le bâtiment ne produit que durant ses Work_Hours (ex: 08:00 - 18:00).

## 5. Flux de Construction (UX Pipeline)
- **Ghost Mode** : Le joueur sélectionne le bâtiment. Un hologramme apparaît sur la grille radiale.
    - **Rouge** : Impossible (collision ou hors zone).
    - **Bleu** : Valide.
- **Placement** : Les ressources sont déduites immédiatement. Un site de construction est créé.
- **Affectation des bâtisseurs** : Le système de jeu puise dans les citoyens "Disponibles" (sans travail ou en repos). Ils doivent se déplacer physiquement vers le site.
- **Progression** : La barre de construction avance proportionnellement au nombre d'ouvriers sur place.

## 6. Interface Utilisateur (UI Requirements)

### 6.1 Menu de Construction (Barre basse)
- Tri par onglets (Icônes claires).
- **Infobulle** : Affiche le coût, l'isolation de base, et une description courte.

### 6.2 Panneau de Détails (Clic sur bâtiment)
- **Toggle Radiateur** : Bouton pour activer/désactiver le chauffage local.
- **Gestion Staff** : Boutons + et - pour ajouter/retirer des gens par clic ou par groupe de 5.
- **Jauge de Température** : Thermomètre visuel indiquant l'état actuel (Couleur : Rouge -> Bleu).
- **Production** : Affiche la capacité de production / heure / travaileur.
- **Consomation** : Affiche la capacité de consommation / heure / travaileur.
- **Inventaire** : Pour les bâtiments de ressources, affiche le stock local.

## 7. Scripts et Événements (API)
Les développeurs devront exposer ces méthodes :
- `OnTemperatureChanged(new_temp)` : Recalcule les risques de maladie de tous les occupants.
- `ToggleHeater(bool)` : Active la consommation de charbon et augmente le niveau de chaleur.
- `UpgradeBuilding(new_building_id)` : Gère la transition fluide entre deux tiers de bâtiments.
- `CheckRoadConnection()` : Vérifie récursivement si le bâtiment est lié au centre.
