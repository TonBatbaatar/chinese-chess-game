import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import TopBar from "../components/matchroom/TopBar";
import PlayerCard from "../components/matchroom/PlayerCard";
import ActionPanel from "../components/matchroom/ActionPanel";
import Board, { type Coord, type BoardProps } from "../components/matchroom/Board";
import MoveList from "../components/matchroom/MoveList";
import Chat from "../components/matchroom/Chat";
import { useGameHub } from "../hubs/GameHubProvider";

type Cell = { r: number; c: number; type: string; owner: "Red" | "Black" };
type BoardDto = { rows: number; cols: number; cells: Cell[]; currentPlayer: "Red" | "Black" };

export type MatchRoomProps = {
    roomId: string;
    isCreator?: boolean; // purely for UI labeling; no hub calls
    pendingJoin?: boolean;
    boardDto?: BoardDto;
    redPlayer: { id: string; name: string; rating?: number };
    blackPlayer: { id: string; name: string; rating?: number };
    timeControl?: string;
    getLegalMoves?: (from: Coord, board: string[][], sideToMove: "Red" | "Black") => Coord[];
    onOfferDraw?: () => void;
    onResign?: () => void;
    onBack?: () => void;
};

const MatchRoom: React.FC<MatchRoomProps> = ({
    roomId,
    pendingJoin = false,
    boardDto = null,
    redPlayer: redPlayerProp,
    blackPlayer: blackPlayerProp,
    timeControl = "10|0",
    getLegalMoves,
    onOfferDraw,
    onResign,
    onBack,
}) => {
    const { onState, onMoveMade, makeMove, joinGame, onJoined, onPlayerDisconnected, onMatchEnded, onSpectatorJoined, onClockUpdate } = useGameHub(); // <-- reuse existing connection
    
    const [status, setStatus] = useState<string>(`Low-latency • ${timeControl}`);
    const [error, setError] = useState<string | null>(null);
    
    const [board, setBoard] = useState<string[][]>(defaultStartingBoard());
    const [selected, setSelected] = useState<Coord | null>(null);
    const [sideToMove, setSideToMove] = useState<"Red" | "Black">("Red");
    const [moves, setMoves] = useState<Array<{ from: Coord; to: Coord; piece: string }>>([]);
    
    const [redName, setRedName] = useState<string>(redPlayerProp.name);
    const [blackName, setBlackName] = useState<string>(blackPlayerProp.name);

    const [myColor, setMyColor] = useState<"Red" | "Black">("Red");
    const [isSpectate, setIsSpectate] = useState<boolean>(false);

    const [redTimer, setRedTimer] = useState<string>("10:00");
    const [blackTimer, setBlackTimer] = useState<string>("10:00");
    
    
    // Subscribe to hub message listeners
    useEffect(() => {
        const offState = onState((dto: BoardDto, color: string) => {
            applyServerState(dto);
            setMyColor(color == "Red" ? "Red" : "Black");
        });
        
        const offMoveMade = onMoveMade((_m: any, dto: BoardDto) => {
            applyServerState(dto);
        });
        
        const offJoined = onJoined(({ redEmail, blackEmail }) => {
            // console.log("[Room] Joined received", redEmail, blackEmail);
            setRedName(redEmail ?? "Red");
            setBlackName(blackEmail ?? "Black");
        });

        const offPlayerDisconnected = onPlayerDisconnected((color: string) => {
            if (color == "Red") setRedName("Disconnected, Auto abort in 10 sec...");
                else setBlackName("Disconnected, Auto abort in 10 sec...");
        });

        const offMatchEnded = onMatchEnded((winnerEmail: string, reason: string) => {
            setStatus(`Player ${winnerEmail} won by ${reason}`);
        });

        const offSpectatorJoined = onSpectatorJoined((dto: BoardDto, redID: string, blackID : string) => {
            setRedName(redID ?? "Red");
            setBlackName(blackID ?? "Black");
            applyServerState(dto);
            setSelected(null); // ensure no highlight remains
            setIsSpectate(true);
        });

        const offClockUpdate = onClockUpdate((redClock: string, blackClock: string) => {
            setRedTimer(redClock);
            setBlackTimer(blackClock);
        });
        
        (async () => {
            if (pendingJoin) {
                await joinGame(roomId!, blackName);
            }
        })();
        
        return () => {
            offState();
            offMoveMade();
            offJoined();
            offPlayerDisconnected();
            offMatchEnded();
            offSpectatorJoined();
            offClockUpdate;
        };
    }, [roomId, onState, onMoveMade, onJoined, joinGame, onPlayerDisconnected, onMatchEnded, onSpectatorJoined, onClockUpdate]);
    
    
    // render board to creator for the first time
    useEffect(() => {
        if (boardDto) {
            console.log("initial board rendered!", boardDto.currentPlayer);
            applyServerState(boardDto);
        }
    }, [boardDto]);
    
    
    // update board information
    function applyServerState(dto: BoardDto) {
        setError(null);
        setBoard(boardFromDto(dto));
        setSideToMove(dto.currentPlayer);
        setSelected(null);
        setStatus(`Low-latency • ${timeControl} • ${dto.currentPlayer === "Red" ? "Red" : "Black"} to move`);
    }
    
    
    // get legal moves
    const legalTargets: Coord[] = useMemo(() => {
        if (!selected) return [];
        if (getLegalMoves) return getLegalMoves(selected, board, sideToMove);
        return [];
    }, [selected, board, sideToMove, getLegalMoves]);
    
    
    // handle move
    const handleSquareClick: BoardProps["onSquareClick"] = async (x, y) => {
        if (isSpectate) return; // spectators can't interact

        if (myColor != sideToMove) {
            console.log(myColor); // debug code
            setError("Not your turn!");
            return;
        }
        // selected square
        const piece = board[y][x];
        console.log(piece); // test code
        
        // validate click owen piece
        if (!selected) {
            if (piece != "bNone" && ((sideToMove === "Red" && piece.startsWith("r")) || (sideToMove === "Black" && piece.startsWith("b")))) {
                setSelected({ x, y });
            }
            return;
        }
        
        const src = board[selected.y][selected.x];
        if (piece != "bNone" && src && piece[0] === src[0]) {
            setSelected({ x, y });
            return;
        }
        
        if (getLegalMoves) {
            const ok = legalTargets.some((c) => c.x === x && c.y === y);
            if (!ok) { setSelected(null); return; }
        }
        
        try {
            const fromAlg = toAlgebraic(selected);
            const toAlg = toAlgebraic({ x, y });
            // console.log("trying to move ", fromAlg, "to position ", toAlg); // debug code
            const res = await makeMove(roomId, fromAlg, toAlg); // no join here
            if (!res?.ok) { setError(res?.error ?? "Move rejected"); return; }
            setMoves((m) => [...m, { from: { ...selected }, to: { x, y }, piece: src }]);
            setSelected(null);
        } catch (e) {
            setError(String(e));
        }
    };

    const boardSelected   = isSpectate ? null : selected;
    const boardTargets    = isSpectate ? [] : legalTargets;
    const onSquareClickRO = isSpectate ? () => {} : handleSquareClick;
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <TopBar roomId={roomId} onBack={onBack} statusText={status} />
        
        <section className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <div className={`grid gap-6 ${isSpectate ? "lg:grid-cols-[260px_minmax(0,1fr)_260px]" : "lg:grid-cols-3"}`}>
        <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
            <PlayerCard
                label="Black"
                player={{ ...blackPlayerProp, name: blackName }}
                timer={isSpectate ? undefined : blackTimer}
                active={sideToMove === "Black"}
            />

            {!isSpectate && (
                <ActionPanel
                onOfferDraw={onOfferDraw}
                onResign={onResign}
                onFlipBoard={() => {}}
                onSettings={() => {}}
                />
            )}

            <PlayerCard
                label="Red"
                player={{ ...redPlayerProp, name: redName }}
                timer={isSpectate ? undefined : redTimer}
                active={sideToMove === "Red"}
            />
        </motion.aside>
        
        <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="flex items-center justify-center">
        <Board
            board={board}
            selected={boardSelected}
            legalTargets={boardTargets}
            sideToMove={sideToMove}
            onSquareClick={onSquareClickRO}
        />
        </motion.main>
        
        <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-4">
            <MoveList moves={moves} />
            {!isSpectate && error && (
                <div className="rounded-xl border border-red-800 bg-red-950/30 p-3 text-sm text-red-200">
                    {error}
                </div>
            )}
            {!isSpectate && <Chat />}
        </motion.aside>
        </div>
        </section>
        </div>
    );
};

export default MatchRoom;

/* ------------------------------ Utils -------------------------------- */
function boardFromDto(dto: BoardDto): string[][] {
    const grid: string[][] = Array.from({ length: dto.rows }, () => Array.from({ length: dto.cols }, () => ""));
    for (const cell of dto.cells) {
        const prefix = cell.owner === "Red" ? "r" : "b";
        grid[cell.r][cell.c] = prefix + (cell.type ?? "");
    }
    return grid;
}
function defaultStartingBoard(): string[][] {
    return Array.from({ length: 10 }, () => Array.from({ length: 9 }, () => ""));
}


function toAlgebraic(c: Coord): string {
    const files = "ABCDEFGHI";
    const file = files[c.x] ?? "?";
    const rank = c.y + 1; // top row y=0 -> 1; bottom y=9 -> 10
    return `${file}${rank}`;
}
