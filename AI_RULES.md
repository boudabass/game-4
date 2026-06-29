# 🤖 AI Development Rules & Source of Truth (Odoo Edition)

This file contains the strict guidelines and architecture rules that the AI and developers must follow. Any code modification or new feature must adhere to these standards.

---

## 1. Core Technology Stack

* **Frontend Framework**: Next.js (App Router)
* **Language**: TypeScript (Next.js App) / JavaScript ES6 (Iframe Games)
* **Styling**: Tailwind CSS
* **Database & Auth**: Direct JSON-RPC connection to Odoo. **No local Lowdb (`db.json`), no Supabase, and no local filesystem DB are allowed.**
* **Game Engine**: p5.js + p5.play v3 (Planck.js) loaded via CDN inside iframes.

---

## 2. Authentication & Session Architecture

All authentication is handled on the server side using the Odoo JSON-RPC API.

### Session Cookies
* **`arcade_session`**: Secure, HttpOnly cookie containing the actual Odoo `session_id`. Used for all server-side RPC calls.
* **`arcade_user`**: Contains basic user metadata (UID, Name, Email) accessible by the client for UI purposes.

### Security Rule
* **Never** store Odoo session IDs or credentials in the browser's `localStorage` or `sessionStorage`.
* Always use Next.js Server Actions or Route Handlers to proxy requests to Odoo. The frontend must never talk directly to Odoo RPC endpoints to avoid CORS issues and credential exposure.

---

## 3. Odoo Custom Models (The Schema)

We interact with three specific models configured in Odoo:

1. **`x_game_release` (The Game Catalog)**
   * Used to query available games.
   * Key fields: `x_name`, `x_studio_description`, `x_studio_url` (e.g., `/games/elsass-farm/v1/index.html`).

2. **`x_game_score` (Leaderboards)**
   * Stores players' high scores.
   * Key fields: `x_studio_game` (relational field to release), `x_studio_user` (relational field to user), `x_studio_score` (Integer).

3. **`x_game_save` (Cloud Saves)**
   * Stores active game progress/state.
   * Key fields: `x_studio_game` (ID), `x_studio_user` (ID), `x_studio_data` (Stringified JSON payload).

---

## 4. Odoo RPC Client Rules

* Always import and use the unified Odoo client from `@/lib/odoo` (or absolute import paths `lib/odoo`).
* **Never** write raw HTTP fetch requests for Odoo RPC calls.
* Always handle session expiration gracefully: if Odoo returns a session expired error, clear the local cookies and redirect to `/login`.

---

## 5. Game Development Rules (inside `/public/games/`)

* **No Local DB**: Do not attempt to read or write to `db.json` or local JSON files for persistent scores or game states.
* **Use GameSystem**: All communication must go through `window.GameSystem` injected via `../../system/system.js`.
* **State Management**: For game state flow (Menu, Play, Game Over), use standard switch/case inside `draw()`. Avoid complex, untested external state managers.