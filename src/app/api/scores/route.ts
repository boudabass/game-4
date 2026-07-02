import { NextResponse } from "next/server";
import { odooClient } from "@/lib/odoo";
import { getSessionCookie } from "@/app/actions/auth";

export async function GET(request: Request) {
  try {
    const sessionId = await getSessionCookie();
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    let domain = [];
    if (gameId) {
      domain.push(["x_studio_game", "=", parseInt(gameId, 10)]);
    }

    try {
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

    const body = await request.json();
    const { gameId, score } = body;

    // Cohérence : x_studio_game est une relation -> un entier (ID Odoo), jamais un slug.
    const gameIdInt = parseInt(gameId, 10);
    if (Number.isNaN(gameIdInt)) {
      return NextResponse.json({ error: "gameId invalide" }, { status: 400 });
    }

    try {
      const result = await odooClient.callKw(
        "x_game_score",
        "create",
        [[{ x_studio_game: gameIdInt, x_studio_score: score }]],
        {},
        sessionId
      );
      return NextResponse.json({ success: true, id: result[0] });
    } catch (e) {
      console.error("Failed to post score to Odoo:", e);
      return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
