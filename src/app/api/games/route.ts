import { NextResponse } from 'next/server';
import { getDb, Game } from '@/lib/database';

export async function GET() {
  try {
    const db = await getDb();
    return NextResponse.json(db.data.games);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, path, thumbnail, version } = body;

    // Validation basique
    if (!title || !path || !version) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    
    const newGame: Game = {
      id: crypto.randomUUID(),
      title,
      description: description || '',
      path,
      thumbnail: thumbnail || '',
      version,
      createdAt: new Date().toISOString(),
    };

    db.data.games.push(newGame);
    await db.write();

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}