// src/pages/ProfilePage.tsx
import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import TopNav from "../components/home/TopNav";

const ProfilePage: React.FC = () => {
  const { user, displayName, signOut, isHydrating } = useAuth();
  const navigate = useNavigate();

  // While /api/auth/me hydration is running, show a small skeleton
  if (isHydrating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="h-40 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
        </div>
      </div>
    );
  }

  // If no user after hydration, redirect to auth
  console.log(user);
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <TopNav />

      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-700 text-xl font-bold text-white">
              {displayName?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{displayName}</h2>
              {user.email && <p className="text-sm text-slate-400">{user.email}</p>}
              {user.isGuest && <p className="text-xs text-slate-400 italic">Guest account</p>}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={() => navigate("/replays")}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700"
            >
              View My Replays
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700"
            >
              Account Settings
            </button>
            <button
              onClick={() => {
                void signOut();
                navigate("/auth");
              }}
              className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h3 className="mb-3 text-lg font-semibold">Coming soon 🚧</h3>
          <p className="text-sm text-slate-300/80">
            Match history, friends list, and profile customization will appear here once implemented.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
