import KeyboardMover from "../services/movers/KeyboardMover";
import type { Coordinates } from "./Coordinates";
import Entity from "./entities/Entity";
import type { Game } from "./Game";
import { Direction } from "./Openings";

export default class Player extends Entity {

    constructor(game: Game) {
        super(game, 'player', { world: { x: 0, y: 0 }, room: { x: 5, y: 5 }});
        this._currentRoom = this.world.getRoom(this.coordinates.world);
        this._currentRoom.addSprite(this);

        this.mover = new KeyboardMover(this.game, this);
    }

    moveTo(direction: Direction, coordinates: Coordinates): Promise<void> {
        if (this.isMoving) {
            return Promise.resolve();
        }

        this.isMoving = true;
        this.computeFacingAndMoving(direction);

        this._coordinates = coordinates;

        const formerRoom = this._currentRoom;

        this._currentRoom = this.world.getRoom(this.coordinates.world);

        if (formerRoom !== this._currentRoom) {
            formerRoom.removeSprite(this);
            this._currentRoom.addSprite(this);
        }

        const sprites = [
            'player.walking.0',
            'player',
            'player.walking.1',
            'player',
        ]

        return this.animate(sprites, 64);
    }
}