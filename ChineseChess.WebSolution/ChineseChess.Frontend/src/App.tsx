import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import GuestPlay from './pages/GuestPlay';
import Header from "./components/Header";
import { useAuth } from "./context/AuthContext";



function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <Outlet />
    </div>
  );
}

// Wrapper to decide where "/" goes
function HomeRedirect() {
  const { user} = useAuth();
  return user ? <Navigate to="/guest" replace /> : <Navigate to="/login" replace />;
}

export default function App() {

  

  return (
    <Routes>
      {/* Routes that share the header */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/guest" element={<GuestPlay />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
