"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="relative h-screen bg-slate-950 text-white selection:bg-indigo-500/30 flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 z-0"></div>

      {/* Bouton connexion / dashboard, en haut à droite */}
      <div className="absolute top-6 right-6 z-10">
        {!isLoading && user ? (
          <Link href="/dashboard">
            <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg shadow-indigo-500/20">
              <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="outline" className="border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all">
              Connexion
            </Button>
          </Link>
        )}
      </div>

      <div className="relative z-10 text-center space-y-6 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
          L'Arcade de{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-400">
            The Elsassisch
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Des jeux créés de toutes pièces par The Elsassisch, pour sa communauté.
        </p>
        <div className="pt-6">
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all transform hover:scale-105">
                Lancer l'Arcade <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all transform hover:scale-105">
                Commencer maintenant <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
