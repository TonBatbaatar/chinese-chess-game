# Chinese Chess (Xiangqi) — Console Edition + Web App prototype · v0.2.0

A learning + showcase project that brings **Chinese Chess (Xiangqi)** to life in both a **C# .NET console app** and an evolving **web app** (ASP.NET Core backend + React/TypeScript frontend).  

This repo demonstrates:
- ✅ A playable **local console game** (full rules, check/checkmate, etc.)
- ✅ Basic **online play** via TCP (console edition)  
- ✅ **ASP.NET Core + SignalR** backend for multiplayer over the web  
- 🚧 **React + TypeScript + Vite + Tailwind CSS** frontend with login/register/guest play UI  
- 🚧 In-progress **full multiplayer web client** (play via browser, real-time board updates)  

---

## ✨ Features (v0.2.0)

### Console App
- Local 2-player Chinese Chess (Red vs Black)
- Board rendering in terminal with colors & coordinates
- Full rules implemented:
  - Valid moves per piece
  - Check & checkmate detection
  - Special General-facing rule
- Online mode (host/join with TCP client & server)

### Web App Prototype
- **Backend (ASP.NET Core)**:
  - SignalR hub (`/hub/game`) for real-time moves
  - Game session creation & joining
  - Board state broadcasting
- **Frontend (React + TS + Vite + Tailwind)**:
  - Modern login/register/guest entry UI
  - **Guest Play mode**:
    - Create game, share Game ID
    - Join existing game
    - Send moves, board updates in real-time
  - Chessboard with:
    - Axis labels (A–I, 1–10)
    - River line divider
    - Red vs Black piece coloring
    - Dashed border & clean layout

---

## 📦 Tech Stack

### Backend
- **C# .NET 8** (Console + ASP.NET Core Web API)
- **SignalR** for real-time communication
- (Planned) **EF Core + SQLite** for:
  - User accounts
  - Match history
  - Saved games

### Frontend
- **React 19 + TypeScript**
- **Vite 7** (fast dev server + build tool)
- **Tailwind CSS 4** (modern styling)
- (Planned) React Router for navigation

---

## 🚀 Getting Started

## Clone
```bash
git clone https://github.com/TonBatbaatar/chinese-chess-game.git
```

## How to Run Console Local Game:
```bash
   cd ChineseChess.ConsoleSolution/ChineseChess.Console
   dotnet run
```

## How to Run a Console Multi-Player Game:

### 🔴 Terminal 1: Host (Server)
1. Open the first terminal.  
2. Run the program:
   ```bash
   dotnet run
   ```
3. Select 2 for Online Game.
4. Press h (for host).
5. The terminal should output:
   ```bash
   Server started on port 5000. Waiting for a client...
   ```

### 🟢 Terminal 2: Client (Second Player)
1. Open another terminal (same machine or another).
2. Run the program:
   ```bash
   dotnet run
   ```
3. Select 2 for Online Game.
4. Press c (for client).
5. When prompted, enter the IP address of the host:
   - If on the same machine → 127.0.0.1
   - Otherwise → the actual IP address of the host machine
6. Example:
   ```bash
   Enter host IP address: 127.0.0.1
   ```
   Once connected, the game will begin.

## How to Run a Web App Chess Game:
1. Run the backend server
   ```bash
   cd ChineseChess.WebSolution/ChineseChess.Api
   dotnet run
   ```
2. Open another terminal (same machine or another).
3. Run the frontend client
   ```bash
   cd ChineseChess.WebSolution/ChineseChess.FrontEnd
   npm install
   npm run dev
   ```
4. Open http://localhost:5173 in your browser.
5. Create a game (Game ID will be shown) → open another tab → join game → play moves.

## 🛠 Roadmap

- [x] **v0.1.0 — Console Edition**
  - Local 2-player Chinese Chess (Red vs Black)
  - Board rendering with coordinates & colors
  - Piece movement validation + check/checkmate rules
  - Online play via TCP (host/join)

- [x] **v0.2.0 — Web App Prototype**
  - ASP.NET Core + SignalR backend
  - React + TypeScript + Vite + Tailwind frontend
  - Guest Play mode (create/join game by ID)
  - Board UI with axis labels, river line, colored pieces

- [ ] **v0.3.0 — Web App Enhancements**
  - User authentication (register, login, guest)
  - Match history + saved games (EF Core + SQLite)
  - Richer board UI (palaces, diagonals, clickable moves)
  - Deployment to Azure (backend + frontend)

- [ ] **v1.0.0 — Full Release**
  - Polished web app with matchmaking, AI opponent, and leaderboards
  - Production-grade deployment (CI/CD, cloud hosting)
   
