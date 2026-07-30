# 🎨 DrawBoard — Real-Time Collaborative Whiteboard

<div align="center">

### Build, Draw, Collaborate — Together in Real Time

<br>

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Convex](https://img.shields.io/badge/Convex-Backend-orange)
![Liveblocks](https://img.shields.io/badge/Liveblocks-Realtime-7C3AED)
![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38BDF8?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-State%20Management-764ABC)
![License](https://img.shields.io/badge/License-MIT-success)

**A production-ready collaborative whiteboard inspired by Figma and Excalidraw, featuring multiplayer editing, live cursors, presence synchronization, authentication, and persistent cloud storage.**

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 👥 Multiplayer Collaboration | Multiple users editing simultaneously |
| 🖊️ Interactive Whiteboard | Draw, move, resize and manipulate layers |
| ⚡ Live Synchronization | Instant updates powered by Liveblocks |
| 👀 Live Presence | See collaborators' cursors and selections |
| 🔐 Authentication | Secure login with Clerk |
| ☁️ Persistent Storage | Whiteboards stored in Convex |
| 🎨 Layer Management | Shapes, text, notes and drawing tools |
| ↩️ Undo / Redo | Collaborative history support |
| 📱 Responsive UI | Optimized for desktop and tablets |
| 🌙 Modern Interface | Built using Tailwind CSS & shadcn/ui |

---

# 📸 Screenshots

## 🏠 Dashboard

> _Add Dashboard Screenshot_

---

## 🎨 Collaborative Canvas

> _Add Whiteboard Screenshot_

---

## 👥 Real-time Collaboration

> _Add Multiplayer Screenshot_

---

## 📝 Drawing Tools

> _Add Toolbar Screenshot_

---

## 📁 Boards

> _Add Boards Screenshot_

---

# 🚀 Demo

```text
Live Demo:
https://your-demo-url.vercel.app
```

---

# 🏗 Architecture

```text
                    Browser
                        │
                        ▼
               Next.js App Router
                        │
        ┌───────────────┴───────────────┐
        │                               │
   Client Components             Server Components
        │
        ▼
    Zustand Store
        │
        ▼
    Liveblocks Room
        │
        ├───────────────► Presence Sync
        │
        ├───────────────► Shared Storage
        │
        └───────────────► Live Cursors
                        │
                        ▼
                    Convex Backend
                        │
                        ▼
                  Persistent Database
```

---

# ⚙️ Tech Stack

| Category | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Backend | Convex |
| Authentication | Clerk |
| Realtime | Liveblocks |
| State Management | Zustand |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Icons | Lucide React |
| Deployment | Vercel |

---

# 📂 Folder Structure

```text
app/
├── (dashboard)/
├── board/
├── api/
├── layout.tsx
└── page.tsx

components/
├── canvas/
├── toolbar/
├── sidebar/
├── ui/
├── participants/
└── modals/

convex/
├── schema.ts
├── boards.ts
├── users.ts
└── lib/

hooks/

lib/

providers/

store/

middleware.ts

public/
```

---

# 🔄 Application Flow

```text
           User Login
                │
                ▼
             Clerk Auth
                │
                ▼
          Dashboard
                │
                ▼
        Open/Create Board
                │
                ▼
       Join Liveblocks Room
                │
      ┌─────────┼─────────┐
      │         │         │
      ▼         ▼         ▼
 Presence   Storage   Broadcast
      │         │         │
      └─────────┼─────────┘
                ▼
        Canvas Rendering
                │
                ▼
         Convex Persistence
```

---

# 🎨 Whiteboard Features

- Rectangle Tool
- Ellipse Tool
- Pencil Tool
- Text Tool
- Sticky Notes
- Selection Tool
- Resize Layers
- Drag & Drop
- Delete Objects
- Color Picker
- Layer Ordering
- Zoom & Pan

---

# 👥 Real-Time Collaboration

### Powered by Liveblocks

- Live cursors
- User presence
- Shared canvas state
- Multiplayer editing
- Conflict-free synchronization
- Real-time storage
- Cursor awareness
- Shared selections

---

# ☁️ Backend

The backend is powered by **Convex**, providing:

- Database
- Queries
- Mutations
- Authentication integration
- Persistent storage
- Automatic synchronization

---

# 🔐 Authentication

Authentication is handled by **Clerk**.

Features include:

- Secure sign-in
- User sessions
- Protected routes
- Middleware authorization
- User profiles

---

# 📦 State Management

Application state is managed using **Zustand**.

Typical responsibilities include:

- Canvas state
- Selected layers
- Tool selection
- UI preferences
- Local interaction state

---

# 🖼 Canvas Rendering

```text
Mouse Events
      │
      ▼
Current Tool
      │
      ▼
Canvas Logic
      │
      ▼
Layer Updates
      │
      ▼
Liveblocks Storage
      │
      ▼
Broadcast Changes
      │
      ▼
Other Connected Users
```

---

# 📡 Data Synchronization

```text
User A
   │
   ▼
Liveblocks
   │
   ▼
Shared Storage
   │
   ▼
User B

      ▲

Convex Persistence
```

---

# 🌍 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

CLERK_SECRET_KEY=

NEXT_PUBLIC_CONVEX_URL=

CONVEX_DEPLOYMENT=

LIVEBLOCKS_SECRET_KEY=

NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/yourusername/drawboard.git
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment

```bash
cp .env.example .env.local
```

---

## Run Convex

```bash
npx convex dev
```

---

## Start Development Server

```bash
npm run dev
```

---

Visit:

```text
http://localhost:3000
```

---

# 🚀 Deployment

Deploy effortlessly using **Vercel**.

```bash
vercel
```

Configure:

- Clerk
- Convex
- Liveblocks
- Environment Variables

---

# 📈 Engineering Highlights

✅ Real-time Multiplayer Collaboration

✅ Conflict-free State Synchronization

✅ Modern App Router Architecture

✅ Persistent Cloud Storage

✅ Type-safe Full-stack Development

✅ Secure Authentication

✅ Scalable Backend using Convex

✅ Responsive Canvas Engine

✅ Modular Component Architecture

✅ Production-ready Project Structure

---

<details>

<summary><b>🛣 Roadmap</b></summary>

- 📄 Export to PNG / SVG / PDF
- 🎥 Presentation Mode
- 📌 Comments & Mentions
- 🗂 Folder Organization
- 🧠 AI Diagram Generation
- 📱 Mobile Support
- 🔗 Shareable Read-only Links
- 🎨 Templates Library
- 📝 Rich Text Editing
- 📊 Analytics Dashboard

</details>

---

# 🤝 Contributing

Contributions are always welcome!

```bash
# Fork

# Create Feature Branch
git checkout -b feature/new-feature

# Commit
git commit -m "Add awesome feature"

# Push
git push origin feature/new-feature

# Open Pull Request
```

---

# 📄 License

Distributed under the **MIT License**.

---

<div align="center">

### ⭐ Star this repository if you found it useful!

Built with ❤️ using **Next.js**, **Convex**, **Liveblocks**, **Clerk**, **TypeScript**, **Tailwind CSS**, and **Zustand**.

</div>
