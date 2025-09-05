import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import GuestPlay from './pages/GuestPlay';

export default function App() {
  return (
    <Routes>
      {/* Home is the Login page */}
      <Route path="/" element={<Login />} />

      {/* Other pages */}
      <Route path="/register" element={<Register />} />
      <Route path="/guest" element={<GuestPlay />} />

      {/* Catch-all → go to Login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
