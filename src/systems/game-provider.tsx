"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useGameTime, GameTime } from '@/hooks/use-game-time';

interface GameState {
    time: GameTime;
    energy: number;
    gold: number;
    
    // Actions
    consumeEnergy: (amount: number) => boolean;
    addGold: (amount: number) => void;
    // Placeholder for future inventory/modal state
    isModalOpen: boolean;
    openModal: (type: string) => void;
    closeModal: () => void;
}

const GameContext = createContext<GameState | undefined>(undefined);

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

export function GameProvider({ children }: { children: React.ReactNode }) {
    const time = useGameTime();
    const [energy, setEnergy] = useState(100); // Max 100
    const [gold, setGold] = useState(50); // Starting gold
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Reset energy at 6 AM (start of day)
    React.useEffect(() => {
        if (time.hour === 6 && time.minute === 0) {
            setEnergy(100);
        }
    }, [time.hour, time.minute]);

    const consumeEnergy = useCallback((amount: number): boolean => {
        let success = false;
        setEnergy(prevEnergy => {
            const newEnergy = prevEnergy - amount;
            if (newEnergy < 0) {
                // Trigger fatigue/sleep logic later
                success = false;
                return prevEnergy;
            }
            success = true;
            return newEnergy;
        });
        return success;
    }, []);

    const addGold = useCallback((amount: number) => {
        setGold(prevGold => prevGold + amount);
    }, []);

    const openModal = useCallback((type: string) => {
        // Logic to open specific modal type later
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const state: GameState = {
        time,
        energy,
        gold,
        consumeEnergy,
        addGold,
        isModalOpen,
        openModal,
        closeModal
    };

    return (
        <GameContext.Provider value={state}>
            {children}
        </GameContext.Provider>
    );
}