import KeyboardMover from "../../services/movers/KeyboardMover";
import type { Coordinates } from "../Coordinates";
import Entity from "./Entity";
import type { Game } from "../Game";
import { Direction } from "../Openings";

export default class Player extends Entity {

    constructor(game: Game) {
        super(game, 'player', 0,{ world: { x: 0, y: 0 }, room: { x: 5, y: 5 }});

        this._mover = new KeyboardMover(this.game, this);
    }

    async moveTo(direction: Direction, coordinates: Coordinates): Promise<void> {
        if (this.isMoving) {
            return;
        }

        await super.moveTo(direction, coordinates);

        const sprites = [
            'player.walking.0',
            'player',
            'player.walking.1',
            'player',
        ]

        return this.animate(sprites, 64);
    }
}