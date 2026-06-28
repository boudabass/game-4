import { NextResponse } from "next/server";
import { odooClient } from "@/lib/odoo";
import { getSessionCookie } from "@/app/actions/auth";

export async function GET() {
  try {
    const sessionId = await getSessionCookie();
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Attempt to fetch from Odoo, return empty array if it fails/unconfigured
    try {
      const games = await odooClient.callKw(
        "x_game_release",
        "search_read",
        [[]], // domain
        { fields: ["id", "x_name", "x_description", "x_url"] }, // kwargs
        sessionId
      );
      return NextResponse.json({ games });
    } catch (e) {
      console.warn("Odoo fetch failed, returning empty games array:", e);
      return NextResponse.json({ games: [] });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
