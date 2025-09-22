import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";



// import components
import TopNav from "../components/home/TopNav";
import FeatureCard from "../components/home/FeatureCard";
import GameCard, { type Game } from "../components/home/GameCard";
import FriendRow, { type Friend } from "../components/home/FriendRow";
import Footer from "../components/home/Footer";
import CreateRoomModal from "../components/home/CreateRoomModal";
import BoardPreview from "../components/home/BoardPreview";
import UnderDevelopmentDialog from "../components/UnderDevelopmentDialog";


// properties
export type HomePageProps = {
    // actions you will wire to your app
    onQuickPlayAI?: () => void;
    onQuickPlayOnline?: () => void;
    onCreateRoom?: (opts: { timeControl: string; isPrivate: boolean }) => void;
    onJoinRoom?: (code: string) => void;
    onSpectate?: (gameId: string) => void;
    onSignIn?: () => void;
    onGetStarted?: () => void;
    // optional data injection (otherwise mocked below)
    featuredGames?: Game[];
    friendsOnline?: Friend[];
};


// home page tsx
const HomePage: React.FC<HomePageProps> = ({
    onQuickPlayAI,
    onQuickPlayOnline,
    onCreateRoom,
    onJoinRoom,
    onSpectate,
    featuredGames,
    friendsOnline,
}) => {
    // Fallback no-op handlers so the page is clickable out-of-the-box
    // const fallback = (msg: string) => () => console.log(msg);
    const [show, setShow] = useState(false);
    const handleQuickAI = onQuickPlayAI || (() => setShow(true));
    const handleQuickOnline = onQuickPlayOnline || (() => setShow(true));
    const handleCreateRoom = onCreateRoom || ((opts: { timeControl: string; isPrivate: boolean }) => console.log("Create Room", opts));
    const handleJoinRoom = onJoinRoom || ((code: string) => console.log("Join Room", code));
    const handleSpectate = onSpectate || ((id: string) => console.log("Spectate", id));
    
    
    const [joinCode, setJoinCode] = useState<string>("");
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    
    // Mock data if not provided
    const games: Game[] = useMemo(
        () =>
            featuredGames ?? [
            { id: "g-1029", red: { name: "Liang", rating: 1820 }, black: { name: "Chen", rating: 1875 }, moves: 36, timeControl: "10|0" },
            { id: "g-1031", red: { name: "Minh", rating: 1720 }, black: { name: "Tran", rating: 1680 }, moves: 54, timeControl: "5|5" },
            { id: "g-1040", red: { name: "Aiko", rating: 1950 }, black: { name: "Bao", rating: 2010 }, moves: 22, timeControl: "3|2" },
        ],
        [featuredGames]
    );
    
    const friends: Friend[] = useMemo(
        () => friendsOnline ?? [
            { id: "u1", name: "Alex", rating: 1612 },
            { id: "u2", name: "Kai", rating: 1740 },
            { id: "u3", name: "Mei", rating: 1508 },
        ],
        [friendsOnline]
    );
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <TopNav />

        <UnderDevelopmentDialog
            open={show}
            onClose={() => setShow(false)}
            featureName="Under Development"
        />
        
        {/* Hero */}
        <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30 [filter:blur(80px)] bg-[radial-gradient(70%_60%_at_50%_0%,rgba(185,28,28,0.35),rgba(15,23,42,0))]" />
        
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
        <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">新 • Xiangqi Online</span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Master the board. Challenge anyone. Anywhere.</h1>
        <p className="max-w-xl text-slate-300/90">A modern Chinese Chess platform with quick play, private rooms, rich replays, and buttery-smooth online multiplayer.</p>
        
        <div className="flex flex-wrap gap-3 pt-2">
        <button onClick={handleQuickAI} className="group inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500 active:scale-[.99]">
        <LightningIcon className="mr-2 h-4 w-4" /> Quick Play vs AI
        </button>
        <button onClick={handleQuickOnline} className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-800/60 px-5 py-3 text-sm font-semibold text-slate-100 backdrop-blur transition hover:bg-slate-800">
        <GlobeIcon className="mr-2 h-4 w-4" /> Quick Play Online
        </button>
        </div>
        
        <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row">
        <div className="flex-grow">
        <label htmlFor="join-code" className="sr-only">Room code</label>
        <input id="join-code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toLowerCase())} placeholder="Enter room code" className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-600/30" />
        </div>
        <button onClick={() => handleJoinRoom(joinCode)} className="shrink-0 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white">Join Room</button>
        <button onClick={() => setShowCreateModal(true)} className="shrink-0 rounded-2xl border border-slate-700/80 bg-slate-800/60 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800">Create Room</button>
        </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="relative mx-auto w-full max-w-md">
        <BoardPreview />
        </motion.div>
        </div>
        </div>
        </section>
        
        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-3">
        <FeatureCard title="Lightning Matchmaking" desc="Jump into an online match in seconds with regional servers and reconnect support." />
        <FeatureCard title="Crystal‑clear Replays" desc="Step through moves, flip the board, and export your games for study." />
        <FeatureCard title="Beautiful Boards & Themes" desc="Choose from elegant piece sets and immersive sounds. Your game, your vibe." />
        </div>
        </section>
        
        {/* Content grid: Featured & Friends */}
        <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Featured Games</h2>
        {/* <a href="#replays" className="text-sm text-slate-300 hover:underline">View all replays</a> */}
        <Link className="text-sm text-slate-300 hover:underline" to="/replays">View all replays</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
        {games.map((g) => (
            <GameCard key={g.id} game={g} onSpectate={() => handleSpectate(g.id)} />
        ))}
        </div>
        </div>
        
        <aside>
        <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Friends Online</h2>
        {/* <a href="#friends" className="text-sm text-slate-300 hover:underline">View all</a> */}
        <Link className="text-sm text-slate-300 hover:underline" to="/profile">View all</Link>
        </div>
        <div className="space-y-3">
        {friends.map((f) => (
            <FriendRow key={f.id} friend={f} />
        ))}
        </div>
        </aside>
        </div>
        </section>
        
        <Footer />
        
        {showCreateModal && (
            <CreateRoomModal
            onClose={() => setShowCreateModal(false)}
            onConfirm={(opts) => { handleCreateRoom(opts); setShowCreateModal(false); }}
            />
        )}
        </div>
    );
};

export default HomePage;


/* ------------------------------ Icons -------------------------------- */

// lightning icon
type IconProps = { className?: string };
export const LightningIcon: React.FC<IconProps> = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 2 3 14h7v8l11-14h-8l.999-6z" />
    </svg>
);


// globe icon
export const GlobeIcon: React.FC<IconProps> = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm6.93 6h-3.27a15.7 15.7 0 0 0-1.3-3.46A8.033 8.033 0 0 1 18.93 8ZM12 4.06A13.7 13.7 0 0 1 13.86 8H10.1A13.7 13.7 0 0 1 12 4.06ZM8.64 8H5.07A8.033 8.033 0 0 1 9.64 4.54 15.7 15.7 0 0 0 8.64 8Zm0 8H5.07a8.033 8.033 0 0 0 4.57 3.46A15.7 15.7 0 0 1 8.64 16Zm3.36 3.94A13.7 13.7 0 0 1 10.14 16h3.76A13.7 13.7 0 0 1 12 19.94ZM15.36 16h3.57A8.033 8.033 0 0 1 14.36 19.46 15.7 15.7 0 0 0 15.36 16Zm-7.81-2A14.7 14.7 0 0 1 7.9 10h8.2a14.7 14.7 0 0 1 .35 4Z" />
    </svg>
);