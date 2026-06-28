import { JSONFilePreset } from 'lowdb/node';

// --- STANDARD: ONE SOURCE OF TRUTH ---
// Voir documentation/architecture_standard.md

// L'unité atomique du système est une "GameRelease" (Version Jouable).
// La DB stocke une liste plate de ces releases.
export interface GameRelease {
  id: string;           // ID Unique Composite : "{gameName}-{versionName}" (ex: snake-v1)
  name: string;         // Nom d'affichage du projet (ex: Snake)
  version: string;      // Nom de la version (ex: v1)
  path: string;         // Chemin relatif du launcher (ex: snake/v1)

  description?: string;
  thumbnail?: string;
  createdAt?: string;
}

// Alias pour compatibilité existante, mais déprécié mentalement
export type GameMetadata = GameRelease;

export interface Score {
  gameId: string;       // Doit correspondre à GameRelease.id
  playerName: string;
  score: number;
  date: string;
  userId?: string;      // Supabase UUID
  userEmail?: string;
}

// Structure générique pour sauvegarder l'état complet d'un jeu
export interface GameSave {
  gameId: string;       // ID du jeu (ex: elsass-farm-v1)
  userId: string;       // ID du joueur (Supabase)
  updatedAt: string;    // Date de dernière save
  data: any;            // Payload JSON libre (inventaire, positions, etc.)
}

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface DatabaseData {
  games: GameRelease[];
  scores: Score[];
  saves: GameSave[];
  users: LocalUser[];
}

const defaultData: DatabaseData = {
  games: [],
  scores: [],
  saves: [],
  users: [
    {
      id: '75ed45e6-9aed-442c-a958-4ecb630272a4',
      email: 'admin@local.com',
      name: 'Administrateur Local',
      role: 'admin',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: '2815af9b-5e75-4884-a841-53cf39ea6080',
      email: 'joueur@local.com',
      name: 'Joueur Local',
      role: 'user',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ]
};

// Singleton pour la connexion DB
export const getDb = async () => {
  const db = await JSONFilePreset<DatabaseData>('data/db.json', defaultData);
  
  // Garantir l'initialisation et l'écriture des profils par défaut s'ils manquent dans le fichier physique
  await db.read();
  if (!db.data.users || db.data.users.length === 0) {
    db.data.users = [...defaultData.users];
    await db.write();
  }
  
  return db;
};