import { createContext, useContext, useEffect, useState } from "react";
import { Game } from "../models/Game";

export const GameContext = createContext(new Game());

export default function useGame() {
    const game = useContext(GameContext) ?? new Game();

    const [isStarted, setIsStarted] = useState(game.isStarted);

    useEffect(() => {
        if (!isStarted) {
            game.newGame().then(() => setIsStarted(true));
            
        }
    }, [game, isStarted])

    return game;
}