import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UnderDevelopmentDialog from "../components/UnderDevelopmentDialog";

/* =========================
   Types
========================= */
export type ReplayMeta = {
  id: string;
  red: { name: string; rating?: number };
  black: { name: string; rating?: number };
  moves: number;
  timeControl: string;        // e.g. "10|0"
  endedAt: string;            // ISO string
  result: "1-0" | "0-1" | "1/2-1/2" | "unfinished";
  tags?: string[];            // e.g. ["ranked", "friendly"]
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

/* A minimal replay data shape for the viewer */
export type ReplayData = {
  id: string;
  initialFen?: string;          // if you use FEN-like for Xiangqi (optional)
  moves: string[];              // simple SAN-like list or your custom notation
  redName: string;
  blackName: string;
  result: ReplayMeta["result"];
  timeControl: string;
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
  const { user, displayName, signOut } = useAuth();
  const navigate = useNavigate();

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
      { id: "r1", red: { name: "Liang" }, black: { name: "Chen" }, moves: 42, timeControl: "10|0", endedAt: new Date().toISOString(), result: "1-0", tags: ["ranked"] },
      { id: "r2", red: { name: "Aiko" }, black: { name: "Bao" }, moves: 58, timeControl: "5|5", endedAt: new Date().toISOString(), result: "0-1", tags: ["friendly"] },
      { id: "r3", red: { name: "Minh" }, black: { name: "Tran" }, moves: 31, timeControl: "3|2", endedAt: new Date().toISOString(), result: "1/2-1/2", tags: ["ranked"] },
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
        moves: ["P2+1", "p2+1", "H8+7", "c2+2", "H2+3", "p7+1"], // sample xiangqi notation
      });
      setPly(0);
      return;
    }
    const data = await onOpenReplay(id);
    setViewer(data);
    setPly(0);
  };

  const onFirst = () => setPly(0);
  const onPrev = () => setPly((p) => Math.max(0, p - 1));
  const onNext = () => setPly((p) => Math.min((viewer?.moves.length ?? 1) - 1, p + 1));
  const onLast = () => setPly((viewer?.moves.length ?? 1) - 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Top nav (inline, auth-aware) */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/home" className="group inline-flex items-center gap-2">
            <LogoIcon className="h-5 w-5 text-red-500 transition group-hover:scale-110" />
            <span className="text-sm font-semibold tracking-wide text-slate-200">Xiangqi</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <Link className="hover:text-white" to="/home">Home</Link>
            <Link className="hover:text-white" to="/profile">Profile</Link>
            <span className="text-slate-500">Replays</span>
          </nav>

          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <button onClick={() => navigate("/auth")} className="rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-900">Sign in</button>
                <button onClick={() => navigate("/auth")} className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500">Get Started</button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300">{displayName}</span>
                <button onClick={() => { void signOut(); navigate("/auth"); }} className="rounded-xl border border-slate-700/80 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

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
              <select value={tag} onChange={(e) => { setTag(e.target.value as any); setPage(1); }} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm">
                <option value="all">All</option>
                <option value="ranked">Ranked</option>
                <option value="friendly">Friendly</option>
              </select>
              <select value={tc} onChange={(e) => { setTc(e.target.value as any); setPage(1); }} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm">
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
                  <span className="text-slate-400">{formatDate(g.endedAt)}</span>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-medium">{g.red.name} <span className="text-slate-500">vs</span> {g.black.name}</div>
                  <div className="text-[11px] text-slate-400">Moves: {g.moves} • Result: {g.result}</div>
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
                  <div className="text-xs text-slate-400">Move {Math.min(ply + 1, viewer.moves.length)} / {viewer.moves.length}</div>
                </div>
              </div>

              {/* Moves list */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
                <h4 className="mb-2 text-sm font-semibold">Moves</h4>
                <div className="max-h-96 overflow-auto rounded-xl border border-slate-800 bg-slate-950/40 p-2 text-sm leading-6">
                  {viewer.moves.map((mv, i) => (
                    <button
                      key={i}
                      onClick={() => setPly(i)}
                      className={`mr-2 rounded px-2 py-1 text-xs ${
                        i === ply ? "bg-red-600 text-white" : "bg-slate-800/60 text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {i + 1}. {mv}
                    </button>
                  ))}
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

type IconProps = { className?: string };
const LogoIcon: React.FC<IconProps> = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 2a8 8 0 1 1-8 8 8.009 8.009 0 0 1 8-8Zm-3 7h6v2H9z" />
  </svg>
);
