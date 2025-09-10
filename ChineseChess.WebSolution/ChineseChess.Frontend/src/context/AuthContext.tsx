import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AuthUser = {
    id: string;        // user id or guest id
    email?: string;    // present if logged-in
    isGuest: boolean;
};

type AuthCtx = {
    user: AuthUser | null;
    setUser: (u: AuthUser | null) => void;
    displayName: string;
    becomeGuest: () => void;
    signOut: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    
    // try restore user from localStorage
    const [user, setUser] = useState<AuthUser | null>(() => {
        const raw = localStorage.getItem("auth-user");
        // console.log("localStorage[\"auth-user\"] =", raw); // debug code
        if (!raw) return null;
        else {
            try {
                const parsed = JSON.parse(raw) as AuthUser;
                // console.log("parsed auth-user =", parsed); // debug code
                return parsed; 
            } catch (err) {
                // console.error("failed to parse auth-user:", err); // debug code
                return null
            }
        }
    });
    
    useEffect(() => {
        // hydrate once if user is null
        if (user !== null) return;
        
        (async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                if (!res.ok) return; // not signed in
                const me = await res.json().catch(()=>null);
                if (me?.id) setUser({ id: me.id, email: me.email, isGuest: false });
            } catch { /* ignore */ }
        })();
    }, [user, setUser]);
    
    useEffect(() => {
        if (user) localStorage.setItem("auth-user", JSON.stringify(user));
        else localStorage.removeItem("auth-user");
    }, [user]);
    
    const displayName = useMemo(() => {
        if (!user) return ""; // <- header will show nothing
        if (user.isGuest) return user.id;// e.g., Guest-1234
        return user.email ?? user.id;
    }, [user]);
    
    const becomeGuest = () => setUser(createGuest());
    const signOut = () => setUser(null);
    
    return (
        <AuthContext.Provider value={{ user, setUser, displayName, becomeGuest, signOut }}>
        {children}
        </AuthContext.Provider>
    );
}

// helper to make a guest only on demand
function createGuest(): AuthUser {
    const n = Math.floor(1000 + Math.random() * 9000); // generate random guest number
    return { id: `Guest-${n}`, isGuest: true }; // return guest object with id
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
