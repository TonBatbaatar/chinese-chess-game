import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import MatchRoomRoute from "./routes/MatchRoomRoute";
import ProfilePage from "./pages/Profile";
import ReplayPage from "./pages/ReplayPage";
import { useGameHub } from "./hubs/GameHubProvider";


// Gate a route behind auth
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/auth" replace />;
    return <>{children}</>;
};


const AppRoutes: React.FC = () => {
    const navigate = useNavigate();
    const { signIn, register, becomeGuest } = useAuth();
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
                        const { gameId, board } = await createGame(opts.timeControl);
                        navigate(`/room/${gameId}`, { state: { isCreator: true, tc: opts.timeControl, boardDto: board } });
                    }}
                    onJoinRoom={async (code) => {
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
                // onQuery={async ({ q, tag, tc, page, pageSize }) => {
                //     // return await api.fetchReplays({ q, tag, tc, page, pageSize });
                //     return { items: [], total: 0 }; // stub
                // }}
                // onOpenReplay={async (id) => {
                //     // return await api.fetchReplay(id);
                //     return {
                //     id,
                //     redName: "You",
                //     blackName: "Opponent",
                //     timeControl: "10|0",
                //     result: "1-0",
                //     moves: ["P2+1", "p2+1", "H8+7", "c2+2"],
                //     };
                // }}
                // onExportPgn={async (id) => {
                //     // await api.exportPGN(id);
                // }}
                // onShare={async (id) => {
                //     // await api.share(id);
                // }}
                />
            }
            />


            {/* TODO: match room */}
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