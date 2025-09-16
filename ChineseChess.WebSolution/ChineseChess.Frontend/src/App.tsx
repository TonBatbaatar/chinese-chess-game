import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GuestPlay from "./pages/GuestPlay";
// import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/Home";

export default function App() {
  return (
    <Routes>
      {/* Root always loads HomePage */}
      <Route path="/" element={<HomePage />} />

      {/* Optional extra routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/guest" element={<GuestPlay />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
