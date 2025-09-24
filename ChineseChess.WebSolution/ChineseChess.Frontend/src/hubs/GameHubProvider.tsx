import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

type BoardDto = { rows: number; cols: number; cells: any[]; currentPlayer: "Red" | "Black" };
type JoinedPayload = { connId: string; redEmail: string; blackEmail: string };

type GameHubApi = {
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
    onMoveMade: (h: (m: any, b: BoardDto) => void) => () => void;
    onJoined: (h: (p: JoinedPayload) => void) => () => void;
    onPlayerDisconnected: (h: (color: string) => void) => () => void;
    onMatchEnded: (h: (winnerEmail: string, reason: string) => void) => () => void;
    onSpectatorJoined: (h: (dto: BoardDto, redID: string, blackID : string) => void) => () => void;
    onClockUpdate: (h: (redClock: string, blackClock : string) => void) => () => void;
    onMessage: (h: (playerID: string, message : string, time: string) => void) => () => void;
    onDrawOffer: (h: (color: string) => void) => () => void;
    onGameDraw: (h: (reason: string) => void) => () => void;
    // ... add others as needed
};

const Ctx = createContext<GameHubApi | null>(null);

export const GameHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const connRef = useRef<HubConnection | null>(null);
    const [ready, setReady] = useState(false);
    
    const buildIfNeeded = () => {
        if (connRef.current) return;
        const conn = new HubConnectionBuilder()
        .withUrl("/hub/game", { withCredentials: true }) // cookie auth; if JWT, use accessTokenFactory
        .withAutomaticReconnect()
        .build();
        
        // wire events to listener registries
        conn.on("State", (dto: BoardDto, color: string) => listenersRef.current.State.forEach(h => h(dto, color)));
        conn.on("MoveMade", (m: any, dto: BoardDto) => listenersRef.current.MoveMade.forEach(h => h(m, dto)));
        conn.on("Joined", (connId: string, redEmail: string, blackEmail: string) => {
            // console.log("[Handler fired] Joined event received", { connId, redEmail, blackEmail }); // debug code
            const payload: JoinedPayload = { connId, redEmail, blackEmail };
            // console.log("Dispatching to", listenersRef.current.Joined.size, "Joined listeners");
            listenersRef.current.Joined.forEach((h) => {
                // console.log(`--> Invoking listener #${i}`); // debug code
                h(payload);
            });
        });
        conn.on("PlayerDisconnected", (color: string) => listenersRef.current.PlayerDisconnected.forEach(h => h(color)));
        conn.on("MatchEnded", (winnerEmail: string, reason : string) => {
            console.log("[Handler fired] Match Ended event received", winnerEmail, reason); // debug code
            listenersRef.current.MatchEnded.forEach(h => h(winnerEmail, reason));
        });
        conn.on("SpectatorJoined", (dto: BoardDto, redID: string, blackID : string) => listenersRef.current.SpectatorJoined.forEach(h => h(dto, redID, blackID)));
        conn.on("ClockUpdate", (redClock: string, blackClock : string) => listenersRef.current.ClockUpdate.forEach(h => h(redClock, blackClock)));
        conn.on("Message", (playerID: string, message : string, time: string) => listenersRef.current.Message.forEach(h => h(playerID, message, time)));
        conn.on("DrawOffer", (color: string) => listenersRef.current.DrawOffer.forEach(h => h(color)));
        conn.on("GameDraw", (reason: string) => listenersRef.current.GameDraw.forEach(h => h(reason)));


        connRef.current = conn;
    };
    
    const listenersRef = useRef({
        State: new Set<(b: BoardDto, color: string) => void>(),
        MoveMade: new Set<(m: any, b: BoardDto) => void>(),
        Joined: new Set<(p: JoinedPayload) => void>(),
        PlayerDisconnected: new Set<(color: string) => void>(),
        MatchEnded: new Set<(winnerEmail: string, reason: string) => void>(),
        SpectatorJoined: new Set<(dto: BoardDto, redID: string, blackID : string) => void>(),
        ClockUpdate: new Set<(redClock: string, blackClock : string) => void>(),
        Message: new Set<(playerID: string, message : string, time: string) => void>(),
        DrawOffer: new Set<(color: string) => void>(),
        GameDraw: new Set<(reason: string) => void>(),
    });
    
    const api: GameHubApi = useMemo(() => ({
        ready,
        start: async () => {
            buildIfNeeded();
            if (ready) return;
            await connRef.current!.start();
            setReady(true);
        },
        stop: async () => {
            if (!connRef.current) return;
            await connRef.current.stop();
            setReady(false);
            connRef.current = null; // drop, so next start gets a fresh handshake (good after login)
        },
        ensureStarted: async () => {
            if (!ready) await api.start();
        },
        createGame: async (tc, guestID) => {
            await api.ensureStarted();
            return connRef.current!.invoke<{ gameId: string; currentTurn: string; board: BoardDto; seat:string }>("CreateGame", tc, guestID);
        },
        joinGame: async (roomId, guestID) => {
            await api.ensureStarted();
            return connRef.current!.invoke<boolean>("JoinGame", roomId, guestID);
        },
        SendChatMessage: async (roomId, message) => {
            await api.ensureStarted();
            return connRef.current!.send("SendChatMessage", roomId, message);
        },
        Resign: async (roomId) => {
            await api.ensureStarted();
            return connRef.current!.send("Resign", roomId);
        },
        OfferDraw: async (roomId) => {
            await api.ensureStarted();
            return connRef.current!.send("OfferDraw", roomId);
        },
        OfferResponse : async (roomId, accept) => {
            await api.ensureStarted();
            return connRef.current!.send("OfferResponse", roomId, accept);
        },
        makeMove: async (roomId, from, to) => {
            await api.ensureStarted();
            return connRef.current!.invoke<{ ok: boolean; error?: string }>("MakeMove", roomId, from, to);
        },
        onState: (h) => { 
            listenersRef.current.State.add(h); 
            return () => listenersRef.current.State.delete(h); 
        },
        onMoveMade: (h) => { 
            listenersRef.current.MoveMade.add(h); 
            return () => listenersRef.current.MoveMade.delete(h); 
        },
        onJoined: (h) => {
            listenersRef.current.Joined.add(h);
            return () => listenersRef.current.Joined.delete(h);
        },
        onPlayerDisconnected: (h) => {
            listenersRef.current.PlayerDisconnected.add(h);
            return () => listenersRef.current.PlayerDisconnected.delete(h);
        },
        onMatchEnded: (h) => {
            listenersRef.current.MatchEnded.add(h);
            return () => listenersRef.current.MatchEnded.delete(h);
        },
        onSpectatorJoined: (h) => {
            listenersRef.current.SpectatorJoined.add(h);
            return () => listenersRef.current.SpectatorJoined.delete(h);
        },
        onClockUpdate: (h) => {
            listenersRef.current.ClockUpdate.add(h);
            return () => listenersRef.current.ClockUpdate.delete(h);
        },
        onMessage: (h) => {
            listenersRef.current.Message.add(h);
            return () => listenersRef.current.Message.delete(h);
        },
        onDrawOffer: (h) => {
            listenersRef.current.DrawOffer.add(h);
            return () => listenersRef.current.DrawOffer.delete(h);
        },
        onGameDraw: (h) => {
            listenersRef.current.GameDraw.add(h);
            return () => listenersRef.current.GameDraw.delete(h);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [ready]);
    
    return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
};

export const useGameHub = () => {
    // const instanceId = useRef(Math.random().toString(36).slice(2)); // debug code
    // console.log("[Provider instance]", instanceId.current); // debug code
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useGameHub must be used within GameHubProvider");
    return ctx;
};
