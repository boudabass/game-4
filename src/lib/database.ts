import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import fs from 'fs';

// Interface pour un Jeu
export interface Game {
  id: string;
  title: string;
  description: string;
  path: string; // Chemin relatif (ex: 'games/tetris/v1')
  thumbnail: string;
  version: string;
  createdAt: string;
}

// Interface pour un Score
export interface Score {
  id: string;
  gameId: string;
  score: number;
  playerName: string;
  date: string;
}

// Schéma global de la base de données
interface DbSchema {
  games: Game[];
  scores: Score[];
}

const DB_FILE_NAME = 'db.json';
const DB_DIR_PATH = process.env.DATABASE_DIR || './data';
const DB_FULL_PATH = path.resolve(process.cwd(), DB_DIR_PATH, DB_FILE_NAME);

let dbInstance: Low<DbSchema> | null = null;

/**
 * Initialise et retourne l'instance de la base de données Lowdb.
 */
export async function getDb(): Promise<Low<DbSchema>> {
  if (dbInstance) {
    if (dbInstance.data) {
      return dbInstance;
    }
    await dbInstance.read();
    return dbInstance;
  }

  try {
    // S'assurer que le dossier existe
    const dir = path.dirname(DB_FULL_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const adapter = new JSONFile<DbSchema>(DB_FULL_PATH);
    
    // Initialisation avec des tableaux vides pour games et scores
    dbInstance = new Low<DbSchema>(adapter, { games: [], scores: [] });

    await dbInstance.read();

    console.log(`Database initialized/loaded from: ${DB_FULL_PATH}`);

    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize Lowdb database:', error);
    throw error;
  }
}