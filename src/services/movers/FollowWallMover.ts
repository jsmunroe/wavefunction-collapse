import type IMovableSprite from "../../contracts/IMovableSprite";
import type { Game } from "../../models/Game";
import { Direction, left, reverse, right } from "../../models/Openings";
import Mover from "./Mover";

export type FollowWallMoverOptions = {
    stepDelay?: number;
}

export default class FollowWallMover extends Mover {
    private _lastDirection: Direction | null = null;

    constructor(game: Game, entity: IMovableSprite, options: FollowWallMoverOptions = {}) {
        super(game, entity, options);
        
    }

    update(): void {
        if (this.isDelaying || this.entity.isMoving) {
            return;
        }

        const direction = this._lastDirection === null
            ? this.selectRandomDirection()
            : this.selectFollowingDirection(this._lastDirection);

        if (!direction) {
            return;
        }

        this._lastDirection = direction;

        const coordinates = this.moveInRoom(direction, this.entity.coordinates);

        this.entity.moveTo(direction, coordinates)
            .then(() => this.endMove());
    }

    protected selectFollowingDirection(currentDirection: Direction): Direction | null {
        const nextDirections = [
            right(currentDirection),
            currentDirection,
            left(currentDirection),
            reverse(currentDirection),
        ]

        const validDirections = nextDirections.intersect(this.getValidDirections());

        if (validDirections.length === 0) {
            return null;
        }


        return validDirections.shift()!;
    }

}