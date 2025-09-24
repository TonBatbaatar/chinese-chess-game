export interface ReplayQueryArgs {
    userId?: string;
    finished?: boolean;
    tc?: string;
    fromUtc?: string;
    toUtc?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
}
export async function fetchReplays({ userId, finished, tc, fromUtc, toUtc, page, pageSize, sort } : ReplayQueryArgs) {
    const p = new URLSearchParams();
    if (userId) p.set("userId", userId);
    if (finished !== undefined) p.set("finished", String(finished));
    if (tc) p.set("tc", tc);                // "10|0"
    if (fromUtc) p.set("fromUtc", fromUtc); // ISO
    if (toUtc) p.set("toUtc", toUtc);
    p.set("page", String(page ?? 1));
    p.set("pageSize", String(pageSize ?? 12));
    if (sort) p.set("sort", sort);
    
    const res = await fetch(`/api/replays?${p.toString()}`);
    if (!res.ok) throw new Error("Failed to load replays");
    return res.json() as Promise<{ items: any[]; total: number }>;
}

export async function fetchReplay(id: string) {
    const res = await fetch(`/api/replays/${id}`);
    if (!res.ok) throw new Error("Replay not found");
    return res.json();
}