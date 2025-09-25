import React, { useEffect, useMemo, useState } from "react";
import UnderDevelopmentDialog from "../components/UnderDevelopmentDialog";

import TopNav from "../components/home/TopNav";

/* =========================
Types
========================= */
export type ReplayMeta = {
    id: string;
    redUserId?: string;
    blackUserId?: string;
    timeControl: string;   // "10|0"
    isFinished: boolean;
    createdAtUtc: string;  // DateTime → ISO string
    updatedAtUtc: string;
    moveCount: number;
    result : string;
};

/* A minimal replay data shape for the viewer */
export type ReplayData = {
    id: string;
    redName: string;
    blackName: string;
    timeControl: string;
    result : string;
};

export type ReplayPageProps = {
    replays?: ReplayMeta[];     // optional preloaded page
    total?: number;             // total count (for pagination)
    pageSize?: number;          // default 12
    onQuery?: (opts: { q: string; tag: string; tc: string; page: number; pageSize: number }) => Promise<{ items: ReplayMeta[]; total: number }>;
    onOpenReplay?: (id: string) => Promise<ReplayData>; // returns full replay
    onExportPgn?: (id: string) => Promise<void> | void;
    onShare?: (id: string) => Promise<void> | void;
};

/* =========================
Page
========================= */
const ReplayPage: React.FC<ReplayPageProps> = ({
    replays,
    total,
    pageSize = 12,
    onQuery,
    onOpenReplay,
    onExportPgn,
    onShare,
}) => {
    
    // -------- search/filter/pagination --------
    const [q, setQ] = useState("");
    const [tag, setTag] = useState<"all" | "ranked" | "friendly">("all");
    const [tc, setTc] = useState<"any" | "3|2" | "5|5" | "10|0" | "15|10">("any");
    const [page, setPage] = useState(1);
    
    // -------- data state --------
    const [items, setItems] = useState<ReplayMeta[]>(() => replays ?? []);
    const [count, setCount] = useState<number>(() => total ?? (replays?.length ?? 0));
    const [loading, setLoading] = useState(false);
    
    // -------- viewer state --------
    const [viewer, setViewer] = useState<ReplayData | null>(null);
    const [ply, setPly] = useState(0); // current half-move index
    const [showUD, setShowUD] = useState<false | string>(false);
    
    // Load data when filters/pagination change (if onQuery provided)
    useEffect(() => {
        let ignore = false;
        (async () => {
            if (!onQuery) return;
            setLoading(true);
            try {
                const res = await onQuery({
                    q,
                    tag: tag === "all" ? "" : tag,
                    tc: tc === "any" ? "" : tc,
                    page,
                    pageSize,
                });
                if (!ignore) {
                    setItems(res.items);
                    setCount(res.total);
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => { ignore = true; };
    }, [q, tag, tc, page, pageSize, onQuery]);
    
    // Fallback sample data if no onQuery and nothing passed
    const sample = useMemo<ReplayMeta[]>(() => {
        if (items.length) return items;
        if (replays?.length) return replays;
        return [
            {
                id: "r1",
                redUserId: "Liang",
                blackUserId: "Chen",
                timeControl: "10|0",
                isFinished: true,
                createdAtUtc: new Date().toISOString(),
                updatedAtUtc: new Date().toISOString(),
                moveCount: 42,
                result: "1-0",
            },
            {
                id: "r2",
                redUserId: "Aiko",
                blackUserId: "Bao",
                timeControl: "5|5",
                isFinished: true,
                createdAtUtc: new Date().toISOString(),
                updatedAtUtc: new Date().toISOString(),
                moveCount: 58,
                result: "1-0",
            },
            {
                id: "r3",
                redUserId: "Minh",
                blackUserId: "Tran",
                timeControl: "3|2",
                isFinished: true,
                createdAtUtc: new Date().toISOString(),
                updatedAtUtc: new Date().toISOString(),
                moveCount: 31,
                result: "1-0",
            },
        ];
    }, [items, replays]);
    
    const totalPages = Math.max(1, Math.ceil(count / pageSize));
    
    const openReplay = async (id: string) => {
        if (!onOpenReplay) {
            // simple mock viewer
            setViewer({
                id,
                redName: "Red",
                blackName: "Black",
                result: "1-0",
                timeControl: "10|0",
            });
            setPly(0);
            return;
        }
        const data = await onOpenReplay(id);
        setViewer(data);
        setPly(0);
    };
    
    const onFirst = () => setPly(0);
    const onPrev = () => setPly(0);
    const onNext = () => setPly(0);
    const onLast = () => setPly(0);
    // const onPrev = () => setPly((p) => Math.max(0, p - 1));
    // const onNext = () => setPly((p) => Math.min((viewer?.moves.length ?? 1) - 1, p + 1));
    // const onLast = () => setPly((viewer?.moves.length ?? 1) - 1);
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <TopNav />
        
        {/* Toolbar */}
        <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold">Replays</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
        <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setPage(1); }}
        placeholder="Search player or tag…"
        className="w-56 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-400"
        />
        <select value={tag} onChange={(e) => { setTag(e.target.value as "all" | "ranked" | "friendly"); setPage(1); }} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm">
        <option value="all">All</option>
        <option value="ranked">Ranked</option>
        <option value="friendly">Friendly</option>
        </select>
        <select value={tc} onChange={(e) => { setTc(e.target.value as "any" | "3|2" | "5|5" | "10|0" | "15|10"); setPage(1); }} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm">
        <option value="any">Any TC</option>
        <option>3|2</option>
        <option>5|5</option>
        <option>10|0</option>
        <option>15|10</option>
        </select>
        <button onClick={() => (onQuery ? onQuery({ q, tag, tc, page, pageSize }) : setShowUD("Refresh"))} className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm hover:bg-slate-700">
        Refresh
        </button>
        </div>
        </div>
        </div>
        </section>
        
        {/* Replay grid / list */}
        <section className="mx-auto max-w-7xl px-4 pb-16">
        {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50" />
            ))}
            </div>
        ) : sample.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-300">
            No replays found. Try clearing filters.
            </div>
        ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sample.map((g) => (
                <div key={g.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="rounded-lg bg-slate-800/80 px-2 py-1">{g.timeControl}</span>
                <span className="text-slate-400">{formatDate(g.updatedAtUtc)}</span>
                </div>
                <div className="mt-3">
                <div className="text-sm font-medium">{g.redUserId} <span className="text-slate-500">vs</span> {g.blackUserId}</div>
                <div className="text-[11px] text-slate-400">Moves: {g.moveCount} • Result: {g.result}</div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                <button onClick={() => openReplay(g.id)} className="col-span-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-white">Open</button>
                <button onClick={() => (onExportPgn ? onExportPgn(g.id) : setShowUD("Export"))} className="col-span-1 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 hover:bg-slate-700">Export</button>
                <button onClick={() => (onShare ? onShare(g.id) : setShowUD("Share"))} className="col-span-1 rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-100 hover:bg-slate-800">Share</button>
                </div>
                </div>
            ))}
            </div>
        )}
        
        {/* Pagination */}
        <div className="mt-6 flex items-center justify-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-700 disabled:opacity-50">Prev</button>
        <span className="text-xs text-slate-400">Page {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-700 disabled:opacity-50">Next</button>
        </div>
        </section>
        
        {/* Viewer Modal */}
        {viewer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
            <div>
            <h3 className="text-base font-semibold">
            {viewer.redName} <span className="text-slate-500">vs</span> {viewer.blackName}
            </h3>
            <p className="text-xs text-slate-400">{viewer.timeControl} • Result: {viewer.result}</p>
            </div>
            <button onClick={() => setViewer(null)} className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800">Close</button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
            {/* Board preview (grid only, you can swap to your real board later) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
            <div className="aspect-square rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 p-2">
            <div className="grid h-full grid-cols-9 grid-rows-10 gap-[2px]">
            {Array.from({ length: 90 }).map((_, i) => (
                <div key={i} className="bg-slate-950/60" />
            ))}
            </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2">
            <button onClick={onFirst} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800">⏮</button>
            <button onClick={onPrev}  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800">◀</button>
            <button onClick={onNext}  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800">▶</button>
            <button onClick={onLast}  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800">⏭</button>
            </div>
            {/* <div className="text-xs text-slate-400">Move {Math.min(ply + 1, viewer.moves.length)} / {viewer.moves.length}</div> */}
            <div className="text-xs text-slate-400">Move {Math.min(ply + 1, 1)} / {1}</div> {/** error debugging code */}
            </div>
            </div>
            
            {/* Moves list */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
            <h4 className="mb-2 text-sm font-semibold">Moves</h4>
            <div className="max-h-96 overflow-auto rounded-xl border border-slate-800 bg-slate-950/40 p-2 text-sm leading-6">
            {/* {viewer.moves.map((mv, i) => (
                <button
                key={i}
                onClick={() => setPly(i)}
                className={`mr-2 rounded px-2 py-1 text-xs ${
                    i === ply ? "bg-red-600 text-white" : "bg-slate-800/60 text-slate-200 hover:bg-slate-800"
                }`}
                >
                {i + 1}. {mv}
                </button>
            ))} */}
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => (onExportPgn ? onExportPgn(viewer.id) : setShowUD("Export"))} className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 hover:bg-slate-700">Export</button>
            <button onClick={() => (onShare ? onShare(viewer.id) : setShowUD("Share"))} className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-100 hover:bg-slate-800">Share</button>
            </div>
            </div>
            </div>
            </div>
            </div>
        )}
        
        {/* Under Development */}
        <UnderDevelopmentDialog
        open={!!showUD}
        onClose={() => setShowUD(false)}
        featureName={typeof showUD === "string" ? showUD : undefined}
        />
        </div>
    );
};

export default ReplayPage;

/* ============== Utils & Icon ============== */
function formatDate(iso: string) {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
        return iso;
    }
}
