export type Cell = { r: number; c: number; type: string; owner: "Red" | "Black" };
export type BoardDto = { rows: number; cols: number; cells: Cell[]; currentPlayer: "Red" | "Black" };
export type JoinedPayload = { connId: string; redEmail: string; blackEmail: string };

export type GameHubApi = {
    ready: boolean;
    start: () => Promise<void>;
    stop: () => Promise<void>;
    ensureStarted: () => Promise<void>;
    // hub methods
    createGame: (tc: string, guestID: string) => Promise<{ gameId: string, board: BoardDto }>;
    joinGame: (roomId: string, guestID: string) => Promise<boolean>;
    makeMove: (roomId: string, from: string, to: string) => Promise<{ ok: boolean; error?: string }>;
    SendChatMessage: (roomId: string, message: string) => void;
    Resign : (roomId: string) => void;
    OfferDraw : (roomId: string) => void;
    OfferResponse: (roomId: string, accept: boolean) => void;
    // subscriptions
    onState: (h: (b: BoardDto, color: string) => void) => () => void;
    onMoveMade: (h: (b: BoardDto) => void) => () => void;
    onJoined: (h: (p: JoinedPayload) => void) => () => void;
    onPlayerDisconnected: (h: (color: string) => void) => () => void;
    onMatchEnded: (h: (winnerEmail: string, reason: string) => void) => () => void;
    onSpectatorJoined: (h: (dto: BoardDto, redID: string, blackID : string) => void) => () => void;
    onClockUpdate: (h: (redClock: string, blackClock : string) => void) => () => void;
    onMessage: (h: (playerID: string, message : string, time: string) => void) => () => void;
    onDrawOffer: (h: (color: string) => void) => () => void;
    onGameDraw: (h: (reason: string) => void) => () => void;
};