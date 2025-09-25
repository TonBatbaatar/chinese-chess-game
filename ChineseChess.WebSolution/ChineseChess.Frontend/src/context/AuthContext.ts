import { createContext } from "react";
import type { AuthCtx } from "./AuthTypes";

export const AuthContext = createContext<AuthCtx | null>(null);