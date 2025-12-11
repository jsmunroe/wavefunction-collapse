import { createContext, useContext, useEffect, useState } from "react";
import { Game } from "../models/Game";
import { Rng } from "../utils/random";

export const GameContext = createContext(new Game(Rng.lcr(12345)));

export default function useGame() {
    const game = useContext(GameContext);

    const [isStarted, setIsStarted] = useState(game.isStarted);

    useEffect(() => {
        if (!isStarted) {
            game.newGame().then(() => setIsStarted(true));
            
        }
    }, [game, isStarted])

    return game;
}