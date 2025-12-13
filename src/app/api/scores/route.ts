import { NextResponse } from 'next/server';
import { getDb, Score } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    const db = await getDb();
    let scores = db.data.scores;

    // Filtrer par jeu si gameId est fourni
    if (gameId) {
      scores = scores.filter((s) => s.gameId === gameId);
    }

    // Trier par score décroissant (optionnel mais logique pour un game center)
    scores.sort((a, b) => b.score - a.score);

    return NextResponse.json(scores);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, score, playerName } = body;

    if (!gameId || score === undefined || !playerName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();

    const newScore: Score = {
      id: crypto.randomUUID(),
      gameId,
      score: Number(score),
      playerName,
      date: new Date().toISOString(),
    };

    db.data.scores.push(newScore);
    await db.write();

    return NextResponse.json(newScore, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 });
  }
}