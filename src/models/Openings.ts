import { rotateNibbleLeft } from "../utils/binary";

export const Direction = {
    North: 1,
    East: 2,
    South: 4,
    West: 8,
} as const;

export type Direction = typeof Direction[keyof typeof Direction];

export type Openings = number;

export function isOpen(openings: Openings, direction: Direction): boolean {
    return (openings & direction) !== 0;
}

export function reverse(direction: Direction): Direction {
    return rotateNibbleLeft(direction, 2) as Direction;
}