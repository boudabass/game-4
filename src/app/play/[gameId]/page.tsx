import { notFound } from 'next/navigation';
import { GameShell } from '@/components/game-shell';
import { odooClient } from "@/lib/odoo";
import { cookies } from "next/headers";

// Injecte l'ID numérique de la release Odoo dans l'URL de l'iframe (?gid=).
// C'est ce que system.js lit comme source de verite pour scores et sauvegardes.
function buildGameUrl(rawUrl: string | undefined | false, releaseId: number | string): string {
    const base = rawUrl || `/games/unknown/index.html`;
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}gid=${releaseId}`;
}

export default async function PlayPage({ params }: { params: Promise<{ gameId: string }> }) {
    const { gameId } = await params;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('arcade_session')?.value;

    let game = null;

    try {
        if (sessionId) {
            const games = await odooClient.callKw(
                "x_game_release",
                "search_read",
                [[["id", "=", parseInt(gameId, 10)]]],
                { fields: ["id", "x_name", "x_studio_url"] },
                sessionId
            );
            if (games && games.length > 0) {
                game = games[0];
            }
        }
    } catch (e) {
        console.error(e);
    }

    if (!game) {
        notFound();
    }

    // h-[100dvh] : la page de jeu occupe toute la hauteur visible
    // (dans l'iframe Odoo, c'est toute la hauteur de l'iframe).
    return (
        <div className="h-[100dvh]">
            <GameShell
                gameName={game.x_name}
                gameUrl={buildGameUrl(game.x_studio_url, game.id)}
            />
        </div>
    );
}
