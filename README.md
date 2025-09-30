[![Azure Static Web Apps CI/CD](https://github.com/TonBatbaatar/chinese-chess-game/actions/workflows/azure-static-web-apps-ashy-grass-0231f1603.yml/badge.svg)](https://github.com/TonBatbaatar/chinese-chess-game/actions/workflows/azure-static-web-apps-ashy-grass-0231f1603.yml)
[![Build and deploy ASP.Net Core app to Azure Web App - ChineseChess-Api](https://github.com/TonBatbaatar/chinese-chess-game/actions/workflows/main_chinesechess-api.yml/badge.svg)](https://github.com/TonBatbaatar/chinese-chess-game/actions/workflows/main_chinesechess-api.yml)
[![CI — WebSolution (.NET API + Frontend)](https://github.com/TonBatbaatar/chinese-chess-game/actions/workflows/ci.yml/badge.svg)](https://github.com/TonBatbaatar/chinese-chess-game/actions/workflows/ci.yml)
[![Azure Static Web Apps](https://img.shields.io/badge/Deployed-Azure-blue?logo=microsoft-azure)](https://ashy-grass-0231f1603.2.azurestaticapps.net)

# Chinese Chess (Xiangqi) — Web App

## 🎮 [Click here to play!](https://ashy-grass-0231f1603.2.azurestaticapps.net)  
[![Play Guide](https://img.shields.io/badge/Play%20Guide-Instructions-blue)](#-how-to-play-online)

**Status:** `v1.0.0`  
**Stack:** ASP.NET Core · EF Core · SignalR · React (Vite + TS) · TailwindCSS · Azure  

## 🌐 Live Services 

- API: [Backend Server](chinesechess-api-b9egengqahddhphn.uksouth-01.azurewebsites.net)
- Web: [Frontend Client](https://ashy-grass-0231f1603.2.azurestaticapps.net)

## Project Management

- GitHub **Issues** for tasks/bugs · [Issues](https://github.com/TonBatbaatar/chinese-chess-game/issues)
- GitHub **Milestones** for version planning · [Milestones](https://github.com/TonBatbaatar/chinese-chess-game/milestones)
- GitHub **Project Board**: [Roadmap to v1.0.0](https://github.com/users/TonBatbaatar/projects/1)

## Roadmap

- [x] v0.1.0 — Console prototype (rules engine, local & TCP play)
- [x] v0.2.0 — Web skeleton (ASP.NET Core + SignalR + React client)
- [x] v0.3.0 — Rules engine complete
- [x] v0.4.0 — Stable multiplayer
- [x] v0.5.0 — Persistence & accounts
- [x] v0.6.0 — Frontend polish
- [x] v0.7.0 — Security & auth
- [x] v0.8.0 — Observability & CI/CD
- [x] v0.9.0 — Pre-production hardening
- [x] v1.0.0 — Production launch

## Run locally

- API: `dotnet run` in `ChineseChess.Api`
- Web: `npm install && npm run dev` in `ChineseChess.Frontend`

## License

MIT

---

## 🚀 Getting Started

## 🎲 How to Play Online

1. **Register an account** — or continue as a **guest**  
2. **Sign in** — or proceed as **guest**  
3. **Create a room** or **join an existing one**  
   - Room number appears in the **top-left corner**  
   - Or simply share the **URL** with your friend  
4. ✅ Start playing and enjoy the game!

---


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

## How to Run a Web App Chess Game Locally:

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
