/* 7    0    1
 *   \  |  /
 * 6 ---+--- 2
 *   /  |  \
 * 5    4    3
 */

import { rotateNibbleLeft } from "../utils/binary";


export const Direction = {
    North: 1,
    East: 2,
    South: 4,
    West: 8,
} as const;

export type Direction = typeof Direction[keyof typeof Direction];

export const OpeningState = {
    Closed: 0,
    Open: 1
}

export type Openings = number;

export default class Tile {
    private _openings: Openings;

    constructor(openings: Openings) {
        this._openings = openings;
    }

    get openings(): Openings {
        return this._openings;
    }

    boundary(direction: Direction): Boundary {
        return new Boundary(this._openings, direction);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "dimgray";
        ctx.clearRect(0, 0, 64, 64);

        ctx.fillRect(56, 0, 8, 8);
        ctx.fillRect(56, 56, 8, 8);
        ctx.fillRect(0, 56, 8, 8);
        ctx.fillRect(0, 0, 8, 8);

        if (!isOpen(this._openings, Direction.North)) {
            ctx.fillRect(8, 0, 48, 8);
        }
        if (!isOpen(this._openings, Direction.East)) {
            ctx.fillRect(56, 8, 8, 48);
        }
        if (!isOpen(this._openings, Direction.South)) {
            ctx.fillRect(8, 56, 48, 8);
        }
        if (!isOpen(this._openings, Direction.West)) {
            ctx.fillRect(0, 8, 8, 48);
        }
    }

    

    static get all(): Tile[] {
        return buildAllTiles();
    }
}

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

export function build(...directions: Direction[]): Openings {
    const openings: Openings = 0;

    return open(openings, ...directions);
}

export function open(openings: Openings, ...directions: Direction[]): Openings {
    let newOpenings = openings as Openings;

    for (const direction of directions) {
        newOpenings |= direction;
    }

    return newOpenings;
}

export function close(openings: Openings, ...directions: Direction[]): Openings {
    let newOpenings = openings as Openings;

    for (const direction of directions) {
        newOpenings &= ~direction;
    }

    return newOpenings;
}

export function isOpen(openings: Openings, direction: Direction): boolean {
    return (openings & direction) !== 0;
}

export function reverse(direction: Direction): Direction {
    return rotateNibbleLeft(direction, 2) as Direction;
}

function buildAllTiles(): Tile[] {
    const tiles: Tile[] = [];

    for (let i = 0; i < 16; i++) {
        tiles.push(new Tile(i));
    }

    return tiles;
}