"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface GamePlayerProps {
  gameUrl: string;
  gameName: string;
  width?: number;
  height?: number;
}

export function GamePlayer({ gameUrl, gameName, width = 800, height = 600 }: GamePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fonction de calcul de l'échelle
  const updateScale = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      // On calcule le ratio entre la largeur disponible et la largeur native du jeu
      const newScale = containerWidth / width;
      // On limite l'échelle à 1 maximum pour ne pas pixelliser sur les très grands écrans
      // (Optionnel : retirer Math.min si on veut que ça grossisse à l'infini)
      setScale(Math.min(newScale, 1.5)); 
    }
  };

  useEffect(() => {
    // Calcul initial
    updateScale();
    
    // Recalcul au redimensionnement
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [width]);

  const handleLoad = () => {
    setIsLoading(false);
    focusGame();
  };

  const focusGame = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Conteneur Parent qui définit la largeur disponible */}
      <div 
        ref={containerRef} 
        className="w-full max-w-[1200px] relative"
        // La hauteur du conteneur doit s'adapter à la hauteur mise à l'échelle de l'iframe
        style={{ height: height * scale }}
      >
        {/* Loader */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900 z-20 rounded-xl h-full">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
            <p className="text-xl font-medium animate-pulse">Lancement de {gameName}...</p>
          </div>
        )}

        {/* Zone de transformation */}
        <div
          className="origin-top-left absolute top-0 left-0 overflow-hidden rounded-xl shadow-2xl border-4 border-slate-700 bg-black"
          style={{
            width: width,   // Largeur RÉELLE du jeu
            height: height, // Hauteur RÉELLE du jeu
            transform: `scale(${scale})`, // Magie : on met à l'échelle le tout
          }}
          onClick={focusGame}
        >
          <iframe
            ref={iframeRef}
            src={gameUrl}
            onLoad={handleLoad}
            width={width}
            height={height}
            className="border-0 block overflow-hidden"
            // Permissions étendues
            allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope; microphone; camera; midi"
            title={`Jeu ${gameName}`}
            // Force le scrolling à non pour éviter les barres dans l'iframe
            scrolling="no"
          />
        </div>
      </div>
      
      {/* Info debug (utile pour vérifier si la résolution est bien prise en compte) */}
      <p className="text-xs text-slate-500 mt-2 opacity-50">
        Résolution native : {width}x{height} | Échelle : {Math.round(scale * 100)}%
      </p>
    </div>
  );
}