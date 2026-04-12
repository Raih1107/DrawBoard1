# Canvasly: A Real-Time Collaborative Architecture Masterclass

Welcome to the definitive architectural deep-dive into **Canvasly**. This document is designed as a senior-level blueprint to help you reverse-engineer, internalize, and master the creation of high-scale, collaborative whiteboarding applications.

---

## 1. EXECUTIVE UNDERSTANDING (BEGINNER FRIENDLY)

### The Core Problem
Remote collaboration is hard because digital interaction usually happens in a "silo". If two people try to draw on the same piece of paper at the same time in the real world, it’s intuitive. In the digital world, coordinating those two "mouse movements" across different continents without them clashing is a major engineering hurdle.

SpendWise solved the problem of **Financial Consistency** (money shouldn't disappear). Canvasly solves the problem of **State Synchronization** (drawings shouldn't flicker or overwrite each other).

### The "Global Sandbox" Analogy
Imagine a massive sandbox that exists in multiple locations at once.
- If you build a sandcastle in New York, a user in London sees the sand moving in real-time.
- If two people grab the same bucket, the sandbox needs a "referee" to decide who got it first, without making the other person wait.
- **Canvasly** is that global sandbox. It allows for "Infinite Presence" where everyone's cursor, selection, and drawing stroke are broadcast instantly across the network.

### What is "Real-Time Collaboration"?
Analogy: Imagine a Google Doc, but for drawing. 
In a traditional app, you click "Save" to send data to a database. In a real-time app like Canvasly, your "mouse move" *is* the save. Every millisecond, the application is communicating with a central "Room" to tell everyone else exactly where you are and what you are doing.

---

## 2. SYSTEM ARCHITECTURE (THE HYBRID BACKEND)

Canvasly utilizes a sophisticated **Hybrid Backend** model that separates persistent metadata from ephemeral real-time state.

### 2.1 Persistent Storage (The Brain: Convex)
We use **Convex** as our primary relational database. 
- **Role**: Convex handles everything that needs to exist after you close the browser. This includes Board names, Organization ownership, User favorites, and "Deleted" status.
- **Why?**: Convex is a reactive database. If another user renames a board in the dashboard, your screen updates automatically without a refresh.

### 2.2 Ephemeral Storage (The Heartbeat: Liveblocks)
We use **Liveblocks** for the actual canvas data.
- **Role**: Liveblocks handles the "Layers" (rectangles, paths, text), user cursors, and current selections.
- **Why?**: Traditional databases are too slow for drawing. If we saved every pencil dot to a SQL database, the lag would be unbearable. Liveblocks uses **WebSockets** and **Conflict-free Replicated Data Types (CRDTs)** to synchronize state in milliseconds.

### 2.3 The Rendering Engine (SVG-Declarative)
Unlike many drawing apps that use a `canvas` element (which is basically a "dumb" grid of pixels), Canvasly uses **SVG (Scalable Vector Graphics)**.
- **Declarative State**: Every shape is a React component. 
- **Interaction**: This makes it incredibly easy to attach event listeners (like `onPointerDown`) directly to a rectangle, allowing for easy selection and transformation logic.

---

## 3. COMPLETE REQUEST LIFECYCLE

Let's trace the journey of a user drawing a **Red Rectangle**.

### Phase 1: The Local Intent (UI Layer)
1.  User selects the "Rectangle" tool in the `Toolbar.tsx`.
2.  The `Canvas.tsx` state machine moves to `CanvasMode.Inserting`.
3.  User clicks on the screen. `onPointerDown` captures the **Canvas Coordinates** (calculated by subtracting the camera offset).

### Phase 2: The Distributed Mutation (Liveblocks Layer)
1.  The `insertLayer` mutation is triggered. 
2.  **Optimistic Update**: Locally, the rectangle appears instantly.
3.  **The Broadcast**: Liveblocks sends a small "diff" packet through a WebSocket: *"New Object added at {x, y} with type: Rectangle"*.
4.  **Sync**: All other users in the "Room" receive this packet. Their React state updates, and the rectangle renders on their screens.

### Phase 3: Conflict Resolution
If User A and User B both move the *same* rectangle at the exact same time:
- Liveblocks uses **LWW (Last Write Wins)** or specific CRDT logic to ensure the final position is consistent for everyone. The UI doesn't "jump" or flicker because the state is synchronized at the primitive level.

### Sync vs. Async in Canvasly
- **Sync (Liveblocks)**: Presence updates (cursors) and Layer updates. Requires <100ms latency.
- **Async (Convex)**: Deleting the whole board or favoriting it. These are "heavy" operations that involve persistent storage.

---

## 4. PROJECT STRUCTURE (FILE-BY-FILE MENTAL MODEL)

Canvasly's structure is optimized for **Modularity**. Because whiteboards are composed of many different types of objects (sticky notes, paths, shapes), the project is split into dozens of small, focused components.

### `app/` (The Routing Nervous System)
*   **`(dashboard)/`**: Handles the organization switcher, board search, and board grids. It uses **Convex** hooks to list data.
*   **`board/[boardId]/`**: This is where the magic happens. 
    - **`page.tsx`**: A simple wrapper. Its only job is to provide the `boardId` to the `Canvas` component.
    - **`_components/`**: A "private" folder within the board route. This contains all board-specific UI (Toolbar, Info, Participants, Canvas). This keeps the global `components/` folder clean.

### `convex/` (The Persistence Layer)
Unlike SpendWise's Server Actions, Convex uses **Mutations** and **Queries** that run on a high-performance backend.
*   **`board.ts`**: Contains "board-level" logic (renaming, deleting).
*   **`boards.ts`**: Handles fetching lists of boards with complex filters (favorites, search).
*   **`schema.ts`**: Defines the shapes of our persistent tables.

### `store/` (The State Container)
We use **Zustand** for global UI state that doesn't need to be shared across users (e.g., which modal is currently open). This keeps the React component tree clean and avoids "prop drilling".

### `lib/` (The Toolbox)
*   **`utils.ts`**: The "Math" engine. It contains the logic for converting RGB to Hex, calculating bounding boxes for selections, and transforming pointer events into SVG coordinates.

---

## 5. COLLABORATIVE CONSISTENCY (CRDTs)

This is the most advanced technical pillar of Canvasly: **How do we maintain a single "Global Truth" without a central master lock?**

### 5.1 Storage vs. Presence
In Liveblocks, we divide data into two "buckets":
1.  **Storage (The Layers)**: This is "heavy" data that persists even if you leave the room. Every rectangle and path is stored here as a `LiveObject`.
2.  **Presence (The Users)**: This is "ephemeral" data. Your cursor position, your current selection, and what color you are currently using. If you close your tab, this data vanishes.

### 5.2 Conflict Resolution (CRDTs)
Traditional databases use "Locks" (only one person can edit at a time). Collaborative apps use **Conflict-free Replicated Data Types (CRDTs)**.
- **The Concept**: Instead of saying "Object is at X=10", a CRDT says "Move Object to X=10". 
- **Merging**: If User A moves a rectangle to the left and User B moves it to the right simultaneously, the CRDT engine receives both "Move" commands. It applies them in a deterministic order based on timestamps or unique IDs, ensuring that every user ends up at the *exact same* final state.

### 5.3 The Layer-ID Mapping
We use `nanoid()` to generate unique IDs for every shape.
- **Why?**: In a standard array, if User A deletes the first item, all other items shift their index. If User B was trying to edit the second item, they would accidentally edit a different shape!
- **The Solution**: We store layers in a **Map** (`LiveMap`). Even if shapes are added or deleted, the ID of your specific rectangle never changes until it is explicitly deleted.

---

---

## 6. AUTHENTICATION & SECURITY ANALYSIS

In a collaborative workspace, security is a multidimensional challenge. We aren't just protecting a "User Profile"; we are protecting a "Shared Sandbox".

### 6.1 The Identity Bridge (Clerk)
We use Clerk as the specialized identity provider. 
- **The Concept**: Clerk handles the "Who are you?". It provides a cryptographically signed JWT (JSON Web Token) that proves the user's identity. 
- **The Integration**: In `liveblocks-auth/route.ts`, we extract this token. We don't trust the client—we verify the session on the server.

### 6.2 Room-Level Authorization (Liveblocks Auth)
Most beginners make the mistake of allowing anyone with a "Room ID" to join. Canvasly implements **Strict Room Scoping**.
1.  A user attempts to join `board-123`.
2.  Next.js Middleware/API checks the Clerk session.
3.  We query **Convex** to ask: "Does Board 123 belong to an Organization that this user is a member of?"
4.  Only if the answer is "Yes", do we grant them a "Room Token" with `room:write` permissions.
**Security Fact**: Even if a hacker has the WebSocket URL for Liveblocks, they cannot read any data without this signed token from our Next.js backend.

### 6.3 Data Sanitization
Every shape created is validated. We don't allow "arbitrary" objects to be injected into the LiveMap. If a user tries to inject a script tag into a Note, our React-SVG renderer treats it as raw text, preventing **XSS (Cross-Site Scripting)** attacks.

---

## 7. THE RENDERING PIPELINE (SVG & LAYERS)

Canvasly does not "Draw" pixels; it "Declares" objects.

### 7.1 SVG: The Vector Advantage
We use **Scalable Vector Graphics**. 
- **Infinite Resolution**: You can zoom in 1000% on a rectangle, and the edges will stay perfectly sharp. 
- **DOM Integration**: Every shape in Canvasly is a standard DOM element. This means we can use CSS for hover effects and standard React event listeners for selections.
**The Trade-off**: SVG performance degrades if you have more than 5,000-10,000 nodes. For a standard whiteboard, this is a perfect balance of ease-of-use vs. performance.

### 7.2 The `LayerPreview` Pattern
To handle multiple shape types (Rect, Ellipse, Path, Text, Note), we use a pattern called **Dynamic Component Dispatching**.
```typescript
export const LayerPreview = ({ id, onLayerPointerDown, selectionColor }) => {
  const layer = useStorage((root) => root.layers.get(id));
  if (!layer) return null;

  switch (layer.type) {
    case LayerType.Rectangle: return <Rectangle id={id} ... />;
    case LayerType.Path: return <Path points={layer.points} ... />;
    // ...
  }
};
```
This keeps the `Canvas.tsx` clean. The canvas only cares about "IDs". Each individual layer component cares about "Rendering".

---

## 8. THE HISTORY ENGINE (MULTI-USER UNDO/REDO)

Undo/Redo is simple in a single-player app (it's just a stack). In a multiplayer app, it is a complex distributed state problem.

### 8.1 Local vs. Global History
Canvasly implements **Local History**. 
- If User A draws a line and User B moves a box, and User A clicks "Undo", we only undo the line. 
- **How?**: Liveblocks tracks a "History Stack" per connection. When you call `history.undo()`, it only pops the mutations that initiated from *your* specific client ID.

### 8.2 Batching Mutations
Imagine you are dragging a rectangle. You move it 100 pixels, which triggers 100 mouse events. You don't want to click "Undo" 100 times to move it back!
**The Solution**:
```typescript
history.pause(); // Stop recording 100 tiny moves
// ... dragging ...
history.resume(); // Record the final delta as ONE history step
```
This is the "Secret Sauce" that makes the professional collaborative experience feel smooth.

---

## 9. HIDDEN & ADVANCED CONCEPTS

To master Canvasly, you must master the "Invisible Math" happening behind the scenes.

### 9.1 Viewport Transformation (The Camera)
Your screen is 1920x1080, but the canvas is **Infinite**.
We use a `camera` state `{x, y}`.
- When you "Scroll", you aren't moving the content; you are moving the **Camera**.
- **The Equation**: `InternalX = MouseX - CameraX`. 
We apply this translation at the top level SVG group (`<g style={{ transform: ... }}>`). This allows the rest of the app to work in "World Coordinates" while the camera handles the "View".

### 9.2 Freehand Path Smoothing
A raw pencil path is just a list of dots: `[10,10, 11,11, 12,12]`.
If we just draw lines between them, it looks jagged.
We use the **Catmull-Rom Spline** logic (via `perfect-freehand`) to turn these dots into a smooth mathematical curve (a `d` attribute on an SVG `<path />`). This is how we get the "fluid ink" feel.

---

## 10. HOW TO REBUILD CANVASLY FROM SCRATCH

Do not start with Liveblocks. Follow this iterative path:

1.  **Phase 1: The Static Board**: Build a React component that renders an SVG with hardcoded shapes.
2.  **Phase 2: Local Interactivity**: Implement `onPointerDown` to add a new rectangle to a local React array.
3.  **Phase 3: Real-Time Sync**: Add Liveblocks. Move your shape array into `useStorage`. Watch it sync across two tabs.
4.  **Phase 4: Tool State Machine**: Build the `Toolbar` and a state that tracks if you are in `SELECT`, `DRAW`, or `SHAPE` mode.
5.  **Phase 5: Transformations**: Implement the "Resize Handles". This requires calculating the aspect ratio and ensuring you don't "flip" the object into negative width.
6.  **Phase 6: Persistence**: Add Convex to manage multiple boards.
7.  **Phase 7: Organization Logic**: Use Clerk organizations to group boards together.
8.  **Phase 8: Polish**: Add the "Presence" layer (avatars at the top) and "Participant Cursors".

---

## 11. CODE WALKTHROUGH (TEACHING MODE)

### 11.1 The State Machine: `canvas.tsx`
This is the most "Senior" file in the app. It's a massive state machine.
```typescript
const [canvasState, setCanvasState] = useState<CanvasState>({ mode: CanvasMode.None });
```
Every interaction (drawing, moving, selecting) is a "Mode". This prevents conflicts. You can't draw while you are resizing. You can't move while you are inserting. 

### 11.2 The Multi-User Presence: `participants.tsx`
How do we show who is in the room?
We use `useOthers()`. This hook provides a real-time list of every other user's `presence` (their avatar, name, and color). We don't save this to a database—it's purely in-memory on the Liveblocks server.

---

## 12. PERFORMANCE & SCALABILITY

### 12.1 The "10,000 Layer" Problem
In SVG, 10,000 nodes will make the browser lag.
**Solution**: **Selective Rendering**.
We only render the layers that are currently inside the user's viewport. If a shape is at {X: 5000} and your camera is at {X: 0}, we return `null` for that layer.

### 12.2 Conflict Resolution at Scale
Liveblocks handles over **1,000,000 operations per second** globally. It achieves this by using a distributed network of "Rooms". Each whiteboard is isolated, so a busy board in India doesn't slow down a board in USA.

---

## 13. IMPROVEMENTS & SENIOR ENGINEER CRITIQUES

If I were to take Canvasly to "Series A" funding, I would implement:

1.  **Canvas Exporting**: Using the `canvg` library to convert SVGs to PNGs for downloads.
2.  **AI Image Generation**: Integrate DALL-E or Gemini to "Generate an icon of a rocket" and place it directly on the canvas as an SVG path.
3.  **PDF Import**: Converting PDF pages into background SVG layers for annotation.
4.  **Spatial Persistence**: Storing the camera position *per user* in Convex so they return exactly where they left off.

---

## 14. FINAL SUMMARY: THE REAL-TIME MENTAL MODEL

To master Canvasly, you must stop thinking about "Pages" and start thinking about "Rooms". 

1.  **The Room**: The shared boundary where logic happens.
2.  **The Storage**: The permanent layers of the drawing.
3.  **The Presence**: The temporary ghosts (cursors) of other users.
4.  **The Synchronizer**: The Liveblocks engine that ensures everyone sees the same thing at the same time.

**You are now equipped with the architectural knowledge to build the next generation of collaborative tools.**

---

*End of README_CANVASLY.md Masterclass*
