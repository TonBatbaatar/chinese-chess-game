import { useAuth } from "../context/AuthContext";
import { Link } from 'react-router-dom';

export default function Header() {

  const { user, displayName } = useAuth();

  // console.log("Header rendered, user =", user); //debug code

  return (
    <header className="w-full h-12 flex items-center justify-between border-b bg-white/60 backdrop-blur px-4">
      <Link to="/login" className="font-semibold hover:underline">
        Chinese Chess
      </Link>

      {/* Top-right */}
      <div className="text-sm text-gray-700">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded border bg-gray-50">{displayName}</span>
            {user.isGuest === true && (
              <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            <Link to="/guest" className="text-blue-600 hover:underline">Play as Guest</Link>
          </div>
        )}
      </div>
    </header>
  );
}
