import FollowWallMover from "../../services/movers/FollowWallMover";
import type { Coordinates } from "../Coordinates";
import type { Game } from "../Game";
import type { Direction } from "../Openings";
import Entity, { FacingDirections } from "./Entity";

export default class Flicker extends Entity {
    constructor(game: Game, coordinates: Coordinates) {
        super(game, 'flicker', coordinates, {
            facingDirections: FacingDirections.None,
            animationFrameCount: 8,
        });
        this.mover = new FollowWallMover(this.game, this, { stepDelay: 500 });
    }

    protected updateFrame(frame: number): string {
        return `flicker.floating.${frame}`;
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
        
        return this.animate([], 1024);
    }
}