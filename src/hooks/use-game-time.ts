"use client";

import { useState, useEffect, useCallback } from 'react';

// Constants based on Config (hardcoded for now, will be dynamic later)
const REAL_MINUTE_PER_HOUR = 1; // 1 real minute = 1 game hour
const START_HOUR = 6;
const MAX_HOUR = 26; // 2 AM the next day (24 + 2)
const DAYS_PER_SEASON = 28;
const SEASONS = ['Printemps', 'Été', 'Automne', 'Hiver'];

export interface GameTime {
    day: number;
    hour: number;
    minute: number;
    season: string;
    isNight: boolean;
}

export function useGameTime() {
    const [day, setDay] = useState(1);
    const [hour, setHour] = useState(START_HOUR);
    const [minute, setMinute] = useState(0);
    const [seasonIndex, setSeasonIndex] = useState(0);

    // Real milliseconds per game minute
    // 1 real minute = 60,000 ms
    // 1 game hour = 60 game minutes
    // 1 game minute = (60000 ms * REAL_MINUTE_PER_HOUR) / 60
    const MS_PER_GAME_MINUTE = (60000 * REAL_MINUTE_PER_HOUR) / 60;

    const advanceTime = useCallback(() => {
        setMinute(prevMinute => {
            let newMinute = prevMinute + 1;
            let newHour = hour;
            let newDay = day;
            let newSeasonIndex = seasonIndex;

            if (newMinute >= 60) {
                newMinute = 0;
                newHour = hour + 1;
            }

            // Handle day transition (2 AM = 26:00)
            if (newHour >= MAX_HOUR) {
                newHour = START_HOUR;
                newDay = day + 1;
                
                // Handle season transition (Day 28 -> Day 1)
                if (newDay > DAYS_PER_SEASON) {
                    newDay = 1;
                    newSeasonIndex = (seasonIndex + 1) % SEASONS.length;
                }
            }

            setHour(newHour);
            setDay(newDay);
            setSeasonIndex(newSeasonIndex);
            return newMinute;
        });
    }, [hour, day, seasonIndex]);

    useEffect(() => {
        // Start the timer only if the game is active (later controlled by state)
        const interval = setInterval(advanceTime, MS_PER_GAME_MINUTE);

        return () => clearInterval(interval);
    }, [advanceTime, MS_PER_GAME_MINUTE]);

    const currentHourDisplay = hour % 24;
    const isNight = currentHourDisplay >= 20 || currentHourDisplay < 6;

    return {
        day,
        hour: currentHourDisplay,
        minute,
        season: SEASONS[seasonIndex],
        isNight,
        timeDisplay: `${String(currentHourDisplay).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        // Placeholder for future actions
        advanceTime,
    };
}