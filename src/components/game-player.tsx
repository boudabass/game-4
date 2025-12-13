"use client";

import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";

interface GamePlayerProps {
  gameUrl: string;
  gameName: string;
  width?: number;
  height?: number;
}

export function GamePlayer({ gameUrl, gameName, width = 800, height = 600 }: GamePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = () => {
    setIsLoading(false);
    // Tente de donner le focus au jeu immédiatement
    focusGame();
  };

  const focusGame = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
    }
  };

  // Calcul du ratio pour l'aspect CSS
  const aspectRatio = width / height;

  return (
    <div className="flex justify-center w-full">
        <div 
          className="w-full max-w-[1200px] bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700 relative group"
          style={{ aspectRatio: `${aspectRatio}` }}
          onClick={focusGame} 
        >
          
          {/* État de Chargement */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900 z-20">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
              <p className="text-xl font-medium animate-pulse">Lancement de {gameName}...</p>
            </div>
          )}

          {/* Iframe */}
          <iframe
            ref={iframeRef}
            src={gameUrl}
            onLoad={handleLoad}
            className="w-full h-full border-0 relative z-0 block"
            // Permissions étendues
            allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope; microphone; camera; midi"
            title={`Jeu ${gameName}`}
          />
        </div>
    </div>
  );
}