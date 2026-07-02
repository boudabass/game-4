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
      // Lecture avec la session du client (le groupe Portail a un accès en lecture).
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

    const body = await request.json();
    const { gameId, score } = body;

    const gameIdInt = parseInt(gameId, 10);
    if (Number.isNaN(gameIdInt)) {
      return NextResponse.json({ error: "gameId invalide" }, { status: 400 });
    }

    const values: Record<string, unknown> = {
      x_name: "Score " + score,
      x_studio_game: gameIdInt,
      x_studio_score: score,
    };
    // Attribue le score au client (aussi utilise par la regle d'enregistrement).
    if (uid) values.x_studio_user = uid;

    try {
      const result = await odooClient.callKw(
        "x_game_score",
        "create",
        [[values]],
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
