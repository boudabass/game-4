"use client";

import { useGame } from '@/systems/game-provider';
import { cn } from '@/lib/utils';
import { Zap, Coins, Clock, Menu, Map, Package, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Component pour la barre supérieure (Stats Vitales)
function TopBar() {
    const { time, energy, gold, openModal } = useGame();
    
    // Affichage de l'heure (24h format)
    const displayHour = time.hour % 24;
    const timeColor = time.isNight ? 'text-indigo-300' : 'text-yellow-400';
    const energyColor = energy > 50 ? 'bg-green-500' : energy > 20 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="flex justify-between items-center p-2 bg-slate-900/80 backdrop-blur-sm border-b border-white/10 shadow-lg text-white h-16">
            {/* GAUCHE: Stats Vitales */}
            <div className="flex items-center space-x-4">
                {/* Énergie */}
                <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg min-w-[150px]">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <div className="flex-1">
                        <span className="text-xs font-medium">Énergie: {energy}%</span>
                        <Progress value={energy} className="h-2" indicatorClassName={energyColor} />
                    </div>
                </div>
                
                {/* Or */}
                <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-lg">{gold}</span>
                </div>
            </div>

            {/* CENTRE: Temps & Saison */}
            <div className="text-center">
                <div className={cn("text-2xl font-black tracking-tight", timeColor)}>
                    <Clock className="inline w-5 h-5 mr-2" />
                    {time.timeDisplay}
                </div>
                <div className="text-sm text-slate-300">
                    Jour {time.day} | {time.season}
                </div>
            </div>

            {/* DROITE: Boutons d'Action */}
            <div className="flex items-center space-x-2">
                <Button 
                    size="icon" 
                    variant="secondary" 
                    className="bg-slate-700/50 hover:bg-slate-600/80 text-white"
                    onClick={() => openModal('inventory')}
                >
                    <Package className="w-5 h-5" />
                </Button>
                <Button 
                    size="icon" 
                    variant="secondary" 
                    className="bg-slate-700/50 hover:bg-slate-600/80 text-white"
                    onClick={() => openModal('map')}
                >
                    <Map className="w-5 h-5" />
                </Button>
                <Button 
                    size="icon" 
                    variant="secondary" 
                    className="bg-slate-700/50 hover:bg-slate-600/80 text-white"
                    onClick={() => openModal('menu')}
                >
                    <Menu className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}

// Component pour les slots d'action (Bas Gauche: Graines, Bas Droit: Outils)
function BottomSlots() {
    // Placeholder pour les slots d'inventaire
    const slots = Array(16).fill(null); // 16 slots graines
    const tools = Array(6).fill(null); // 6 slots outils

    return (
        <div className="flex justify-between w-full p-4">
            {/* BAS GAUCHE: Graines (16 slots fixes) */}
            <div className="grid grid-cols-4 gap-1 p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg border border-white/10 shadow-xl">
                {slots.map((_, index) => (
                    <div key={`seed-${index}`} className="w-10 h-10 bg-slate-700/50 rounded flex items-center justify-center border border-slate-600 hover:border-yellow-400 transition-colors cursor-pointer">
                        {/* Placeholder icône graine */}
                        <Leaf className="w-5 h-5 text-green-400/50" />
                    </div>
                ))}
            </div>

            {/* BAS DROIT: Outils (6 slots fixes) */}
            <div className="grid grid-cols-3 gap-1 p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg border border-white/10 shadow-xl">
                {tools.map((_, index) => (
                    <div key={`tool-${index}`} className="w-10 h-10 bg-slate-700/50 rounded flex items-center justify-center border border-slate-600 hover:border-blue-400 transition-colors cursor-pointer">
                        {/* Placeholder icône outil */}
                        <Zap className="w-5 h-5 text-blue-400/50" />
                    </div>
                ))}
            </div>
        </div>
    );
}


export function GameHUD() {
    const { isModalOpen } = useGame();
    
    // Le HUD doit s'auto-cacher après 4s sans action (documentation/ferme/hub_permanent.md)
    // Pour l'instant, on le laisse visible.

    return (
        <div className={cn(
            "absolute inset-0 pointer-events-none z-50 transition-opacity duration-300",
            isModalOpen ? 'opacity-50' : 'opacity-100' // Griser légèrement si un modal est ouvert
        )}>
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 pointer-events-auto">
                <TopBar />
            </div>

            {/* Bottom Slots */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
                <BottomSlots />
            </div>
        </div>
    );
}