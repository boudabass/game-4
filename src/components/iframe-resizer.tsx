"use client";

import { useEffect } from "react";

export function IframeResizer() {
  useEffect(() => {
    // Si nous ne sommes pas dans le navigateur ou pas dans une iframe, on ignore
    if (typeof window === "undefined" || window === window.parent) return;

    const sendHeight = () => {
      // On calcule la hauteur totale du contenu
      const height = document.documentElement.scrollHeight;
      // On envoie le message à Odoo
      window.parent.postMessage({ type: "ARCADE_RESIZE", height: height }, "*");
    };

    // Envoyer la hauteur au chargement initial
    sendHeight();

    // Observer les changements de taille (quand on ouvre un menu, navigue, etc.)
    const observer = new ResizeObserver(() => {
      sendHeight();
    });

    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  return null; // Ce composant est totalement invisible
}