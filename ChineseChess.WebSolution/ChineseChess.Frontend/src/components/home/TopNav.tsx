import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

type TopNavProps = Record<string, never>;
const TopNav: React.FC<TopNavProps> = () => {
  const { user, displayName, signOut } = useAuth();
  // console.log("TopNav user =", user, "displayName =", displayName); // debug code
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/home" className="group inline-flex items-center gap-2">
          <LogoIcon className="h-5 w-5 text-red-500 transition group-hover:scale-110" />
          <span className="text-sm font-semibold tracking-wide text-slate-200">
            Xiangqi
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link className="hover:text-white" to="/home">Home </Link>
          <Link className="hover:text-white" to="/replays">Replays </Link>
          <Link className="hover:text-white" to="/profile">Profile</Link>
        </nav>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <button
                onClick={() => navigate("/auth")}
                className="rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-900"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
              >
                Get Started
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300">{displayName}</span>
              {user.isGuest ? (
                <button
                onClick={() => { signOut(); navigate("/auth"); }}
                className="rounded-xl border border-slate-700/80 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
              >
                Sign in
              </button>
              ) : (
                <button
                onClick={() => { signOut(); navigate("/auth"); }}
                className="rounded-xl border border-slate-700/80 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
              >
                Sign Out
              </button>
              )}
              
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;

/* Logo Icon */
type IconProps = { className?: string };
const LogoIcon: React.FC<IconProps> = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 2a8 8 0 1 1-8 8 8.009 8.009 0 0 1 8-8Zm-3 7h6v2H9z" />
  </svg>
);
