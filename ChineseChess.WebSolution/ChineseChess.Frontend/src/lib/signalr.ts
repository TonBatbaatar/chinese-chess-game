import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';

// Creates a new SignalR connection to the game hub
export function createConnection(): HubConnection {
  return new HubConnectionBuilder()
    .withUrl('/hub/game') // relative URL → Vite proxy sends to backend
    .withAutomaticReconnect()
    .build();
}
