import { NextResponse } from "next/server";
import { odooClient } from "@/lib/odoo";
import { getSessionCookie, getSessionUser } from "@/app/actions/auth";

export async function GET(request: Request) {
  try {
    const sessionId = await getSessionCookie();
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    let domain: any[] = [];
    if (gameId) {
      domain.push(["x_studio_game", "=", parseInt(gameId, 10)]);
    }

    try {
      // Classement : une ligne par joueur (meilleur score), lisible par tous.
      const scores = await odooClient.callKw(
        "x_game_score",
        "search_read",
        [domain],
        { fields: ["id", "x_studio_game", "x_studio_user", "x_studio_score", "create_date"], limit: 100, order: "x_studio_score desc" },
        sessionId
      );
      return NextResponse.json({ scores });
    } catch (e) {
      console.warn("Odoo fetch failed, returning empty scores array:", e);
      return NextResponse.json({ scores: [] });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionId = await getSessionCookie();
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getSessionUser();
    const uid = user?.uid;
    if (!uid) {
      return NextResponse.json({ error: "Utilisateur inconnu" }, { status: 401 });
    }

    const body = await request.json();
    const { gameId, score } = body;

    const gameIdInt = parseInt(gameId, 10);
    if (Number.isNaN(gameIdInt)) {
      return NextResponse.json({ error: "gameId invalide" }, { status: 400 });
    }

    try {
      // UPSERT : une seule ligne de score par (jeu, joueur), on garde le MEILLEUR.
      const existing = await odooClient.callKw(
        "x_game_score",
        "search_read",
        [[["x_studio_game", "=", gameIdInt], ["x_studio_user", "=", uid]]],
        { fields: ["id", "x_studio_score"], limit: 1 },
        sessionId
      );

      if (existing && existing.length > 0) {
        const current = existing[0].x_studio_score || 0;
        if (score > current) {
          await odooClient.callKw(
            "x_game_score",
            "write",
            [[existing[0].id], { x_studio_score: score, x_name: "Score " + score }],
            {},
            sessionId
          );
          return NextResponse.json({ success: true, updated: true, best: score });
        }
        // Le nouveau score n'est pas meilleur : on ne crée rien.
        return NextResponse.json({ success: true, updated: false, best: current });
      }

      // Premier score de ce joueur pour ce jeu.
      const result = await odooClient.callKw(
        "x_game_score",
        "create",
        [[{ x_name: "Score " + score, x_studio_game: gameIdInt, x_studio_score: score, x_studio_user: uid }]],
        {},
        sessionId
      );
      return NextResponse.json({ success: true, created: true, id: result[0], best: score });
    } catch (e) {
      console.error("Failed to post score to Odoo:", e);
      return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
