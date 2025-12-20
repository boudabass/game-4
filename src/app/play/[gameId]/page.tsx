import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getDb } from "@/lib/database"
import { GameProvider } from '@/systems/game-provider'
import { GameHUD } from '@/components/game-hud'

export default async function PlayPage({ params }: { params: Promise<{ gameId: string }> }) {
  // 1. Auth Check (Server Side)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // 2. Unwrap Params and Fetch Data
  const { gameId } = await params
  const db = await getDb()
  const game = db.data.games.find(g => g.id === gameId)

  if (!game) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-4">
        <h1 className="text-2xl font-bold">Jeu introuvable</h1>
        <Link href="/games">
          <Button>Retour au catalogue</Button>
        </Link>
      </div>
    );
  }

  return (
    <GameProvider>
      <div className="flex flex-col min-h-screen bg-slate-950 relative">
        {/* Game Canvas (Iframe) */}
        <div className="flex-1 w-full h-full relative bg-black">
          <iframe
            src={`/games/${game.path}/index.html`}
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            allow="autoplay; gamepad; fullscreen" // Important for games
          />
        </div>
        
        {/* Game HUD (React Overlay) */}
        <GameHUD />
      </div>
    </GameProvider>
  );
}