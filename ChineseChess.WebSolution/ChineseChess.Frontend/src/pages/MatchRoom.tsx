import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import TopBar from "../components/matchroom/TopBar";
import PlayerCard from "../components/matchroom/PlayerCard";
import ActionPanel from "../components/matchroom/ActionPanel";
import Board, { type Coord, type BoardProps } from "../components/matchroom/Board";
import MoveList from "../components/matchroom/MoveList";
import Chat, { type ChatProps } from "../components/matchroom/Chat";
import { useGameHub } from "../hubs/GameHubProvider";
import Modal from "../components/matchroom/Modal";

type Cell = { r: number; c: number; type: string; owner: "Red" | "Black" };
type BoardDto = { rows: number; cols: number; cells: Cell[]; currentPlayer: "Red" | "Black" };

export type ChatMessage = {
    id: string
    playerId: string;
    text: string;
    time: string;
};

export type MatchRoomProps = {
    roomId: string;
    myName: string;
    isCreator?: boolean; // purely for UI labeling; no hub calls
    pendingJoin?: boolean;
    boardDto?: BoardDto;
    redPlayer: { id: string; name: string; rating?: number };
    blackPlayer: { id: string; name: string; rating?: number };
    timeControl?: string;
    getLegalMoves?: (from: Coord, board: string[][], sideToMove: "Red" | "Black") => Coord[];
    onBack?: () => void;
};

const MatchRoom: React.FC<MatchRoomProps> = ({
    roomId,
    myName,
    pendingJoin = false,
    boardDto = null,
    redPlayer: redPlayerProp,
    blackPlayer: blackPlayerProp,
    timeControl = "10|0",
    getLegalMoves,
    onBack,
}) => {
    const { onState, onMoveMade, makeMove, joinGame, onJoined, onPlayerDisconnected, onMatchEnded, 
        onSpectatorJoined, onClockUpdate, SendChatMessage, onMessage, Resign, OfferDraw, onDrawOffer, OfferResponse, onGameDraw
    } = useGameHub();
    
    const [status, setStatus] = useState<string>(`Low-latency • ${timeControl}`);
    const [error, setError] = useState<string | null>(null);
    
    const [board, setBoard] = useState<string[][]>(defaultStartingBoard());
    const [selected, setSelected] = useState<Coord | null>(null);
    const [sideToMove, setSideToMove] = useState<"Red" | "Black">("Red");
    const [moves, setMoves] = useState<Array<{ from: Coord; to: Coord; piece: string }>>([]);
    
    const [redName, setRedName] = useState<string>(redPlayerProp.name);
    const [blackName, setBlackName] = useState<string>(blackPlayerProp.name);
    
    const [isSpectate, setIsSpectate] = useState<boolean>(false);
    
    const [redTimer, setRedTimer] = useState<string>("10:00");
    const [blackTimer, setBlackTimer] = useState<string>("10:00");
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [showOffer, setShowOffer] = useState(false);

    const [isGameOver, setIsGameOver] = useState(false);
    const [showResultOverlay, setShowResultOverlay] = useState(false);
    const [result, setResult] = useState<{
        type: "win" | "draw" | null;
        winner?: string;   // winner email or name
        reason?: string;
    }>({ type: null });
    
    
    // Subscribe to hub message listeners
    useEffect(() => {
        const offState = onState((dto: BoardDto) => {
            applyServerState(dto);
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
            setIsGameOver(true); // ← freeze board & controls
            setShowOffer(false); // ← ensure modal closes
            setSelected(null); // ← clear any highlights
            setResult({ type: "win", winner: winnerEmail, reason });
            setShowResultOverlay(true); 
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
        
        const offMessage = onMessage((playerID: string, message : string, time: string) => {
            setMessages(prev => [
                ...prev,
                {
                    id: `${time}-${playerID}-${prev.length}`,
                    playerId: playerID,
                    text: message,
                    time,
                },
            ]);
        });

        const offDrawOffer = onDrawOffer((color: string) => {
            if (myName == color){
                setShowOffer(true);
            }
        });

        const offGameDraw = onGameDraw ((reason: string) => {
            setStatus(`Game draw by ${reason}`);
            setIsGameOver(true); // ← freeze board & controls
            setShowOffer(false); // ← ensure modal closes
            setSelected(null); // ← clear any highlights
            setResult({ type: "draw", reason });
            setShowResultOverlay(true); 
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
            offClockUpdate();
            offMessage();
            offDrawOffer();
            offGameDraw();
        };
    }, [roomId, onState, onMoveMade, onJoined, joinGame, onPlayerDisconnected, onMatchEnded, onSpectatorJoined, onClockUpdate, onMessage, onDrawOffer, onGameDraw, isGameOver]);
    
    
    // render board to creator for the first time
    useEffect(() => {
        if (boardDto) {
            console.log("initial board rendered!", boardDto.currentPlayer);
            applyServerState(boardDto);
        }
    }, [boardDto]);
    
    
    // update board information
    function applyServerState(dto: BoardDto) {
        const nextBoard = boardFromDto(dto);
        setBoard(nextBoard);
        setSideToMove(dto.currentPlayer);
        setSelected(null);
        if (!isGameOver) {
            setStatus(`Low-latency • ${timeControl} • ${dto.currentPlayer === "Red" ? "Red" : "Black"} to move`);
        }
    }
    
    
    // get legal moves
    const legalTargets: Coord[] = useMemo(() => {
        if (!selected) return [];
        if (getLegalMoves) return getLegalMoves(selected, board, sideToMove);
        return [];
    }, [selected, board, sideToMove, getLegalMoves]);
    
    
    // handle move
    const handleSquareClick: BoardProps["onSquareClick"] = async (x, y) => {
        if (isSpectate || isGameOver) return; // spectators can't interact
        
        var sideToMoveName = "";
        if(sideToMove==="Red"){
            sideToMoveName = redName;
        }else{
            sideToMoveName = blackName;
        }

        if (myName != sideToMoveName) {
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

    const handleSend: ChatProps["onSend"] = async (text) => {
        if (!text.trim()) return;
        try {
            await Promise.resolve(SendChatMessage(roomId, text));
        } catch (e) {
            // Optional: append a system error message
            const now = new Date().toISOString();
            setMessages(prev => [
                ...prev,
                { id: `${now}-system-${prev.length}`, playerId: "system", text: "Failed to send.", time: now },
            ]);
        }
    };
    
    const boardLocked = isSpectate || isGameOver;

    const boardSelected   = boardLocked ? null : selected;
    const boardTargets    = boardLocked ? []   : legalTargets;
    const onSquareClickRO = boardLocked ? () => {} : handleSquareClick;
    
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
        
        {!isSpectate && !isGameOver && (
            <ActionPanel
            onOfferDraw={() => OfferDraw(roomId)}
            onResign={() => Resign(roomId)}
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
        
        {/* <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="flex items-center justify-center">
        <Board
        board={board}
        selected={boardSelected}
        legalTargets={boardTargets}
        sideToMove={sideToMove}
        onSquareClick={onSquareClickRO}
        />
        </motion.main> */}

        {/* Center column — Board with fixed 9:10 aspect and overlay */}
        <motion.main
        initial={{ opacity: 0 , y: 12 }}
        animate={{ opacity: 1 , y: 0}}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="flex items-center justify-center"
        >
        <div className="relative inline-block w-[min(92vw,720px)]">
            {/* Reserve correct height using 9:10 aspect (files: 9, ranks: 10) */}
            <div className="aspect-[9/10]" />
            {/* Board fills the reserved box */}
            <div className="absolute inset-0">
            <Board
                board={board}
                selected={boardSelected}
                legalTargets={boardTargets}
                sideToMove={sideToMove}
                onSquareClick={onSquareClickRO}
            />
            </div>

            {/* Endgame overlay */}
            {isGameOver && showResultOverlay && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 grid place-items-center bg-slate-950/70 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
            >
                <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
                className="mx-4 w-[min(92vw,680px)] rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl"
                >
                <div className="flex items-center gap-3">
                    <div
                    className={`rounded-xl p-2 ${
                        result?.type === "win" ? "bg-amber-500/15" : "bg-sky-500/15"
                    }`}
                    >
                    <span className="text-2xl">{result?.type === "win" ? "🏆" : "🤝"}</span>
                    </div>
                    <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                        {result?.type === "win"
                        ? `${result?.winner ?? "Winner"} wins`
                        : "Game drawn"}
                    </h2>
                    <p className="text-sm text-slate-300">
                        {result?.reason ? `Result: ${result.reason}` : "Game over"}
                    </p>
                    </div>
                </div>

                <div className="mt-5 rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 text-sm text-slate-200">
                    <ul className="space-y-1">
                    <li>
                        <span className="text-slate-400">Time control:</span> {timeControl}
                    </li>
                    <li>
                        <span className="text-slate-400">Moves played:</span> {moves.length}
                    </li>
                    </ul>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                    onClick={() => setShowResultOverlay(false)}
                    className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
                    >
                    Return to match room
                    </button>
                    <button
                    onClick={onBack}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                    >
                    Leave room
                    </button>
                    <button
                    onClick={() =>
                        navigator.clipboard.writeText(
                        `${result?.type === "win" ? `Winner: ${result?.winner}\n` : "Draw\n"}Reason: ${
                            result?.reason ?? "Game over"
                        }\nMoves: ${moves.length}`
                        )
                    }
                    className="rounded-xl border border-slate-700/80 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
                    >
                    Copy result
                    </button>
                </div>
                </motion.div>
            </motion.div>
            )}
        </div>
        </motion.main>
        
        <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-4">
        <MoveList moves={moves} />
        {!isSpectate && error && (
            <div className="rounded-xl border border-red-800 bg-red-950/30 p-3 text-sm text-red-200">
            {error}
            </div>
        )}
        {!isSpectate && <Chat
            selfId={myName}
            messages={messages}
            onSend={handleSend}
        />}
        </motion.aside>
        </div>
        </section>

        {/* Draw offer confirm dialog */}
        <Modal
        open={showOffer && !isGameOver}
        title="Confirm Draw Offer"
        onClose={() => setShowOffer(false)}
        actions={
            <>
            <button
                onClick={() => {setShowOffer(false); OfferResponse(roomId, false);}}
                className="rounded-lg border border-slate-700/80 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
            >
                Decline
            </button>
            <button
                onClick={() => { setShowOffer(false); OfferResponse(roomId, true); }}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
            >
                Accept
            </button>
            </>
        }
        >
        Opponent offered draw, accept draw?
        </Modal>

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