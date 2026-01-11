import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type ResponseData = {
    success: boolean;
    message: string;
    path?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    // Seulement POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { folder, file, data } = req.body;

        if (!folder || !file || !data) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: folder, file, data'
            });
        }

        // Mapping des folders vers les chemins réels
        const folderPaths: Record<string, string> = {
            'ground': 'public/games/system/assets/ground',
            'house': 'public/games/system/assets/house',
            'decor': 'public/games/system/assets/decor',
            'box': 'public/games/system/assets/box',
            'tent': 'public/games/system/assets/tent',
            'tiled': 'public/games/system/assets/Tiled_files'
        };

        const targetFolder = folderPaths[folder];
        if (!targetFolder) {
            return res.status(400).json({
                success: false,
                message: `Unknown folder: ${folder}`
            });
        }

        // Construire le chemin du fichier JSON (même nom que l'image)
        const jsonFileName = file.replace('.png', '.json').replace('.jpg', '.json');
        const filePath = path.join(process.cwd(), targetFolder, jsonFileName);

        // Écrire le fichier
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

        console.log(`✅ Texture definition saved: ${filePath}`);

        return res.status(200).json({
            success: true,
            message: 'Définition sauvegardée avec succès',
            path: filePath
        });

    } catch (error) {
        console.error('❌ Error saving texture definition:', error);
        return res.status(500).json({
            success: false,
            message: `Erreur: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
}
