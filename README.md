# Chinese Chess (Xiangqi) — Console Edition · v0.1.0

This is the first public release of my Chinese Chess (Xiangqi) project.  
It’s a **C# .NET console application** with:

- Rule-checked **piece movement validation**
- Turn-based **Red vs Black**
- **Online multiplayer** via a simple **client–server** model using `System.Net.Sockets`
- Text (ASCII) board rendering in the terminal

> Newer versions evolve into a web app, but this repo preserves the original console experience.

---

## Features

- ✅ Legal move enforcement for all Xiangqi pieces (General, Advisors, Elephants, Horses, Chariots, Cannons, Soldiers)
- ✅ Turn order and basic check/checkmate detection
- ✅ Socket-based networking (server + client) for remote play
- ✅ Clear, minimal console UI

---

## Requirements:

- [.NET 6 SDK](https://dotnet.microsoft.com/download) (or newer)
- Both machines or terminals should be on the same network or use localhost for local testing.
- Open firewall/antivirus settings if needed (especially for server).
- Use the same executable or project on both ends.

## Clone & Build
```bash
git clone https://github.com/TonBatbaatar/chinese-chess-game.git
cd chinese-chess-game
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
