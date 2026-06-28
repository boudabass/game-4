import { NextResponse } from 'next/server';
import { getDb } from '@/lib/database';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET /api/scores?gameId=tetris-v1
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
  }

  const db = await getDb();
  await db.read();

  const scores = db.data.scores
    .filter((s) => s.gameId === gameId)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Top 10

  return NextResponse.json(scores);
}

// POST /api/scores
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, playerName, score } = body;

    if (!gameId || score === undefined) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // --- COOKIE SESSION LOCAL ---
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('arcade_session')?.value;
    let user = null;

    if (sessionCookie) {
      try {
        user = JSON.parse(sessionCookie);
      } catch (e) {}
    }

    let finalPlayerName = playerName || 'Anonyme';
    let userId = undefined;
    let userEmail = undefined;

    if (user) {
      finalPlayerName = user.name || user.email?.split('@')[0] || 'Joueur';
      userId = user.id;
      userEmail = user.email;
    }

    const db = await getDb();
    await db.update(({ scores }) => scores.push({
      gameId,
      playerName: finalPlayerName,
      score: Number(score),
      date: new Date().toISOString(),
      userId,
      userEmail
    }));

    return NextResponse.json({ success: true, user: user?.email });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}