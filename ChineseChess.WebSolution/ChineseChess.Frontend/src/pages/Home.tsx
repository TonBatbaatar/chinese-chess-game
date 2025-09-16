import React, { useMemo, useState, type FC } from "react";
import { motion } from "framer-motion";

// Types
type Color = "red" | "black";

type Player = {
  name: string;
  rating: number;
};

type Game = {
  id: string;
  red: Player;
  black: Player;
  moves: number;
  timeControl: string;
};

type Friend = {
  id: string;
  name: string;
  rating: number;
};

type CreateRoomOptions = {
  timeControl: string;
  isPrivate: boolean;
};

type VoidFn = () => void;

export interface HomePageProps {
  onQuickPlayAI?: VoidFn;
  onQuickPlayOnline?: VoidFn;
  onCreateRoom?: (opts: CreateRoomOptions) => void;
  onJoinRoom?: (code: string) => void;
  onSpectate?: (id: string) => void;
}

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

interface GameCardProps {
  game: Game;
  onSpectate: VoidFn;
}

interface PlayerChipProps {
  name: string;
  rating: number;
  color: Color;
}

interface FriendRowProps {
  friend: Friend;
}

interface CreateRoomModalProps {
  onClose: VoidFn;
  onConfirm: (opts: CreateRoomOptions) => void;
}

interface IconProps {
  className?: string;
}

const HomePage: FC<HomePageProps> = ({
  onQuickPlayAI,
  onQuickPlayOnline,
  onCreateRoom,
  onJoinRoom,
  onSpectate,
}) => {
  // Fallback no-op handlers so the page is clickable out-of-the-box
  const fallback = (msg: string) => () => console.log(msg);

  const handleQuickAI: VoidFn = onQuickPlayAI || fallback("Quick Play vs AI clicked");
  const handleQuickOnline: VoidFn =
    onQuickPlayOnline || fallback("Quick Play Online clicked");
  const handleCreateRoom =
    onCreateRoom || ((opts: CreateRoomOptions) => console.log("Create", opts));
  const handleJoinRoom = onJoinRoom || ((code: string) => console.log("Join", code));
  const handleSpectate = onSpectate || ((id: string) => console.log("Spectate", id));

  const [joinCode, setJoinCode] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Mock data — replace with real API / DB data
  const featuredGames = useMemo<Game[]>(
    () => [
      {
        id: "g-1029",
        red: { name: "Liang", rating: 1820 },
        black: { name: "Chen", rating: 1875 },
        moves: 36,
        timeControl: "10|0",
      },
      {
        id: "g-1031",
        red: { name: "Minh", rating: 1720 },
        black: { name: "Tran", rating: 1680 },
        moves: 54,
        timeControl: "5|5",
      },
      {
        id: "g-1040",
        red: { name: "Aiko", rating: 1950 },
        black: { name: "Bao", rating: 2010 },
        moves: 22,
        timeControl: "3|2",
      },
    ],
    []
  );

  const friendsOnline = useMemo<Friend[]>(
    () => [
      { id: "u1", name: "Alex", rating: 1612 },
      { id: "u2", name: "Kai", rating: 1740 },
      { id: "u3", name: "Mei", rating: 1508 },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <TopNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30 [filter:blur(80px)] bg-[radial-gradient(70%_60%_at_50%_0%,rgba(185,28,28,0.35),rgba(15,23,42,0))]" />

        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
                新 • Xiangqi Online
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Master the board. Challenge anyone. Anywhere.
              </h1>
              <p className="max-w-xl text-slate-300/90">
                A modern Chinese Chess platform with quick play, private rooms,
                rich replays, and buttery-smooth online multiplayer.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleQuickAI}
                  className="group inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500 active:scale-[.99]"
                >
                  <LightningIcon className="mr-2 h-4 w-4" />
                  Quick Play vs AI
                </button>
                <button
                  onClick={handleQuickOnline}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-800/60 px-5 py-3 text-sm font-semibold text-slate-100 backdrop-blur transition hover:bg-slate-800"
                >
                  <GlobeIcon className="mr-2 h-4 w-4" />
                  Quick Play Online
                </button>
              </div>

              <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row">
                <div className="flex-grow">
                  <label htmlFor="join-code" className="sr-only">
                    Room code
                  </label>
                  <input
                    id="join-code"
                    value={joinCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setJoinCode(e.target.value.toUpperCase())
                    }
                    placeholder="Enter room code"
                    className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-600/30"
                  />
                </div>
                <button
                  onClick={() => handleJoinRoom(joinCode)}
                  className="shrink-0 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
                >
                  Join Room
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="shrink-0 rounded-2xl border border-slate-700/80 bg-slate-800/60 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                >
                  Create Room
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative mx-auto w-full max-w-md"
            >
              <BoardPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Lightning Matchmaking"
            desc="Jump into an online match in seconds with regional servers and reconnect support."
            icon={<LightningIcon className="h-5 w-5" />}
          />
          <FeatureCard
            title="Crystal-clear Replays"
            desc="Step through moves, flip the board, and export your games for study."
            icon={<ReplayIcon className="h-5 w-5" />}
          />
          <FeatureCard
            title="Beautiful Boards & Themes"
            desc="Choose from elegant piece sets and immersive sounds. Your game, your vibe."
            icon={<PaletteIcon className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* Content grid: Featured & Friends */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Featured Games</h2>
              <a href="#replays" className="text-sm text-slate-300 hover:underline">
                View all replays
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredGames.map((g) => (
                <GameCard key={g.id} game={g} onSpectate={() => handleSpectate(g.id)} />
              ))}
            </div>
          </div>

          <aside>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Friends Online</h2>
              <a href="#friends" className="text-sm text-slate-300 hover:underline">
                View all
              </a>
            </div>
            <div className="space-y-3">
              {friendsOnline.map((f) => (
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
          onConfirm={(opts) => {
            handleCreateRoom(opts);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

/* ------------------------ UI Building Blocks ------------------------ */
const TopNav: FC = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <a href="#" className="group inline-flex items-center gap-2">
          <LogoIcon className="h-5 w-5 text-red-500 transition group-hover:scale-110" />
          <span className="text-sm font-semibold tracking-wide text-slate-200">
            Xiangqi
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a className="hover:text-white" href="#">
            Lobby
          </a>
          <a className="hover:text-white" href="#replays">
            Replays
          </a>
          <a className="hover:text-white" href="#profile">
            Profile
          </a>
          <a className="hover:text-white" href="#settings">
            Settings
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-900">
            Sign in
          </button>
          <button className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

const FeatureCard: FC<FeatureCardProps> = ({ title, desc, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
    >
      <div className="mb-3 inline-flex items-center justify-center rounded-xl bg-slate-800 p-2 text-slate-200">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-300/90">{desc}</p>
    </motion.div>
  );
};

const GameCard: FC<GameCardProps> = ({ game, onSpectate }) => {
  const { red, black, moves, timeControl } = game;
  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-slate-700">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="rounded-lg bg-slate-800/80 px-2 py-1">{timeControl}</span>
        <span>{moves} moves</span>
      </div>
      <div className="mt-3 grid grid-cols-2 items-center gap-3">
        <PlayerChip name={red.name} rating={red.rating} color="red" />
        <div className="text-center text-xs text-slate-500">vs</div>
        <PlayerChip name={black.name} rating={black.rating} color="black" />
      </div>
      <button
        onClick={onSpectate}
        className="mt-4 w-full rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white"
      >
        Spectate
      </button>
    </div>
  );
};

const PlayerChip: FC<PlayerChipProps> = ({ name, rating, color }) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-6 w-6 shrink-0 rounded-full border ${
          color === "red"
            ? "border-red-500 bg-red-500/20"
            : "border-slate-600 bg-slate-700"
        }`}
      />
      <div>
        <div className="text-sm font-medium leading-4">{name}</div>
        <div className="text-[10px] text-slate-400">{rating}</div>
      </div>
    </div>
  );
};

const FriendRow: FC<FriendRowProps> = ({ friend }) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-700" />
        <div>
          <div className="text-sm font-medium">{friend.name}</div>
          <div className="text-[10px] text-slate-400">{friend.rating}</div>
        </div>
      </div>
      <button className="rounded-xl border border-slate-700/80 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800">
        Invite
      </button>
    </div>
  );
};

const CreateRoomModal: FC<CreateRoomModalProps> = ({ onClose, onConfirm }) => {
  const [timeControl, setTimeControl] = useState<string>("10|0");
  const [isPrivate, setIsPrivate] = useState<boolean>(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">Create Room</h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-900"
          >
            Close
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-300">Time Control</label>
            <select
              value={timeControl}
              onChange={(e) => setTimeControl(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-600/30"
            >
              <option>3|2</option>
              <option>5|5</option>
              <option>10|0</option>
              <option>15|10</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-0"
            />
            Private room (invite via code)
          </label>
          <button
            onClick={() => onConfirm({ timeControl, isPrivate })}
            className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

const Footer: FC = () => {
  return (
    <footer className="border-t border-slate-800/80 py-10 text-center text-xs text-slate-400">
      <div className="mx-auto max-w-7xl px-4">
        <p>Built for players. Crafted with ❤️ — Chinese Chess (Xiangqi) Platform</p>
        <p className="mt-2">v0.1 • Light/Dark auto • Low‑latency servers</p>
      </div>
    </footer>
  );
};

/* ------------------------------ Visuals ----------------------------- */
const BoardPreview: FC = () => {
  // Simple decorative board preview (not interactive)
  return (
    <div className="relative rounded-3xl border border-slate-800 bg-slate-900/40 p-4 shadow-2xl">
      <div className="aspect-square w-full rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 p-2">
        <div className="grid h-full grid-cols-9 grid-rows-10 gap-[2px]">
          {Array.from({ length: 90 }).map((_, i) => (
            <div key={i} className="bg-slate-950/60" />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-6 -bottom-4 mx-auto h-16 rounded-2xl bg-red-500/20 blur-2xl" />
    </div>
  );
};

/* ------------------------------ Icons -------------------------------- */
const LogoIcon: FC<IconProps> = ({ className = "" }) => {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 2a8 8 0 1 1-8 8 8.009 8.009 0 0 1 8-8Zm-3 7h6v2H9z" />
    </svg>
  );
};

const LightningIcon: FC<IconProps> = ({ className = "" }) => {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2 3 14h7v8l11-14h-8l.999-6z" />
    </svg>
  );
};

const GlobeIcon: FC<IconProps> = ({ className = "" }) => {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm6.93 6h-3.27a15.7 15.7 0 0 0-1.3-3.46A8.033 8.033 0 0 1 18.93 8ZM12 4.06A13.7 13.7 0 0 1 13.86 8H10.1A13.7 13.7 0 0 1 12 4.06ZM8.64 8H5.07A8.033 8.033 0 0 1 9.64 4.54 15.7 15.7 0 0 0 8.64 8Zm0 8H5.07a8.033 8.033 0 0 0 4.57 3.46A15.7 15.7 0 0 1 8.64 16Zm3.36 3.94A13.7 13.7 0 0 1 10.14 16h3.76A13.7 13.7 0 0 1 12 19.94ZM15.36 16h3.57A8.033 8.033 0 0 1 14.36 19.46 15.7 15.7 0 0 0 15.36 16Zm-7.81-2A14.7 14.7 0 0 1 7.9 10h8.2a14.7 14.7 0 0 1 .35 4Z" />
    </svg>
  );
};

const ReplayIcon: FC<IconProps> = ({ className = "" }) => {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 5V1L7 6l5 5V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" />
    </svg>
  );
};

const PaletteIcon: FC<IconProps> = ({ className = "" }) => {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a10 10 0 1 0 0 20 3 3 0 0 0 0-6h-1a3 3 0 0 1-3-3 5 5 0 0 1 5-5h1a2 2 0 0 0 0-4zM7 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-1 9a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm10 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
    </svg>
  );
};

export default HomePage;
