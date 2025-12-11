import { rotateNibbleLeft } from "../utils/binary";
import type { Point2D } from "./World";

export const Direction = {
    North: 1,
    NorthEast: 1 | 2,
    East: 2,
    SouthEast: 4 | 2,
    South: 4,
    SouthWest: 4 | 8,
    West: 8,
    NorthWest: 1 | 8,
} as const;

export const isSecondary = (direction: number): boolean => {
    return direction === Direction.NorthEast ||
           direction === Direction.SouthEast ||
           direction === Direction.SouthWest ||
           direction === Direction.NorthWest;
}

export type Direction = typeof Direction[keyof typeof Direction];

export type Openings = number;

export function isOpen(openings: Openings, direction: Direction): boolean {
    return (openings & direction) !== 0;
}

export function reverse(direction: Direction): Direction {
    return rotateNibbleLeft(direction, 2) as Direction;
}

export function right(direction: Direction): Direction {
    return rotateNibbleLeft(direction, 1) as Direction;
}

export function left(direction: Direction): Direction {
    return rotateNibbleLeft(direction, 3) as Direction;
}

export function getCoordsInDirection(coords: Point2D, direction: Direction, distance: number = 1): Point2D {
    switch (direction) {
        case Direction.North:
            return { x: coords.x, y: coords.y - distance };
        case Direction.NorthEast:
            return { x: coords.x + distance, y: coords.y - distance };
        case Direction.East:
            return { x: coords.x + distance, y: coords.y };
        case Direction.SouthEast:
            return { x: coords.x + distance, y: coords.y + distance };
        case Direction.South:
            return { x: coords.x, y: coords.y + distance };
        case Direction.SouthWest:
            return { x: coords.x - distance, y: coords.y + distance };
        case Direction.West:
            return { x: coords.x - distance, y: coords.y };
        case Direction.NorthWest:
            return { x: coords.x - distance, y: coords.y - distance };
        default:
            return { x: coords.x, y: coords.y };
    }
}

export function getDirectionFromCoords(from: Point2D, to: Point2D): Direction {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (dx === 0 && dy < 0) return Direction.North;
    if (dx > 0 && dy < 0) return Direction.NorthEast;
    if (dx > 0 && dy === 0) return Direction.East;
    if (dx > 0 && dy > 0) return Direction.SouthEast;
    if (dx === 0 && dy > 0) return Direction.South;
    if (dx < 0 && dy > 0) return Direction.SouthWest;
    if (dx < 0 && dy === 0) return Direction.West;
    if (dx < 0 && dy < 0) return Direction.NorthWest;

    return Direction.North; // default case
}