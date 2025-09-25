import React from "react";
import { useLocation, useParams } from "react-router-dom";
import MatchRoom from "../pages/MatchRoom"; // adjust path
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

type Cell = { r: number; c: number; type: string; owner: "Red" | "Black" };
type BoardDto = { rows: number; cols: number; cells: Cell[]; currentPlayer: "Red" | "Black" };

type NavState = { isCreator?: boolean; opponentName?: string; tc?: string; pendingJoin?: boolean; boardDto?: BoardDto };

const MatchRoomRoute: React.FC = () => {
  const { id = "" } = useParams();
  const { state } = useLocation() as { state?: NavState };
  const { displayName } = useAuth();
  const navigate = useNavigate();

  const isCreator = !!state?.isCreator;
  const pendingJoin = !!state?.pendingJoin;
  const boardDto = state?.boardDto;
  const timeControl = state?.tc ?? "10|0";

  // If creator → you're Red; else you're Black
  const redPlayer = isCreator
    ? { id: "you", name: displayName || "You", rating: 1000 }
    : { id: "opp", name: state?.opponentName || "Waiting", rating: 1000 };

  const blackPlayer = isCreator
    ? { id: "opp", name: state?.opponentName || "Waiting...", rating: 1000 }
    : { id: "you", name: displayName || "You", rating: 1000 };

  return (
    <MatchRoom
      roomId={id}
      myName={displayName}
      isCreator={isCreator}          // optional hint for UI
      pendingJoin={pendingJoin}
      boardDto={boardDto}
      redPlayer={redPlayer}
      blackPlayer={blackPlayer}
      timeControl={timeControl}
      onBack={() => {navigate("/home")}}
      // you can also pass getLegalMoves/onMove/onResign here if you like
    />
  );
};

export default MatchRoomRoute;
