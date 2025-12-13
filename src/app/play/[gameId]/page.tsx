import { getGame } from "@/app/actions/get-game";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GamePlayer } from "@/components/game-player";

interface PlayPageProps {
  params: Promise<{ gameId: string }>;
}

export default async function PlayPage(props: PlayPageProps) {
  const params = await props.params;
  const game = await getGame(params.gameId);

  if (!game) {
    notFound();
  }

  // Le chemin stocké dans la DB est relatif à /public/games
  const gameUrl = `/games/${game.path}/index.html`;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* En-tête de navigation sécurisante */}
      <header className="bg-white p-4 shadow-md z-10 flex items-center justify-between">
        <Button 
          asChild 
          variant="destructive" 
          size="lg" 
          className="text-lg font-bold px-8 h-14"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-6 w-6" />
            QUITTER LE JEU
          </Link>
        </Button>

        <h1 className="text-2xl font-bold text-slate-800 hidden md:block">
          {game.name}
        </h1>
        
        {/* Placeholder pour équilibrer le header */}
        <div className="w-[140px] hidden md:block"></div>
      </header>

      {/* Zone de jeu */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        
        <GamePlayer 
            gameUrl={gameUrl} 
            gameName={game.name} 
            width={game.width} 
            height={game.height}
        />
        
        <p className="text-slate-400 mt-4 text-center max-w-lg">
          {game.description}
        </p>
      </main>
    </div>
  );
}