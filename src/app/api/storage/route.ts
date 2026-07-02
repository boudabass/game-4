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

    if (!gameId) {
      return NextResponse.json({ error: "gameId is required" }, { status: 400 });
    }

    try {
      const saves = await odooClient.callKw(
        "x_game_save",
        "search_read",
        [[["x_studio_game", "=", parseInt(gameId, 10)]]],
        { fields: ["id", "x_studio_data", "write_date"], limit: 1, order: "write_date desc" },
        sessionId
      );
      return NextResponse.json({ data: saves.length > 0 ? saves[0].x_studio_data : null });
    } catch (e) {
      console.warn("Odoo fetch failed, returning empty storage:", e);
      return NextResponse.json({ data: null });
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
    const { gameId, data } = body;

    const gameIdInt = parseInt(gameId, 10);
    if (Number.isNaN(gameIdInt)) {
      return NextResponse.json({ error: "gameId invalide" }, { status: 400 });
    }

    try {
      const existing = await odooClient.callKw(
        "x_game_save",
        "search",
        [[["x_studio_game", "=", gameIdInt]]],
        { limit: 1 },
        sessionId
      );

      if (existing && existing.length > 0) {
        await odooClient.callKw(
          "x_game_save",
          "write",
          [existing, { x_studio_data: JSON.stringify(data) }],
          {},
          sessionId
        );
        return NextResponse.json({ success: true, updated: true });
      } else {
        await odooClient.callKw(
          "x_game_save",
          "create",
          // x_name est OBLIGATOIRE sur ce modele Odoo -> on le fournit toujours.
          [[{ x_name: "Save " + gameIdInt, x_studio_game: gameIdInt, x_studio_data: JSON.stringify(data) }]],
          {},
          sessionId
        );
        return NextResponse.json({ success: true, created: true });
      }
    } catch (e) {
      console.error("Failed to post storage to Odoo:", e);
      return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
