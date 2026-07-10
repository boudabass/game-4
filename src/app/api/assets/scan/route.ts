import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/actions/auth";
import { promises as fs } from "fs";
import path from "path";

// Liste l'arborescence réelle des packs d'assets, côté serveur.
// Utilisé par le jeu-outil "assets-test" : le navigateur ne peut pas
// lister un dossier, le serveur si. Toujours à jour après un tri manuel.
const ROOT = path.join(process.cwd(), "public", "games", "system", "assets", "Assets_pack");
const MAX_FILES = 20000;
const MAX_DEPTH = 6;

type FileEntry = { p: string; s: number };

async function walk(dir: string, rel: string, depth: number, out: FileEntry[]) {
  if (depth > MAX_DEPTH || out.length >= MAX_FILES) return;
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return; // dossier illisible : on l'ignore
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const e of entries) {
    if (e.name.startsWith(".") || e.name.startsWith("_")) continue; // _rejetes etc. : hors scan
    const abs = path.join(dir, e.name);
    const r = rel ? rel + "/" + e.name : e.name;
    if (e.isDirectory()) {
      await walk(abs, r, depth + 1, out);
    } else if (e.isFile()) {
      if (out.length >= MAX_FILES) return;
      let size = 0;
      try { size = (await fs.stat(abs)).size; } catch { /* ignore */ }
      out.push({ p: r, s: size });
    }
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let packDirs;
    try {
      packDirs = await fs.readdir(ROOT, { withFileTypes: true });
    } catch {
      return NextResponse.json({ error: "Assets_pack introuvable" }, { status: 404 });
    }

    const packs = [];
    for (const d of packDirs) {
      if (!d.isDirectory() || d.name.startsWith(".") || d.name.startsWith("_")) continue;
      const files: FileEntry[] = [];
      await walk(path.join(ROOT, d.name), "", 0, files);
      packs.push({ name: d.name, files });
    }
    packs.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ root: "/games/system/assets/Assets_pack", packs });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
