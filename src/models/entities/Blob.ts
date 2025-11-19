import RandomMover from "../../services/movers/RandomMover";
import type { Coordinates } from "../Coordinates";
import type { Game } from "../Game";
import type { Direction } from "../Openings";
import Entity from "./Entity";

export default class Blob extends Entity {
    constructor(game: Game, coordinates: Coordinates) {
        super(game, 'blob', coordinates);
        this.mover = new RandomMover(this.game, this, { stepDelay: 1000 });
    }

    moveTo(direction: Direction, coordinates: Coordinates): Promise<void> {
        if (this._isMoving) {
            return Promise.resolve();
        }

        this._isMoving = true;
        this.computeFacingAndMoving(direction);

        this._coordinates = coordinates;

        const formerRoom = this._currentRoom;

        this._currentRoom = this.world.getRoom(this.coordinates.world);

        if (formerRoom !== this._currentRoom) {
            formerRoom.removeSprite(this);
            this._currentRoom.addSprite(this);
        }

        const sprites = [
            'blob.bouncing'
        ]

        return this.animate(sprites, 256, {
            curve: (t: number) => (2 * t - 1) ** 2 * 0.30 - 0.30
        })
    }
}