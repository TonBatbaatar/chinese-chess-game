import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import HomePage from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import MatchRoomRoute from "./routes/MatchRoomRoute";
import ProfilePage from "./pages/Profile";
import ReplayPage from "./pages/ReplayPage";
import { useGameHub } from "./hubs/useGameHub";
import { fetchReplays } from "./api/replays";


// Gate a route behind auth
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/auth" replace />;
    return <>{children}</>;
};


const AppRoutes: React.FC = () => {
    const navigate = useNavigate();
    const { signIn, register, becomeGuest, user } = useAuth();
    const { createGame } = useGameHub();
    
    return (
        <Routes>
            
            {/* Auth Page */}
            <Route
            path="/auth"
            element={
                <AuthPage
                    onSignIn={async ({ email, password }) => { await signIn(email, password); navigate("/home"); }}
                    onRegister={async ({ displayName, email, password }) => { await register(displayName, email, password);}}
                    onGuest={async () => { await becomeGuest(); navigate("/home"); }}
                />
            }
            />


            {/* Profile Page */}
            <Route
                path="/profile"
                element={
                    <ProfilePage />
                }
            />
            

            {/* Home Page */}
            <Route
                path="/home"
                element={
                    <HomePage
                    onCreateRoom={async (opts) => {
                        if (!user) {
                            navigate("/auth");
                            return;
                        } 
                        const { gameId, board } = await createGame(opts.timeControl, user.displayName);
                        navigate(`/room/${gameId}`, { state: { isCreator: true, tc: opts.timeControl, boardDto: board } });
                    }}
                    onJoinRoom={async (code) => {
                        if (!user) {
                            navigate("/auth");
                            return;
                        }
                        navigate(`/room/${code}`, { state: { isCreator: false, pendingJoin: true } });
                    }}
                    />
                }
            />
            


            {/* Replay Page (TODO) */}
            <Route
            path="/replays"
            element={
                <ReplayPage
                pageSize={12}
                onQuery={(args) => fetchReplays({
                    userId: args.q,
                    finished: true,
                    tc: args.tc,
                    page: args.page,
                    pageSize: args.pageSize,
                    sort: "-UpdatedAtUtc",
                })}
                // onExportPgn={async (id) => {
                //     // await api.exportPGN(id);
                // }}
                // onShare={async (id) => {
                //     // await api.share(id);
                // }}
                />
            }
            />


            {/* match room */}
            <Route
            path="/room/:id"
            element={
                <ProtectedRoute>
                    <MatchRoomRoute />   {/* wrapper reads params & state, passes props */}
                </ProtectedRoute>
            }
            />
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return <AppRoutes />;
};

export default App;