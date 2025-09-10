import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const { user, setUser, becomeGuest } = useAuth();
    const navigate = useNavigate();
    
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        
        // empty submission validation
        if (!email || !password) {
            setError("Please enter email and password.");
            return;
        }
        
        try {
            setSubmitting(true);
            
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',   // cookie-based login
                body: JSON.stringify({ email, password }),
            });
            
            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                throw new Error(msg || 'Login failed');
            }
            
            // Try to parse JSON; fallback to empty object
            const me = await res.json().catch(() => ({} as any));
            
            console.log('SET USER', me)
            setUser({ id: me.id, email: me.email, isGuest: false });
            
            // console.log("clicked logging in , user =", user);//debug code
            navigate('/guest');
            
        } catch (err) {
            setError(String(err));
        } finally {
            setSubmitting(false);
        }
    }
    
    const onGuestClick = () => {
        if (!user?.id) {
            // console.log("becomeGuest will run, user =", user); //debug code
            becomeGuest();
        }else{
            // console.log("user already exists, skipping becomeGuest, user =", user);//debug code
        }
        // console.log("clicking become guest, user =", user);//debug code
        navigate("/guest");
    };
    
    return (
        <div className="max-w-sm mx-auto p-6">
        <h1 className="text-xl font-semibold mb-4">Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-3">
        <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full border rounded px-3 py-2"
        autoComplete="email"
        />
        <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full border rounded px-3 py-2"
        autoComplete="current-password"
        />
        
        {error && <div className="text-red-600 text-sm">{error}</div>}
        
        <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-60"
        >
        {submitting ? "Signing in…" : "Sign in"}
        </button>
        </form>
        
        <div className="mt-4 text-center">
        <button
        onClick={onGuestClick}
        className="text-blue-600 hover:underline"
        >
        Play as Guest
        </button>
        </div>
        </div>
    );
}
