# DrawBoard

I built DrawBoard to understand how collaborative tools like Figma and Miro handle real-time sync without descending into chaos when multiple people edit the same thing at once. Most open-source whiteboard clones either poll a database (slow, clunky) or require standing up a custom WebRTC signaling stack. DrawBoard uses a CRDT engine instead — the same category of approach the real products use.

Multiple users can join a board and draw at the same time with shapes, freehand strokes, straight lines, sticky notes, and text. Cursors move live. If two people grab the same object and drag it in opposite directions in the same instant, the state resolves deterministically instead of corrupting or throwing.

Past the canvas itself, boards live inside multi-tenant organizations, with a full request-to-collaborate flow for guests, an admin approval system, and a safeguard that stops an organization from ever being left without an admin.

**Stack:** Next.js 15 (App Router) · TypeScript · Liveblocks (CRDT sync) · Convex (realtime DB) · Clerk (auth + organizations) · Zustand · Tailwind

## Visuals

**Dashboard**
![Dashboard](public/screenshots/dashboard1.png)

**Real-time canvas**
![Real-time Canvas](public/screenshots/canvas.png)

**Multiplayer cursors**
![Multiplayer Cursors](public/screenshots/multiplayer.png)

**Collaboration requests**
![Collaboration Request](public/screenshots/collab-request.png)

**Admin protection banner**
![Admin Promotion Banner](public/screenshots/admin-banner.png)

---

## Canvas tools

- Rectangle, ellipse, and text layers
- Pressure-shaped freehand pen, built on `perfect-freehand`
- Straight line tool
- Eraser that hit-tests layers by proximity to the pointer rather than painting over pixels — it actually deletes the objects underneath, with an adjustable brush radius
- Sticky notes
- Multiplayer selection: selecting or resizing a layer shows everyone else in the room a visual indicator, so two people can't silently overwrite each other's edit
- Undo/redo sourced directly from Liveblocks' history log — not a separate action stack that has to be kept in sync by hand
- A hard cap of 100 layers per board (`MAX_LAYERS`), to keep a single board inside Liveblocks' free-tier storage limits
- Export the board as PNG or PDF. This is trickier than it sounds: the canvas is rendered as SVG with HTML `foreignObject` elements for text and notes, and browsers taint an HTML canvas the moment you try to draw an SVG containing embedded HTML onto it. The export path clones the SVG, strips avatar `<image>` tags, and manually rewrites each `foreignObject` (sticky notes, text) into plain SVG `<rect>`/`<text>` primitives before rasterizing — PDF export then wraps that PNG with a dynamically-imported `jsPDF` so the library doesn't bloat the main bundle

## Organizations, access requests, and admin protection

A board belongs to a Clerk organization, not a single user. From there:

- **Board management** — create, rename (60-character limit, enforced server-side), delete, favorite/unfavorite, and search by title, all scoped to the active org
- **Public/private toggle** — a board's author can flip it public; anyone with the link can then view it read-only, or request to collaborate
- **Guest access requests** — a non-member hits a public board and requests write access. Admins get the request in real time (a Convex subscription, not polling) and can approve, reject, or permanently block a requester
- **Live-updating access** — the moment a request is approved, the requester's Liveblocks room token upgrades from `READ_ACCESS` to `FULL_ACCESS` without a page refresh. If an admin later removes that person from the org, the next `liveblocks-auth` check catches it and silently downgrades their access back to read-only
- **Sole-admin protection** — if an organization would be left with zero admins (the last admin is about to leave, or is simply the only one), a banner prompts them to promote another member first. The promotion is broadcast through Convex so the newly-promoted member gets a toast and their Clerk session reloads client-side, immediately — they don't need to sign out and back in to see their new permissions

## Why it's built this way

**Two databases, split by access pattern, not convenience.** Layer coordinates, z-index, and cursor presence need to sync dozens of times a second — that data lives in Liveblocks Storage as a typed `LiveMap` (O(1) layer lookups by ID) and a separate `LiveList` that tracks stacking order explicitly, since map iteration order isn't guaranteed to match insertion order across clients. Board titles, org ownership, favorites, and access requests are read on page load and mutated occasionally — that's Convex, where every query is automatically a live subscription with no polling code to write. Putting layer data in Convex would mean hand-rolling a CRDT or operational-transform layer; putting board metadata in Liveblocks would mean opening a full room connection just to render a list of cards on the dashboard.

**The Liveblocks auth route is the actual security boundary, not a formality.** `/api/liveblocks-auth` checks the Clerk session, then branches on four cases: org member → `FULL_ACCESS`; approved guest whose org membership is re-verified live against Clerk (not just trusted from a cached Convex row) → `FULL_ACCESS`, with an automatic downgrade-and-revoke if they've since been removed; public board with no approval → `READ_ACCESS`; private board, wrong org → rejected outright. The re-verification step matters — an admin revoking someone's access in the Clerk dashboard takes effect on their very next token request, not whenever a cache happens to expire.

**Convex indexes match the actual query shapes.** `boards` has a search index on `title` scoped to `orgId`, so searching never leaks results across organizations. `userFavourites` carries three separate compound indexes (`by_user_board`, `by_user_org`, `by_user_board_org`) because "is this favorited," "all of my favorites," and "unfavorite this one" are three different lookups that can't share a single index efficiently. `collabRequests` indexes on `(boardId, requesterId)` specifically so a guest's own request status can be queried without scanning every request on the board.

**Session reload instead of a page refresh.** When a member is promoted to admin, `session.reload()` is called client-side in response to a Convex mutation the other tab is subscribed to. Clerk's session token refreshes in place, so the new role takes effect immediately without the user doing anything.

## Architecture

```
                              Browser (multiple clients)
                                        │
                                        ▼
                          Clerk middleware — session + active org
                                        │
                ┌───────────────────────┴────────────────────────┐
                │                                                 │
          Dashboard route                                   Board route
      (org sidebar, board list,                        (canvas + collab UI)
       favorites, search, invite)                                │
                │                                                 ▼
                ▼                                    POST /api/liveblocks-auth
        Convex queries/mutations                        │
        (live subscriptions,                             ├─ Clerk session check
         no polling)                                     ├─ org match?      → FULL_ACCESS
                │                                         ├─ approved guest, still
                │                                         │  a Clerk org member?
                ▼                                         │       → FULL_ACCESS
     ┌──────────────────────┐                             ├─ else revoke + READ_ACCESS
     │       Convex          │                            ├─ public, unapproved → READ_ACCESS
     │  boards · userFavourites                           └─ private, wrong org → 403
     │  collabRequests · roleUpdates                                │
     └──────────────────────┘                                       ▼
                ▲                                        Liveblocks room token
                │                                                    │
                │  admin approves / promotes                          ▼
                └──────────────────────────────────────  Liveblocks Storage (CRDT)
                   Convex mutation → live toast +             ├─ layers     LiveMap<id, LiveObject<Layer>>
                   session.reload() on the other client       ├─ layerIds   LiveList<id>  (z-index order)
                                                                └─ presence   cursor, selection, pencil draft
```

## Data model

**Convex — four tables.**

| Table | Purpose | Notable indexes |
|---|---|---|
| `boards` | title, orgId, authorId, imageUrl, viewCount, isPublic | `by_org`, search index on `title` scoped to `orgId` |
| `userFavourites` | join table: userId ↔ boardId ↔ orgId | `by_board`, `by_user_org`, `by_user_board`, `by_user_board_org` |
| `collabRequests` | pending/approved/rejected/blocked access requests | `by_org`, `by_board_and_user` |
| `roleUpdates` | pending real-time role-change notifications for a user | `by_user` |

**Liveblocks — typed Storage and Presence** (declared in `liveblocks.config.ts`, no traditional schema). A `Layer` is a discriminated union — `Rectangle`, `Ellipse`, `Path`, `Line`, `Text`, or `Note` — each with its own geometry and fill; `Path` also stores the raw point array from the pen tool. `layerIds` is a separate ordered `LiveList` rather than something inferred from map iteration, which is what keeps stacking order consistent across every connected client.

## Project structure

```
app/
├─ (dashboard)/
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ _components/
│     ├─ navbar.tsx, org-sidebar.tsx, sidebar/            org switcher + nav
│     ├─ board-list.tsx, board-card/                      grid, hover overlay, footer actions
│     ├─ new-board-button.tsx, search-input.tsx, invite-button.tsx
│     ├─ empty-board.tsx, empty-favourites.tsx,
│     │  empty-org.tsx, empty-search.tsx                  empty states per view
│     ├─ collaboration-notifier.tsx                       live toast when a guest's request is approved
│     ├─ role-change-notifier.tsx                         consumes roleUpdates, calls session.reload()
│     └─ sole-admin-banner.tsx                             forced admin-succession prompt
│
├─ board/[boardId]/
│  ├─ page.tsx
│  └─ _components/
│     ├─ canvas.tsx                    pointer events, layer CRUD, selection net, eraser hit-testing
│     ├─ rectangle.tsx, ellipse.tsx,
│     │  path.tsx, line-layer.tsx,
│     │  text.tsx, note.tsx            one renderer per layer type
│     ├─ LayerPreview.tsx, selection-box.tsx, selection-tools.tsx
│     ├─ cursor.tsx, cursors-presence.tsx, participants.tsx, user-avatar.tsx
│     ├─ toolbar.tsx, tool-button.tsx, color-picker.tsx
│     ├─ info.tsx                      board title, view count, export (PNG/PDF)
│     └─ loading.tsx
│
└─ api/
   └─ liveblocks-auth/route.ts          the actual security boundary — mints scoped room tokens

actions/                                Next.js Server Actions (Clerk Admin API + Convex)
├─ org.ts                               sole-admin detection, member promotion
└─ collab.ts                            approve access requests, live-revoke on membership change

convex/
├─ schema.ts                            boards, userFavourites, collabRequests, roleUpdates
├─ board.ts                             create / update / remove / favourite / togglePublic / incrementViewCount
├─ boards.ts                            list / search queries for the dashboard
├─ requests.ts                          collab request lifecycle (create → pending → approved/rejected/blocked)
├─ roleUpdates.ts                       one-shot role-change notifications, consumed then deleted
└─ auth.config.ts                       Convex ↔ Clerk JWT integration

hooks/
├─ use-api-mutation.ts                   wraps Convex mutations with pending/error state
├─ use-delete-layers.ts
├─ use-selection-bounds.ts
├─ use-export-canvas.ts                  SVG → canvas → PNG, optional jsPDF wrap
└─ use-disable-scroll-bounce.tsx

store/
└─ use-rename-modal.ts                   Zustand store for the rename dialog

liveblocks.config.ts                     typed Presence / Storage / UserMeta contract
providers/                               Convex client provider, modal provider
middleware.ts                            Clerk session middleware
```

## Running it locally

You'll need Node 18+ and accounts for Clerk, Convex, and Liveblocks.

```bash
git clone https://github.com/yourusername/drawboard.git
cd drawboard
npm install
```

Set up `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
LIVEBLOCKS_SECRET_KEY=sk_...
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
```

Then run both dev processes side by side:

```bash
npx convex dev
npm run dev
```

`npx convex dev` provisions `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` for you on first run.

## Deploying

Runs on Vercel; Convex deploys separately from its own CLI.

1. `npx convex deploy` — pushes schema and functions to a production Convex deployment
2. Set the Clerk keys, `LIVEBLOCKS_SECRET_KEY`, and `NEXT_PUBLIC_CONVEX_URL` in Vercel's environment settings
3. In Clerk, enable Organizations if it isn't already, and add the production domain to allowed origins — otherwise the Liveblocks auth route will reject sessions
4. Deploy on Vercel as usual

```bash
vercel
```

## Known quirks / what I'd do next

- `eslint-config-next` is pinned at `13.4.19` while the app runs Next 15.5 — two major versions behind, needs bumping
- No automated test covering two clients resizing the same layer at once — works in manual testing, hasn't been load-tested
- No UI warning as a board approaches the 100-layer cap, it just silently stops accepting new layers
- Camera pan offset can drift slightly after a dramatic browser resize
- Board thumbnails are randomized placeholder SVGs, not real canvas snapshots
- No automated test suite yet

---
*Built as a deep-dive into CRDTs and real-time web infrastructure.*
