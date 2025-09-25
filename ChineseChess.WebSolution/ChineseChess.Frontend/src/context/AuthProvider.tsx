// library import
import React, {useEffect, useMemo, useState} from "react";
import type { AuthCtx, AuthUser } from "./AuthTypes";
import { AuthContext } from "./AuthContext";


export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Try restore user from localStorage on first render
    const [user, setUser] = useState<AuthUser | null>(() => {
        const raw = localStorage.getItem("auth-user");
        if (!raw) return null;
        try {
            return JSON.parse(raw) as AuthUser;
        } catch {
            return null;
        }
    });
    
    const [isHydrating, setIsHydrating] = useState(false);
    

    // Hit /api/auth/me to load the current session (cookie/session-based)
    const refreshMe = async () => {
        try {
            setIsHydrating(true);
            const res = await fetch("/api/auth/me", { credentials: "include" });
            if (!res.ok) return; // not signed in
            const me = await res.json().catch(() => null);
            // console.log(me); // debug code
            if (me?.displayName) setUser({ displayName: me.displayName, email: me.email, isGuest: false  });
        } catch {
            // ignore network errors
        } finally {
            setIsHydrating(false);
        }
    };
    

    // Hydrate once if we don't have a user yet
    useEffect(() => {
        if (user !== null) return;
        void refreshMe();
    }, [user]);
    

    // Keep localStorage in sync with user
    useEffect(() => {
        if (user) localStorage.setItem("auth-user", JSON.stringify(user));
        else localStorage.removeItem("auth-user");
    }, [user]);
    


    // Email/password sign in (cookie-session version)
    const signIn = async (email: string, password: string) => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            credentials: "include", // remove if you use JWT only
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const msg = await safeErrorMessage(res, "Login failed");
            throw new Error(msg);
        }
        await refreshMe();
    };
    

    /** Create account then hydrate */
    const register = async (
        displayName: string,
        email: string,
        password: string
    ) => {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ displayName, email, password }),
        });
        if (!res.ok) {
            const msg = await safeErrorMessage(res, "Register failed");
            throw new Error(msg);
        }
        await refreshMe();
    };
    
    
    /** Keep existing guest behavior; */
    const becomeGuest = async () => {
        setUser(createGuest());
    };
    

    /** Clear server session (if any) and local state */
    const signOut = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } catch {
            // ignore network errors; still clear locally
        } finally {
            setUser(null);
        }
    };
    
    const displayName = useMemo(() => {
        if (!user) return "";
        return user.displayName;
    }, [user]);
    
    
    const value: AuthCtx = {
        user,
        setUser,
        displayName,
        isHydrating,
        signIn,
        register,
        refreshMe,
        becomeGuest,
        signOut,
    };
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


/** Helper to make a guest only on demand */
function createGuest(): AuthUser {
    const n = Math.floor(1000 + Math.random() * 9000);
    return { displayName: `Guest-${n}`, isGuest: true };
}


/** Try to read an error message from the server response */
async function safeErrorMessage(res: Response, fallback: string) {
    try {
        const data = await res.json();
        if (typeof data?.message === "string") return data.message;
        return fallback;
    } catch {
        return fallback;
    }
}



