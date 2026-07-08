# Game Design Document — Elsass Farm V2

> Statut : document de cadrage — phase réflexion, aucun code.
> Détaille le contenu concret prévu par `CAHIER_DES_CHARGES.md`. Les noms, prix et durées ci-dessous
> sont des propositions de premier jet, à ajuster en phase de contenu/équilibrage (voir `ROADMAP.md`).

## 1. Univers & thème

Un village alsacien fictif, quelque part entre plaine viticole et piémont vosgien. Colombages, vignes en coteaux, canaux et étangs à carpes, marché couvert, et une ancienne mine argentifère dans les hauteurs — clin d'œil au passé minier réel du Val d'Argent (Sainte-Marie-aux-Mines). Le ton reste léger et chaleureux, pas de contenu violent (cohérent avec l'absence de combat).

## 2. Cultures par saison

| Saison | Cultures | Inspiration |
|---|---|---|
| Printemps | Asperges, rhubarbe, radis, épinards, choux primeurs | L'asperge d'Alsace (région de Hoerdt) |
| Été | Houblon, tomates, haricots verts, maïs, framboises | Houblonnières du Kochersberg/Haguenau |
| Automne | Raisin, choux à choucroute, courges, mirabelles, quetsches, noix | Route des vins, choucroute, vergers du Sundgau |
| Hiver | Poireaux, choux de Bruxelles, topinambours, sapins (culture spéciale liée au marché de Noël) | Marché de Noël alsacien |

Chaque culture a un temps de pousse (2 à 10 jours selon rareté/valeur) et un prix de vente croissant avec la rareté, sur le modèle "achat élevé / vente basse" déjà validé dans l'ancien `city.md`.

## 3. Élevage

| Animal | Bâtiment | Production | Fréquence |
|---|---|---|---|
| Poules | Poulailler | Œufs | Quotidienne |
| Vaches | Étable | Lait (→ Munster, Tomme via artisanat) | Quotidienne |
| Chèvres | Étable | Lait de chèvre (→ fromage de chèvre) | Quotidienne |
| Moutons | Étable | Laine | Tous les 2-3 jours |
| Abeilles | Ruches (en extérieur, près des cultures fleuries) | Miel | Hebdomadaire |

Pas de foie gras ni d'élevage à connotation sensible — le choix des produits (œufs, lait, laine, miel) reste volontairement neutre et familial.

## 4. Pêche & Mine

### Pêche
Zones : rivière du village, canal, étang à carpes (clin d'œil à la "route de la carpe frite" du Sundgau), Ill (rivière alsacienne).
Prises typiques : carpe, truite, brochet, écrevisse, anguille. Raretés et tailles variables, influencées par la météo du jour (pluie = meilleures prises, règle classique du genre).

### Mine (paliers thématiques, sans combat — reprise du concept validé)

| Paliers | Ressources | Type d'énigme |
|---|---|---|
| 1-5 (galeries hautes) | Quartz des Vosges, cristaux | Association de symboles / séquence |
| 6-10 | Fer, cuivre | Séquence logique / rythme |
| 11-15 | Argent (clin d'œil au Val d'Argent) | Puzzle de coordination |
| 16-20 (galeries profondes) | Gemmes rares | Labyrinthe / réflexion visuelle |

Chaque énigme dure 30 à 90 secondes, récompense variable selon la performance (reprise directe du barème de l'ancien `mine.md`, toujours pertinent).

## 5. PNJ du village

| PNJ | Rôle | Terrain d'interaction | Effet de relation |
|---|---|---|---|
| Le vigneron | Vend/achète raisin et vin | Cave viticole | Réduction prix vin, accès recettes |
| La boulangère | Vend farine, achète céréales | Boulangerie | Recettes de kougelhopf/bretzel |
| L'aubergiste | Tient la winstub, achète des produits fermiers | Winstub | Quêtes de livraison, buffs temporaires |
| Le potier | Vend des contenants (paniers, pots), inspiré de la poterie de Soufflenheim/Betschdorf | Atelier de poterie | Meubles/déco pour la ferme |
| La tisserande | Vend/achète laine et textile — clin d'œil à l'activité textile de The Elsassisch | Atelier textile | Amélioration d'inventaire (sacs) |
| L'apiculteur | Vend ruches, achète miel | Rucher du village | Recettes à base de miel (pain d'épices) |
| L'ancien mineur | Guide de la mine, vend de l'équipement d'exploration | Entrée de la mine | Débloque paliers plus profonds |
| Le maraîcher | Vend graines, achète récoltes | Marché couvert | Prix de vente globaux |

Jauge de relation par PNJ (paliers 0/5/10/15/20, sur le modèle repris de `quest_system.md`), avec effets cumulables mais purement fonctionnels (pas de dialogues ramifiés en V1).

## 6. Artisanat / recettes de transformation

| Structure | Ingrédients | Produit |
|---|---|---|
| Cave d'affinage | Lait de vache | Munster, Tomme |
| Cave d'affinage | Lait de chèvre | Fromage de chèvre |
| Cellier | Raisin | Vin d'Alsace |
| Brasserie | Houblon + orge | Bière artisanale |
| Four | Farine + œufs | Kougelhopf, bretzel |
| Atelier miel | Miel + épices | Pain d'épices |
| Fermentation | Chou à choucroute | Choucroute |

Production asynchrone : dépôt des ingrédients, résultat prêt au réveil suivant (règle reprise de `farming_cycle_concept.md` §4).

## 7. Système de défis / catastrophes — catalogue de premier jet

| Catégorie | Exemple | Déclencheur | Effet | Mitigation possible |
|---|---|---|---|---|
| Météo | Gel tardif | Début de printemps, aléatoire | Détruit une partie des cultures de printemps non protégées | Construire un abri/serre |
| Météo | Grêle | Été, aléatoire | Dégâts sur cultures en plein champ | Diversifier / assurance récolte |
| Météo | Sécheresse | Été, plusieurs jours sans pluie | Croissance ralentie si non arrosé | Arroseurs automatiques |
| Météo | Inondation | Automne, proximité rivière/canal | Dégâts sur parcelles proches de l'eau | Ne pas cultiver en zone inondable, ou drainage |
| Sinistre | Incendie de grange | Aléatoire rare | Perte partielle de stock/animaux si non traité à temps | Réactivité du joueur (mini-jeu d'extinction) |
| Sinistre | Invasion de nuisibles | Aléatoire, plus fréquent si cultures non variées | Perte de récolte | Diversification, clôtures |
| Sinistre | Maladie du bétail | Aléatoire, plus fréquent si animaux mal nourris | Baisse temporaire de production | Bon entretien régulier |
| PNJ hostile | Concurrence commerciale | Scénario scripté (marchand rival) | Baisse des prix de vente locaux | Bonne relation avec les PNJ marchands |
| PNJ hostile | Rumeur négative | Relation PNJ dégradée | Baisse de réputation globale | Cadeaux, quêtes, dialogue régulier |
| Marché | Manipulation du marché asynchrone | Action d'un autre joueur (scénario à cadrer) | Fluctuation défavorable des prix | Diversifier les canaux de vente |

Règle d'équilibrage : jamais de perte totale ni de game over. Fréquence cible de départ : un défi significatif tous les 5 à 10 jours en jeu, ajustable après tests.

## 8. Compétences (reprise du modèle Stardew, adapté au scope sans combat)

| Compétence | Se développe en | Débloque |
|---|---|---|
| Agriculture | Récoltant des cultures | Arroseurs, nouvelles graines, qualité supérieure |
| Élevage | Récoltant des produits animaux | Bâtiments agrandis, nouveaux animaux |
| Pêche | Pêchant | Meilleures cannes, accès à de nouvelles zones |
| Extraction (mine) | Résolvant des énigmes de mine | Paliers plus profonds, meilleur loot |
| Artisanat | Fabriquant des produits transformés | Nouvelles recettes, structures avancées |

Pas de compétence "Combat" (hors scope V1). Choix de spécialisation à un palier intermédiaire (façon "professions" Stardew) : à détailler en phase de contenu.

## 9. Marché asynchrone — proposition de premier jet

- "Marché régional" accessible depuis le marché couvert du village : annonces d'autres joueurs (produit, quantité, prix), achat direct si l'annonce est toujours valide.
- "Mur du village" : messages courts, non modérables individuellement par le joueur, à cadrer côté modération/anti-abus avant développement (question technique, hors scope de ce document).
- Toute transaction est différée : le vendeur reçoit son gain à sa prochaine connexion.

## 10. Notes d'art / audio (non tranchées)

- Style graphique cible : pixel art coloré, cohérent avec les autres jeux de l'arcade (à valider avec des exemples visuels avant production).
- Musique/ambiance : à définir (générateur audio type outils déjà accessibles dans l'environnement Cowork, ou composition dédiée).
- Production d'assets : question ouverte listée dans `PRD.md` §9.
