# Chinese Chess (Xiangqi) — Console Edition · v0.1.0

This is the first public release of my Chinese Chess (Xiangqi) project.  
It’s a **C# .NET console application** with:

- Rule-checked **piece movement validation**
- Turn-based **Red vs Black**
- **Online multiplayer** via a simple **client–server** model using `System.Net.Sockets`
- Text (ASCII) board rendering in the terminal

> Newer versions evolve into a desktop GUI and a web app, but this repo preserves the original console experience.

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

## How to Run:

### 🔴 Terminal 1: Host (Server)
