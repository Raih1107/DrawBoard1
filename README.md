# DrawBoard

A real-time collaborative whiteboard. Multiple people draw on the same canvas at once — shapes, freehand pen, sticky notes, text — and see each other's cursors move live.

The interesting part isn't the drawing tools, it's the sync layer: canvas state lives in a Liveblocks CRDT room, not in a database you poll. Boards themselves (metadata, ownership, favorites) live in Convex, which is a separate concern from the live pixels.

**Stack:** Next.js 15 (App Router) · TypeScript · Liveblocks (CRDT sync) · Convex (realtime DB) · Clerk (auth + organizations) · Zustand · Tailwind

![Landing page](public/screenshots/landing.png)

---

## What it does

- Multi-tenant boards scoped to Clerk **organizations** — a board belongs to an org, not a single user
- Real-time canvas: rectangles, ellipses, freehand pen (via `perfect-freehand`), sticky notes, and text layers
- Live cursors and presence — every connected user's pointer position and current pen color broadcast to everyone else in the room
- Multiplayer selection: selecting or resizing a layer shows other users what you're doing, and prevents silent overwrite conflicts
- Undo/redo backed by Liveblocks' own history, not a hand-rolled stack
- Board favorites, renaming, search, and soft-limited free-tier board counts per organization
- Layer color picker with a shared "last used color" per session

## Sign in

![Authentication](public/screenshots/auth.png)

Auth and organization membership are both handled by Clerk. There's no custom user table for identity — Convex only stores the `orgId` and `authorId` (Clerk's), never credentials.

## Dashboard

![Dashboard](public/screenshots/dashboard.png)

Board list, favorites, and search are Convex queries reading directly off the `boards` and `userFavourites` tables — no client cache layer sitting in between, because Convex subscriptions already push updates live.

## The board

![Board / canvas](public/screenshots/board.png)

This is where Liveblocks does the actual work. `layers` and `layerIds` live in a `LiveMap` / `LiveList` inside Storage — every insert, move, resize, and delete is a CRDT mutation, which is what makes two people editing the same board at once resolve without a "last write wins" data race.

![Multiplayer cursors](public/screenshots/multiplayer.png)

## Why it's built this way

**Two databases, on purpose.** Liveblocks Storage holds the canvas — layers, layer order, presence, cursors — because that's what needs to sync in real time between connected clients. Convex holds boards, org ownership, and favorites — data that's read on page load and mutated occasionally, not sixty times a second. Putting layer data in Convex would mean writing a custom operational-transform or CRDT layer by hand; putting board metadata in Liveblocks would mean querying a live room just to render a dashboard list. Each store is doing the job it's actually good at.

**Liveblocks auth is server-brokered, not client-trusted.** The client never talks to Liveblocks with a secret key. It hits `/api/liveblocks-auth`, which checks the Clerk session, checks that the requested board's `orgId` matches the user's active Clerk organization via a Convex query, and only then calls `liveblocks.prepareSession()` to mint a room token. A user can't join a room for a board outside their organization by guessing an ID — the org check happens server-side before any token is issued.

**Convex indexes are shaped around the actual access patterns**, not just the primary key. `boards` has a search index on `title` scoped by `orgId` (so search never leaks across organizations), and `userFavourites` has three separate compound indexes (`by_user_board`, `by_user_org`, `by_user_board_org`) because "is this board favorited by this user," "all of this user's favorites," and "unfavorite this specific board" are three different lookup shapes — one index can't serve all three efficiently.

**History is Liveblocks', not custom.** `useHistory`, `useCanUndo`, and `useCanRedo` come straight from `@liveblocks/react`. Every mutation that should be undoable is wrapped with `addToHistory: true` in presence updates — undo/redo falls out of the CRDT log for free instead of a separately maintained action stack that has to stay in sync with it.

## Architecture

```
Browser (multiple clients)
  │
  ▼
Clerk middleware  →  session + active organization
  │
  ├─→ Dashboard (Convex)
  │      board list, favorites, search
  │      Convex queries — live subscriptions, no polling
  │
  └─→ Board page
         │
         ▼
      /api/liveblocks-auth
         │  Clerk session check
         │  Convex query: does board.orgId match the user's org?
         ▼
      Liveblocks room token (scoped to one room)
         │
         ▼
      Liveblocks Storage (CRDT)
         ├─ layers        LiveMap<id, LiveObject<Layer>>
         ├─ layerIds      LiveList<id>
         └─ presence      cursor, selection, pencil draft — per connected client
```

## Data model

**Convex** — two tables. `boards` (title, orgId, authorId, authorName, imageUrl) with a search index on title scoped to `orgId`. `userFavourites` (userId, orgId, boardId) as a pure join table with compound indexes for each of the three ways it actually gets queried.

**Liveblocks** — no traditional schema, just typed Storage and Presence (declared in `liveblocks.config.ts`). A `Layer` is a discriminated union — `Rectangle`, `Ellipse`, `Path`, `Text`, or `Note` — each carrying its own `x/y/width/height/fill`, with `Path` additionally storing the raw point array from the pen tool. `layerIds` is kept as a separate ordered `LiveList` rather than inferring order from map iteration, which is what makes z-index/stacking order deterministic across clients.

## Project structure

```
app/
├─ (dashboard)/
│  ├─ _components/          board list, org sidebar, board cards, search
│  └─ page.tsx
├─ board/[boardId]/
│  ├─ _components/
│  │  ├─ canvas.tsx          the whole interaction model: pointer events,
│  │  │                      layer insert/translate/resize, selection net
│  │  ├─ rectangle.tsx, ellipse.tsx, path.tsx, text.tsx, note.tsx
│  │  ├─ selection-box.tsx, selection-tools.tsx
│  │  ├─ cursors-presence.tsx, cursor.tsx, participants.tsx
│  │  └─ toolbar.tsx, color-picker.tsx
│  └─ page.tsx
└─ api/
   └─ liveblocks-auth/       the only real API route — brokers room tokens

convex/
├─ schema.ts                 boards, userFavourites
├─ board.ts                  create / update / remove / favourite / unFavourite
└─ boards.ts

hooks/
├─ use-api-mutation.ts        wraps Convex mutations with pending/error state
├─ use-delete-layers.ts
└─ use-selection-bounds.ts

liveblocks.config.ts          typed Presence / Storage / UserMeta contract
providers/
├─ convex-client-provider.tsx
└─ modal-provider.tsx
middleware.ts                 Clerk session middleware
```

## Running it locally

```bash
git clone https://github.com/yourusername/drawboard.git
cd drawboard
npm install
```

Two dev processes run side by side — Convex and Next.js:

```bash
npx convex dev
npm run dev
```

### Environment variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=

LIVEBLOCKS_SECRET_KEY=
```

`npx convex dev` provisions `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` for you on first run — you don't set those by hand.

## Deploying

Runs on Vercel; Convex deploys separately from its own CLI.

1. `npx convex deploy` — pushes schema + functions to a production Convex deployment
2. Set `NEXT_PUBLIC_CONVEX_URL`, Clerk keys, and `LIVEBLOCKS_SECRET_KEY` in Vercel's environment settings
3. Configure the Clerk instance's allowed origins to include the production domain, or the Liveblocks auth route will reject sessions
4. Deploy on Vercel as usual

```bash
vercel
```

## Known gaps / what I'd do next

- No automated conflict test for two clients resizing the same layer simultaneously — works in manual testing, hasn't been load-tested
- `MAX_LAYERS` is a flat cap of 100 per board with no user-facing warning as it's approached
- No test suite yet
- Board thumbnails are random placeholder SVGs, not real canvas snapshots
- Org-level free-tier board limits exist in the UI but aren't enforced anywhere server-side

## Screenshots

| | |
|---|---|
| **Landing page** | `public/screenshots/landing.png` |
| **Authentication** | `public/screenshots/auth.png` |
| **Dashboard** | `public/screenshots/dashboard.png` |
| **Board / canvas** | `public/screenshots/board.png` |
| **Multiplayer cursors** | `public/screenshots/multiplayer.png` |

Send these one at a time when you have them and I'll place each with a caption written for what a recruiter would actually notice.

## License

MIT
