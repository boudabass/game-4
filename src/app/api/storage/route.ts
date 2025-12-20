import { NextResponse } from 'next/server';
import { getDb } from '@/lib/database';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/storage?gameId=xxx
// Récupère la sauvegarde du joueur connecté pour ce jeu
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
  }

  // 1. Auth Check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. DB Read
  const db = await getDb();
  await db.read();

  // 3. Find Save
  const save = db.data.saves.find(s => s.gameId === gameId && s.userId === user.id);

  if (!save) {
    return NextResponse.json({ data: null }); // Pas de sauvegarde existante, c'est valide
  }

  return NextResponse.json({ data: save.data, updatedAt: save.updatedAt });
}

// POST /api/storage
// Écrase la sauvegarde du joueur pour ce jeu
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, data } = body;

    if (!gameId || !data) {
      return NextResponse.json({ error: 'Missing gameId or data' }, { status: 400 });
    }

    // 1. Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    
    // 2. Upsert Logic (Update or Insert)
    await db.update(({ saves }) => {
      const existingIndex = saves.findIndex(s => s.gameId === gameId && s.userId === user.id);
      
      const newSaveEntry = {
        gameId,
        userId: user.id,
        updatedAt: new Date().toISOString(),
        data: data
      };

      if (existingIndex >= 0) {
        // Update
        saves[existingIndex] = newSaveEntry;
      } else {
        // Insert
        saves.push(newSaveEntry);
      }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}