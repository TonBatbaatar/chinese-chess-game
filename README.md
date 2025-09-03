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

## Requirements:

- [.NET 6 SDK](https://dotnet.microsoft.com/download) (or newer)
- Both machines or terminals should be on the same network or use localhost for local testing.
- Open firewall/antivirus settings if needed (especially for server).
- Use the same executable or project on both ends.

## Clone & Build
```bash
git clone https://github.com/TonBatbaatar/chinese-chess-game.git
cd chinese-chess-game/ChineseChess.ConsoleSolution
dotnet build
```

## How to Run Multi-Player Game:

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

## 🛠️ Tech Stack
- Language: C#
- Framework: .NET Core
- Networking: System.Net.Sockets
- Architecture: Client–Server model
