# DrawBoard

> A production-grade, real-time collaborative whiteboard application built with Next.js 15, Liveblocks, Convex, and Clerk.

Multiple users draw on the same infinite canvas simultaneously — shapes, freehand strokes, straight lines, sticky notes, text — and see each other's cursors move with sub-16ms latency. The collaboration layer is backed by a Conflict-free Replicated Data Type (CRDT) engine, which means two people moving the same object at once resolve deterministically without data loss.

---

## Screenshots

> Add your own screenshots to `public/screenshots/` and they will appear here.

| Feature | Preview |
|---|---|
| Dashboard | `public/screenshots/dashboard.png` |
| Real-time Canvas | `public/screenshots/canvas.png` |
| Multiplayer Cursors | `public/screenshots/multiplayer.png` |
| Collaboration Request | `public/screenshots/collab-request.png` |
| Admin Promotion Banner | `public/screenshots/admin-banner.png` |

---

## Features

### Real-Time Collaborative Canvas
- **Drawing tools:** Rectangle, Ellipse, Freehand Pen (`perfect-freehand`), Straight Line, Sticky Notes, Text
- **Eraser tool** with a variable-size radius slider — erases by proximity hit-test in real time for all collaborators
- Live **multiplayer cursors** — every user's pointer position and pen color broadcast across the room with a 16ms throttle
- **Multiplayer selection** — selecting or resizing a layer shows other users what you're working on, preventing silent overwrites
- Deterministic **z-index/stacking order** via a separate `LiveList` (not inferred from map iteration order)
- **Undo / Redo** backed by Liveblocks' own CRDT history — not a hand-rolled action stack

### Organization & Access Control
- Boards are **multi-tenant**, scoped to Clerk organizations — a board belongs to an org, never to a single user
- Board access is **server-brokered**: the Liveblocks token is only minted after verifying the user's Clerk session server-side — guessing a board ID is not enough to join its room
- **Collaboration Requests** — guests can request access to any public board; org admins approve/reject/block in real time
- **Sole Admin Protection** — a sticky dashboard banner prevents the last admin from leaving an org without promoting another member first

### Dashboard
- Board list, favorites, and search are Convex **live subscriptions** — data updates without polling or page refresh
- Boards can be renamed, deleted, and favorited
- Organization switching via Clerk's org sidebar
- Board view counter incremented on every visit

### Security & Real-Time Integrity
- Removed collaborators are **immediately downgraded** to read-only — the Liveblocks auth route double-checks Clerk org membership on every token request; removed users fail this check and their Convex record is revoked server-side
- Guest `userId` for anonymous visitors uses `crypto.randomUUID()` — cryptographically unique, no collision risk

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) | Server components, server actions, file-system routing |
| Language | **TypeScript** | Full type safety across the canvas layer discriminated union |
| Real-Time Sync | **Liveblocks** (CRDT) | Canvas state: layers, cursors, presence — needs 60fps sync, not polling |
| Database | **Convex** | Board metadata, favorites, collab requests — live subscriptions, no ORM required |
| Auth | **Clerk** | Organizations, multi-tenant membership, role management, JWT sessions |
| UI | **Tailwind CSS + shadcn/ui** | Design system with dark-mode-first components |
| Drawing | **perfect-freehand** | Pressure-sensitive freehand stroke smoothing |
| Icons | **lucide-react** | Consistent professional icon set |

---

## Architecture

### High-Level System Design

```
┌──────────────────────────────────────────────────────────────┐
│                      Browser (Client A)                      │
│                                                              │
│   Next.js App Router  ─────┐                                 │
│   (React Server + Client)  │                                 │
│                            │                                 │
│   Clerk Session ───────────┼──→  /api/liveblocks-auth        │
│   (JWT in cookie)          │         │                       │
│                            │         ▼                       │
│   Liveblocks SDK ◄─────────┼── Room Token (scoped)          │
│   (WebSocket CRDT) ◄───────┼──────────────────────────────── │
│                            │                                 │
│   Convex SDK ◄─────────────┼── WebSocket Subscriptions      │
│   (Live DB queries)        │                                 │
└────────────────────────────┘
             │
             │  Real-time sync (CRDT)
             ▼
     ┌────────────────┐
     │  Liveblocks    │   Layer mutations, cursor positions,
     │  Room (CRDT)   │   selection state, pencil drafts
     └────────────────┘
             │
             │  Shared by all connected clients
             ▼
     ┌────────────────┐
     │    Convex      │   Boards, Favorites, Collab Requests,
     │  (Realtime DB) │   Role Update Notifications
     └────────────────┘
             │
             │  Identity & Org membership
             ▼
     ┌────────────────┐
     │     Clerk      │   Users, Organizations, Roles (JWT)
     └────────────────┘
```

### Two Databases, On Purpose

The most important architectural decision is using **two separate real-time data stores** for two different concerns:

| Store | What Lives There | Why |
|---|---|---|
| **Liveblocks CRDT** | Canvas layers, layerIds, cursors, pencil drafts, selection | Needs CRDT semantics — two people editing the same layer at once must resolve without a "last write wins" race. Liveblocks provides this out of the box via Operational Transform |
| **Convex** | Board metadata, org ownership, favorites, collab requests, role notifications | Occasionally-mutated relational data that needs live subscriptions for dashboard updates. A Convex query already re-renders the client automatically on any change — no `useEffect` + polling needed |

Putting layer data in Convex would require hand-rolling an OT/CRDT layer. Putting board metadata in Liveblocks would mean querying a live room just to render a dashboard list. Each store is doing exactly the job it is good at.

### Liveblocks Auth Flow

The client never touches Liveblocks directly with sensitive credentials. Every room join is brokered server-side:

```
Client                   /api/liveblocks-auth           Clerk API       Convex
  │                              │                          │              │
  ├──── POST { room: boardId } ──►                          │              │
  │                              ├── Verify Clerk session ──►              │
  │                              │◄─ userId, orgId ─────────┘              │
  │                              │                                         │
  │                              ├── Query board.orgId ────────────────────►
  │                              │◄─ board record ─────────────────────────┘
  │                              │
  │                              │  if orgId matches → FULL_ACCESS token
  │                              │  if approved collab + still Clerk member → FULL_ACCESS token  
  │                              │  if public board → READ_ACCESS token (viewer)
  │                              │  else → 403 Unauthorized
  │                              │
  │◄──── Room Token ─────────────┘
  │
  ├──── Connect to Liveblocks Room (WebSocket)
```

---

## Data Model

### Convex Schema

```
boards
  ├── title: string
  ├── orgId: string          ← Clerk organization ID
  ├── authorId: string       ← Clerk user ID
  ├── authorName: string
  ├── imageUrl: string
  ├── viewCount?: number
  └── isPublic?: boolean
      indexes:
        by_org(orgId)
        search_title(title, filtered by orgId)   ← scoped — search never leaks across orgs

userFavourites
  ├── orgId: string
  ├── userId: string
  └── boardId: id<boards>
      indexes:
        by_board(boardId)
        by_user_org(userId, orgId)
        by_user_board(userId, boardId)
        by_user_board_org(userId, boardId, orgId)   ← three shapes, three compound indexes

collabRequests
  ├── boardId: id<boards>
  ├── boardTitle: string
  ├── requesterId: string
  ├── requesterName: string
  ├── orgId: string
  └── status: "pending" | "approved" | "rejected" | "blocked"
      indexes:
        by_org(orgId)
        by_board_and_user(boardId, requesterId)

roleUpdates             ← ephemeral notification table; consumed immediately after display
  ├── orgId: string
  ├── userId: string
  ├── orgName: string
  └── newRole: string
      indexes:
        by_user(userId)
```

Indexes are shaped around **actual access patterns**, not just primary keys. `userFavourites` has three separate compound indexes because "is this board favorited?", "all favorites for this user", and "unfavorite this specific board" are three distinct lookup shapes that one index cannot efficiently serve.

### Liveblocks Storage (Typed)

```typescript
Storage: {
  layers:   LiveMap<string, LiveObject<Layer>>   // id → layer data
  layerIds: LiveList<string>                     // ordered z-index list
}

Presence: {
  cursor:      { x, y } | null    // broadcast pointer position
  selection:   string[]           // which layer IDs this user has selected
  pencilDraft: [x, y, pressure][] // in-progress freehand stroke
  penColor:    Color | null
}
```

`layerIds` is kept as a **separate ordered `LiveList`** rather than inferring order from `LiveMap` iteration. Map iteration order is not guaranteed in JavaScript, and `LiveMap` is unordered by definition. The stacking order (z-index) is therefore always deterministic.

### Canvas Layer Type System

Canvas layers form a **discriminated union** — TypeScript narrows the type based on `LayerType`:

```typescript
type Layer =
  | RectangleLayer   // { type: 0, x, y, width, height, fill }
  | EllipseLayer     // { type: 1, x, y, width, height, fill }
  | PathLayer        // { type: 2, x, y, width, height, fill, points[][] }
  | TextLayer        // { type: 3, x, y, width, height, fill, value? }
  | NoteLayer        // { type: 4, x, y, width, height, fill, value? }
  | LineLayer        // { type: 5, x, y, x2, y2, fill, strokeWidth? }
```

---

## Project Structure

```
drawboard/
├── app/
│   ├── (dashboard)/
│   │   ├── _components/
│   │   │   ├── board-card/            Board card with rename, delete, favorite
│   │   │   ├── board-list.tsx         Live Convex query + search
│   │   │   ├── org-sidebar.tsx        Clerk org switcher
│   │   │   ├── navbar.tsx
│   │   │   ├── collaboration-notifier.tsx   Admin receives real-time collab requests
│   │   │   ├── sole-admin-banner.tsx        Protection — last admin cannot leave
│   │   │   └── role-change-notifier.tsx     Member receives instant role change toast
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── board/[boardId]/
│   │   ├── _components/
│   │   │   ├── canvas.tsx             Core interaction model — all pointer events
│   │   │   ├── toolbar.tsx            All drawing tools + keyboard shortcuts
│   │   │   ├── info.tsx               Board title, org name
│   │   │   ├── participants.tsx       Live collaborator avatars
│   │   │   ├── selection-box.tsx      Resize handles around selection
│   │   │   ├── selection-tools.tsx    Color picker, font size, delete
│   │   │   ├── cursors-presence.tsx   Other users' live cursors
│   │   │   ├── LayerPreview.tsx       Dispatcher → correct component per type
│   │   │   ├── rectangle.tsx
│   │   │   ├── ellipse.tsx
│   │   │   ├── path.tsx               Freehand pen via perfect-freehand
│   │   │   ├── line.tsx               Straight line SVG layer
│   │   │   ├── text.tsx
│   │   │   └── note.tsx
│   │   └── page.tsx
│   │
│   ├── api/
│   │   └── liveblocks-auth/route.ts   Server-brokered room token endpoint
│   └── layout.tsx
│
├── convex/
│   ├── schema.ts              Full Convex schema
│   ├── board.ts               CRUD + favorites + viewCount
│   ├── boards.ts              Board list queries
│   ├── requests.ts            Collab request lifecycle
│   └── roleUpdates.ts         Ephemeral real-time role notifications
│
├── actions/
│   ├── collab.ts              verifyAndRevokeAccess — server action
│   └── org.ts                 getOrgAdminStatus, promoteMemberToAdmin, getCurrentUserMemberships
│
├── hooks/
│   ├── use-api-mutation.ts    Convex mutation wrapper with loading state
│   ├── use-delete-layers.ts   Keyboard Delete/Backspace handler
│   └── use-selection-bounds.ts  Bounding box of multi-selection
│
├── types/
│   └── canvas.ts              All canvas type definitions and enums
│
├── liveblocks.config.ts       Typed Presence, Storage, UserMeta contract
├── middleware.ts              Clerk session + route protection
└── providers/
    ├── convex-client-provider.tsx
    └── modal-provider.tsx
```

---

## Keyboard Shortcuts

| Key | Tool |
|---|---|
| `1` | Select / Move |
| `2` | Text |
| `3` | Sticky Note |
| `4` | Rectangle |
| `5` | Ellipse |
| `6` | Freehand Pen |
| `7` | Straight Line |
| `8` | Eraser |
| `9` | Undo |
| `0` | Redo |
| `Delete` / `Backspace` | Delete selected layer(s) |

---

## Running Locally

### Prerequisites
- Node.js 18+
- A [Clerk](https://clerk.com) account with an application + organization settings enabled
- A [Convex](https://convex.dev) account
- A [Liveblocks](https://liveblocks.io) account

### Setup

```bash
git clone https://github.com/yourusername/drawboard.git
cd drawboard
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Convex (auto-provisioned by `npx convex dev` on first run)
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
CONVEX_DEPLOYMENT=dev:...

# Liveblocks
LIVEBLOCKS_SECRET_KEY=sk_...
```

### Development

Two processes run in parallel:

```bash
# Terminal 1 — Convex backend (syncs schema + functions live)
npx convex dev

# Terminal 2 — Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

### Convex

```bash
npx convex deploy   # pushes schema + functions to production
```

### Vercel

1. Set environment variables in Vercel's project settings:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CONVEX_URL` (from `npx convex deploy` output)
   - `LIVEBLOCKS_SECRET_KEY`

2. Configure Clerk's **allowed origins** in the Clerk dashboard to include your production domain — otherwise the Liveblocks auth route will reject sessions.

3. Push to your connected GitHub repo or run:
```bash
vercel --prod
```

---

## Design Decisions

### Why Liveblocks for the canvas, not a raw WebSocket?
Building real-time collaborative editing from scratch requires either Operational Transform (OT) or CRDT semantics. Both are research-grade problems. Liveblocks ships a production-ready CRDT engine with typed `LiveMap`, `LiveList`, and `LiveObject` primitives that handle network partitions, reconnections, and concurrent conflict resolution automatically. The tradeoff is vendor dependency; the benefit is correctness that would take months to reproduce.

### Why Convex instead of a traditional REST API + PostgreSQL?
Convex provides live queries — a query subscription that automatically re-pushes to the client whenever the underlying data changes, without polling. This is what makes the dashboard and collab request notifications update in real time without `setInterval`. The Convex schema is also fully type-safe end-to-end, including the query and mutation function signatures.

### Why Clerk for auth?
Clerk's **organization model** maps directly to the multi-tenant requirement: a board belongs to an org, users have roles within an org (`org:admin`, `org:member`), and Clerk manages all the JWT lifecycle, session management, and RBAC. Writing this from scratch with NextAuth would require implementing all of that organization and membership infrastructure manually.

### Why separate `layerIds` and `layers`?
A `LiveMap` is an unordered key-value store. If z-index (layer stacking order) were inferred from the map, it would be non-deterministic across clients. The `layerIds: LiveList<string>` stores the canonical ordered reference to every layer ID. The map is only used for O(1) lookup by ID. This pattern separates "what layers exist" from "what order they're in".

---

## Known Limitations & Future Work

| Item | Status |
|---|---|
| `MAX_LAYERS = 100` per board, no user-facing warning | In progress |
| Board thumbnails are random placeholder SVGs | Future: capture a real canvas snapshot on save |
| No automated load / concurrency tests | Future: Playwright + Liveblocks test room fixtures |
| No server-side enforcement of org-level board limits | Future: Convex mutation validation |
| Clerk role changes from external Clerk dashboard do not push real-time toasts | Requires a Clerk webhook endpoint + ngrok for localhost |

---

## License

MIT
