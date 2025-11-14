import { createContext, useContext } from "react";
import { Game } from "../models/Game";

export const GameContext = createContext(new Game());

export default function useGame() {
    const game = useContext(GameContext);

    return game;
}