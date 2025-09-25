# Chinese Chess (Xiangqi) — Web App

**Status:** v0.6.0 (in development)  
**Stack:** ASP.NET Core · EF Core · SignalR · React (Vite + TS) · Tailwind · Azure

## Live (coming soon)

- API: _(to be added)_
- Web: _(to be added)_

## Roadmap

- [x] v0.1.0 — Console prototype (rules engine, local & TCP play)
- [x] v0.2.0 — Web skeleton (ASP.NET Core + SignalR + React client)
- [x] v0.3.0 — Rules engine complete
- [x] v0.4.0 — Stable multiplayer
- [x] v0.5.0 — Persistence & accounts
- [x] v0.6.0 — Frontend polish
- [ ] v0.7.0 — Security & auth
- [ ] v0.8.0 — Observability & CI/CD
- [ ] v0.9.0 — Pre-production hardening
- [ ] v1.0.0 — Production launch

## Project Management

- GitHub **Issues** for tasks/bugs
- GitHub **Milestones** for version planning
- GitHub **Project Board**: [Roadmap to v1.0.0](https://github.com/users/TonBatbaatar/projects/1)

## Run locally

- API: `dotnet run` in `ChineseChess.Api`
- Web: `pnpm install && pnpm dev` in `ChineseChess.Frontend`

## License

MIT

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
