Game Loop — Cycle Journalier Complet
Ce document unifie tous les systèmes en une boucle journalière cohérente, reproductible et optimisée mobile.
Durée réelle : 16 min/jour jeu (1 min = 1 h).

🌅 JOUR TYPE (Réveil → Sommeil)
text
6h00  🏠 MAISON → Réveil (énergie 100%) + Auto-save
     ↓
6h-8h 🌾 FERME_NORD → Arroser 40 tiles (énergie -80) 
     ↓
8h-12h 🏙️ VILLE → Vente loot Marcel (+💰) + achat graines
     ↓
12h-16h ⛏️ MINE → 2-3 étages (énigmes + minerais)
     ↓
16h-18h 🏭 FERME_SUD → Lancer crafts (Ingot, potions)
     ↓
18h-20h 🏙️ VILLE → Mairie (stats) + préparation nuit
     ↓
20h-2h  🍺 TAVERNE → Quête Romain + repos (+20 énergie -15💰)
     ↓
2h     🛌 SOMMEIL → +8h temps / Save globale / Cultures +1 jour
⚙️ ÉTATS PAR PHASE
Heure	Énergie restante	Actions prioritaires	Systèmes actifs
6h	100	Farm urgent	Farming Nord
12h	40	Vente + Mine	City + Mine
18h	20	Craft + stats	Ferme Sud + Mairie
20h	15	Quête sociale	Taverne + Quêtes
2h	0-10	Repos obligatoire	Save + TimeSystem
🔄 MISE À JOUR NOCTURNE (2h → 6h)
Automatique, invisible au joueur :

Farming : tiles arrosées → growthDay++

Machines : crafts 1j/2j → loot [🧺]

Quêtes : expiration journalières

Événements : check jour 28

Save : snapshot complet

🎯 OBJECTIFS JOURNALIERS
Jour	Focus	Or cible	Énergie utilisée
J1-7	Farm de base	+200💰	90/100
J8-14	Mine + craft	+400💰	85/100
J15-21	Optimisation	+600💰	70/100
J28	Événement saison	+1000💰	50/100
✅ Règles absolues Game Loop v1.0
✅ 16 min réelles = 1 jour jeu complet

✅ Fatigue naturelle (0 énergie → sommeil forcé maison)

✅ +8h par lit (tous lieux)

✅ Auto-processing nocturne (cultures, crafts, quêtes)

✅ Boucle économique : Farm → Loot → Vente → Craft → Farm

❌ Pas de grind infini (énergie limitée)