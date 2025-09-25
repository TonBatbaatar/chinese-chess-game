import { useContext } from "react";
import { Ctx } from "./GameHubContext";

export const useGameHub = () => {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useGameHub must be used within GameHubProvider");
    return ctx;
};