import { notFound } from 'next/navigation';
import { GamePlayer } from '@/components/game-player';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { odooClient } from "@/lib/odoo";
import { cookies } from "next/headers";

export default async function PlayPage({ params }: { params: Promise<{ gameId: string }> }) {
    const { gameId } = await params;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('arcade_session')?.value;
    const userCookie = cookieStore.get('arcade_user')?.value;
    
    let game = null;
    let user = null;

    if (userCookie) {
        try {
            user = JSON.parse(userCookie);
        } catch(e) {}
    }

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

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="bg-slate-900 border-b border-slate-800 text-white p-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/games">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                        </Button>
                    </Link>
                    <h1 className="font-bold text-lg">{game.x_name}</h1>
                </div>
            </div>
            
            <div className="flex-grow bg-black relative">
                <GamePlayer
                  gameName={game.x_name}
                  gameUrl={game.x_studio_url || `/games/unknown/index.html`}
                />
            </div>
        </div>
    );
}