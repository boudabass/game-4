'use server';

import fs from 'fs/promises';
import path from 'path';
import { readdir } from 'fs/promises';

const GAMES_DIR = path.join(process.cwd(), 'public', 'games');

// S'assurer que le dossier games existe
async function ensureGamesDir() {
  try {
    await fs.access(GAMES_DIR);
  } catch {
    await fs.mkdir(GAMES_DIR, { recursive: true });
  }
}

export interface GameFolder {
  name: string;
  versions: string[];
}

export async function listGames(): Promise<GameFolder[]> {
  await ensureGamesDir();
  const entries = await readdir(GAMES_DIR, { withFileTypes: true });
  const gameFolders: GameFolder[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const gamePath = path.join(GAMES_DIR, entry.name);
      const versionEntries = await readdir(gamePath, { withFileTypes: true });
      const versions = versionEntries
        .filter(v => v.isDirectory())
        .map(v => v.name);
      
      gameFolders.push({
        name: entry.name,
        versions: versions.sort().reverse() // Versions récentes en premier
      });
    }
  }
  return gameFolders;
}

export async function createGameFolder(gameName: string) {
  const safeName = gameName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const dirPath = path.join(GAMES_DIR, safeName, 'v1');
  await fs.mkdir(dirPath, { recursive: true });
  return { success: true, gameName: safeName, version: 'v1' };
}

export async function createGameVersion(gameName: string, versionName: string) {
  const safeVersion = versionName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const dirPath = path.join(GAMES_DIR, gameName, safeVersion);
  
  // Vérifier si ça existe déjà pour ne pas écraser
  try {
    await fs.access(dirPath);
    return { success: false, error: "Cette version existe déjà." };
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    return { success: true, gameName, version: safeVersion };
  }
}

export async function uploadGameFile(gameName: string, version: string, formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return { success: false, error: "Pas de fichier fourni" };

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Sécurisation basique du chemin
  const safeName = gameName.replace(/[^a-z0-9-]/g, '-');
  const safeVersion = version.replace(/[^a-z0-9-]/g, '-');
  const filePath = path.join(GAMES_DIR, safeName, safeVersion, file.name);

  await fs.writeFile(filePath, buffer);
  return { success: true, fileName: file.name };
}

// Générateur automatique de index.html si besoin
export async function generateIndexHtml(gameName: string, version: string, config: any) {
  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${gameName}</title>
    <style>
        body { margin: 0; overflow: hidden; background: ${config.bgColor || '#000'}; }
        canvas { display: block; }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/addons/p5.sound.min.js"></script>
</head>
<body>
    <script>
        // INJECTION CONFIGURATION
        window.gameConfig = ${JSON.stringify(config)};
        localStorage.setItem('gameConfig_${gameName}', JSON.stringify(window.gameConfig));
    </script>
    
    <!-- Scripts du jeu -->
    <script src="data.js"></script>
    <script src="hud.js"></script>
    <script src="sketch.js"></script>
</body>
</html>`;

  const safeName = gameName.replace(/[^a-z0-9-]/g, '-');
  const safeVersion = version.replace(/[^a-z0-9-]/g, '-');
  const filePath = path.join(GAMES_DIR, safeName, safeVersion, 'index.html');
  
  await fs.writeFile(filePath, htmlContent);
  return { success: true };
}