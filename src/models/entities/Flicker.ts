import FollowWallMover from "../../services/movers/FollowWallMover";
import type { Coordinates } from "../Coordinates";
import type { Game } from "../Game";
import type { Direction } from "../Openings";
import Entity, { FacingDirections } from "./Entity";

export default class Flicker extends Entity {
    constructor(game: Game, coordinates: Coordinates) {
        super(game, 'flicker', 1, coordinates, {
            facingDirections: FacingDirections.None,
            animationFrameCount: 8,
            animationSpeed: 4,
        });
        this._mover = new FollowWallMover(this.game, this, { stepDelay: 500 });
    }

    protected updateFrame(frame: number): string {
        return `flicker.floating.${frame}`;
    }

    async moveTo(direction: Direction, coordinates: Coordinates): Promise<void> {
        if (this._isMoving) {
            return Promise.resolve();
        }
        
        await super.moveTo(direction, coordinates);

        return this.animate([], 1024);
    }
}