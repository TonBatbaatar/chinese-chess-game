/** Public user shape exposed to the app */
export type AuthUser = {
    displayName: string;       // user name or guest id
    email?: string;   // present if logged-in
    isGuest: boolean;
};


/** What the app can read/call from auth */
export type AuthCtx = {
    user: AuthUser | null;
    setUser: (u: AuthUser | null) => void;
    displayName: string;
    
    // session state
    isHydrating: boolean;
    
    // actions
    signIn: (email: string, password: string) => Promise<void>;
    register: (displayName: string, email: string, password: string) => Promise<void>;
    refreshMe: () => Promise<void>;
    becomeGuest: () => Promise<void> | void;
    signOut: () => Promise<void> | void;
};
