import { createContext } from "react";
import type { GameHubApi } from "./GameHubTypes";

export const Ctx = createContext<GameHubApi | null>(null);