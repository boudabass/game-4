"use client";

import { useEffect } from "react";

export function IframeResizer() {
  useEffect(() => {
    if (typeof window === "undefined" || window === window.parent) return;

    let lastHeight = 0;

    const sendHeight = () => {
      // Mesurer le contenu réel du body
      const height = document.body.offsetHeight;
      
      // Sécurité : Ne redimensionner que si la différence est supérieure à 30 pixels
      // Cela casse les boucles infinies de micro-ajustements
      if (Math.abs(lastHeight - height) > 30) {
        lastHeight = height;
        window.parent.postMessage({ type: "ARCADE_RESIZE", height: height }, "*");
      }
    };

    sendHeight();

    // Utilisation d'un délai (debounce) pour ne pas saturer le navigateur
    let timeoutId: NodeJS.Timeout;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => sendHeight(), 100);
    });

    observer.observe(document.body);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
}