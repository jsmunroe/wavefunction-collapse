import KeyboardMover from "../../services/movers/KeyboardMover";
import type { Coordinates } from "../Coordinates";
import Entity from "./Entity";
import type { Game } from "../Game";
import { Direction } from "../Openings";

export default class Player extends Entity {

    constructor(game: Game) {
        super(game, 'player', 0,{ world: { x: 0, y: 0 }, room: { x: 5, y: 5 }});
        this._currentRoom = this.world.getRoom(this.coordinates.world);
        this._currentRoom.addSprite(this);

        this._mover = new KeyboardMover(this.game, this);
    }

    moveTo(direction: Direction, coordinates: Coordinates): Promise<void> {
        if (this._isMoving) {
            return Promise.resolve();
        }

        this._isMoving = true;
        this.computeFacingAndMoving(direction);

        const formerRoom = this._currentRoom;

        this._currentRoom = this.world.getRoom(coordinates.world);

        if (formerRoom !== this._currentRoom) {
            formerRoom.removeSprite(this);
            this._currentRoom.addSprite(this);
        }

        const entities = this._currentRoom.getSpritesAt(coordinates.room).filter(e => e instanceof Entity && e !== this) as Entity[];

        if (entities.some(e => e.faction !== this.faction)) {
            return this.battle(coordinates);
        }

        this._coordinates = coordinates;

        const sprites = [
            'player.walking.0',
            'player',
            'player.walking.1',
            'player',
        ]

        return this.animate(sprites, 64);
    }
}