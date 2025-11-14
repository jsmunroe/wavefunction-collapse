import { Direction, reverse } from "./Openings";
import type { Openings } from "./Openings";

export class Boundary {
    private _wall: number;
    private _direction: Direction;
    
    constructor(openings: Openings, direction: Direction) {
        this._direction = direction;
        this._wall = 0;

        switch (this._direction) {
            case Direction.North:
                this._wall = Direction.North & openings;
                break;
            case Direction.East:
                this._wall = Direction.East & openings;
                break;
            case Direction.South:
                this._wall = Direction.South & openings;
                break;
            case Direction.West:
                this._wall = Direction.West & openings;
                break;
        }
    }

    get wall(): number {
        return this._wall;
    }

    flip(): Boundary {
        let wall = 0;

        switch (this._direction) {
            case Direction.North:
                wall |= this._wall & Direction.North ? Direction.South : 0;
                break;

            case Direction.East:
                wall |= this._wall & Direction.East ? Direction.West : 0;
                break;

            case Direction.South:
                wall |= this._wall & Direction.South ? Direction.North : 0;
                break;

            case Direction.West:
                wall |= this._wall & Direction.West ? Direction.East : 0;
                break;
        }

        return new Boundary(wall, reverse(this._direction) as Direction);
    }

    matches(other: Boundary): boolean {
        return this._wall === other._wall;
    }
}
