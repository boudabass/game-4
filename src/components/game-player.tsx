"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";

interface GamePlayerProps {
  gameUrl: string;
  gameName: string;
}

export function GamePlayer({ gameUrl, gameName }: GamePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Fonction appelée quand l'iframe a fini de charger (succès ou 404)
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Note: Les iframes ne déclenchent pas facilement onError pour des 404 (c'est considéré comme chargé).
  // Mais on gère l'état de chargement visuel ici.

  return (
    <div className="w-full max-w-[1200px] aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700 relative">
      
      {/* État de Chargement */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900 z-10">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
          <p className="text-xl font-medium animate-pulse">Lancement de {gameName}...</p>
        </div>
      )}

      {/* Iframe */}
      <iframe
        src={gameUrl}
        onLoad={handleLoad}
        className="w-full h-full border-0 relative z-0"
        allow="autoplay; fullscreen; gamepad"
        title={`Jeu ${gameName}`}
      />
      
      {/* Note pour le dev (toi) : Si ça reste noir après chargement, c'est que index.html manque */}
    </div>
  );
}