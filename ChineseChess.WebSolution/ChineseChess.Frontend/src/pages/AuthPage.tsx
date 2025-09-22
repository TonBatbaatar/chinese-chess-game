import React, { useState } from "react";
import { motion } from "framer-motion";

/**
* Xiangqi — Auth Page (TypeScript + TSX)
* Drop this in as `AuthPage.tsx`.
* Includes: Sign In, Register, Play as Guest
* Tailwind + framer-motion for the same modern look as HomePage.
*/

/* ----------------------------- Types ------------------------------ */
export type AuthPageProps = {
    onSignIn?: (payload: { email: string; password: string }) => Promise<void> | void;
    onRegister?: (payload: { email: string; password: string; displayName: string }) => Promise<void> | void;
    onGuest?: () => Promise<void> | void;
    onForgotPassword?: (email: string) => Promise<void> | void;
};

/* --------------------------- Component ---------------------------- */
const AuthPage: React.FC<AuthPageProps> = ({ onSignIn, onRegister, onGuest, onForgotPassword }) => {
    const [mode, setMode] = useState<"signin" | "register">("signin");
    
    // Sign in state
    const [siEmail, setSiEmail] = useState<string>("");
    const [siPassword, setSiPassword] = useState<string>("");
    
    // Register state
    const [rgName, setRgName] = useState<string>("");
    const [rgEmail, setRgEmail] = useState<string>("");
    const [rgPassword, setRgPassword] = useState<string>("");
    const [rgConfirm, setRgConfirm] = useState<string>("");
    
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [info, setInfo] = useState<string>("");
    
    const handleSignIn = async () => {
        setError(""); setInfo("");
        if (!siEmail || !siPassword) { setError("Please enter email and password."); return; }
        try {
            setLoading(true);
            await (onSignIn ? onSignIn({ email: siEmail, password: siPassword }) : new Promise((r)=>setTimeout(r,500)));
            setInfo("Signed in successfully.");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Sign in failed.");
        } finally { setLoading(false); }
    };
    
    const handleRegister = async () => {
        setError(""); setInfo("");
        if (!rgName || !rgEmail || !rgPassword) { setError("Fill all fields."); return; }
        if (rgPassword !== rgConfirm) { setError("Passwords do not match."); return; }
        try {
            setLoading(true);
            await (onRegister ? onRegister({ email: rgEmail, password: rgPassword, displayName: rgName }) : new Promise((r)=>setTimeout(r,500)));
            setInfo("Account created. You can sign in now.");
            setMode("signin");
            setSiEmail(rgEmail);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Registration failed.");
        } finally { setLoading(false); }
    };
    
    const handleGuest = async () => {
        setError(""); setInfo("");
        try {
            setLoading(true);
            await (onGuest ? onGuest() : new Promise((r)=>setTimeout(r,400)));
            setInfo("Continuing as guest…");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not start guest session.");
        } finally { setLoading(false); }
    };
    
    const handleForgot = async () => {
        if (!siEmail) { setError("Enter your email first."); return; }
        try {
            setLoading(true); setError(""); setInfo("");
            await (onForgotPassword ? onForgotPassword(siEmail) : new Promise((r)=>setTimeout(r,400)));
            setInfo("Password reset email sent (if the account exists).");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not send reset.");
        } finally { setLoading(false); }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <TopNavCompact />
        
        <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30 [filter:blur(80px)] bg-[radial-gradient(70%_60%_at_50%_0%,rgba(185,28,28,0.35),rgba(15,23,42,0))]" />
        
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
        >
        <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
        新 • Welcome to Xiangqi
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Sign in, register, or play as guest.
        </h1>
        <p className="max-w-xl text-slate-300/90">
        Your progress syncs when signed in. Guests can jump in instantly and link an account later.
        </p>
        
        <ul className="grid max-w-xl grid-cols-1 gap-3 text-sm text-slate-300/90 sm:grid-cols-2">
        <li className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">• Secure accounts</li>
        <li className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">• Fast guest access</li>
        <li className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">• Cross‑device history</li>
        <li className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">• Themes & friends</li>
        </ul>
        </motion.div>
        
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mx-auto w-full max-w-md"
        >
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl shadow-black/20">
        <div className="mb-5 flex rounded-xl bg-slate-800 p-1 text-sm">
        <button
        onClick={() => setMode("signin")}
        className={`flex-1 rounded-lg px-3 py-2 font-medium transition ${
            mode === "signin" ? "bg-slate-950 text-white" : "text-slate-300 hover:text-white"
        }`}
        >
        Sign In
        </button>
        <button
        onClick={() => setMode("register")}
        className={`flex-1 rounded-lg px-3 py-2 font-medium transition ${
            mode === "register" ? "bg-slate-950 text-white" : "text-slate-300 hover:text-white"
        }`}
        >
        Register
        </button>
        </div>
        
        {mode === "signin" ? (
            <form
            className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); void handleSignIn(); }}
            >
            <Field label="Email">
            <input
            type="email"
            value={siEmail}
            onChange={(e) => setSiEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-600/30"
            required
            />
            </Field>
            <Field label="Password">
            <input
            type="password"
            value={siPassword}
            onChange={(e) => setSiPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-600/30"
            required
            />
            </Field>
            <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-0" />
            Remember me
            </label>
            <button type="button" onClick={() => void handleForgot()} className="text-slate-300 hover:text-white">
            Forgot password?
            </button>
            </div>
            <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
            >
            {loading ? "Signing in…" : "Sign In"}
            </button>
            </form>
        ) : (
            <form
            className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); void handleRegister(); }}
            >
            <Field label="Display Name">
            <input
            value={rgName}
            onChange={(e) => setRgName(e.target.value)}
            placeholder="Your nickname"
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-600/30"
            required
            />
            </Field>
            <Field label="Email">
            <input
            type="email"
            value={rgEmail}
            onChange={(e) => setRgEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-600/30"
            required
            />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Password">
            <input
            type="password"
            value={rgPassword}
            onChange={(e) => setRgPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-600/30"
            required
            />
            </Field>
            <Field label="Confirm">
            <input
            type="password"
            value={rgConfirm}
            onChange={(e) => setRgConfirm(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-600/30"
            required
            />
            </Field>
            </div>
            <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
            >
            {loading ? "Creating account…" : "Create Account"}
            </button>
            </form>
        )}
        
        <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-800" />
        <span className="text-[10px] uppercase tracking-widest text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-800" />
        </div>
        
        <button
        onClick={() => void handleGuest()}
        disabled={loading}
        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:opacity-60"
        >
        {loading ? "Starting guest session…" : "Play as Guest"}
        </button>
        
        {(error || info) && (
            <div className={`mt-4 rounded-xl border px-3 py-2 text-xs ${error ? "border-red-700/70 bg-red-950/50 text-red-300" : "border-emerald-700/70 bg-emerald-950/40 text-emerald-300"}`}>
            {error || info}
            </div>
        )}
        </div>
        </motion.div>
        </div>
        </section>
        
        <footer className="pb-12 text-center text-xs text-slate-500">
        <p>By continuing you agree to our Terms & Privacy.</p>
        </footer>
        </div>
    );
};

export default AuthPage;

/* ------------------------ UI Building Blocks ------------------------ */
const TopNavCompact: React.FC = () => (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
    <a href="#" className="group inline-flex items-center gap-2">
    <LogoIcon className="h-5 w-5 text-red-500 transition group-hover:scale-110" />
    <span className="text-sm font-semibold tracking-wide text-slate-200">Xiangqi</span>
    </a>
    <div className="text-[11px] text-slate-400">v0.1</div>
    </div>
    </header>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <label className="block text-xs">
    <span className="mb-1 block text-slate-300">{label}</span>
    {children}
    </label>
);

/* ------------------------------ Icons -------------------------------- */
type IconProps = { className?: string };
const LogoIcon: React.FC<IconProps> = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 2a8 8 0 1 1-8 8 8.009 8.009 0 0 1 8-8Zm-3 7h6v2H9z" />
    </svg>
);
