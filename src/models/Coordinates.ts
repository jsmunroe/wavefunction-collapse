import type { Point2D } from "./World";

export type Coordinates = {
    world: Point2D;
    room: Point2D;
};


export function equals(a: Point2D, b: Point2D): boolean;
export function equals(a: Coordinates, b: Coordinates): boolean;
export function equals(a: Coordinates | Point2D, b: Coordinates | Point2D): boolean {
    if ('x' in a && 'x' in b) {
        return a.x === b.x && a.y === b.y;
    }

    if ('world' in a && 'world' in b && 'room' in a && 'room' in b) {
        return a.world.x === b.world.x &&
            a.world.y === b.world.y &&
            a.room.x === b.room.x &&
            a.room.y === b.room.y;
    }

    throw new Error("Invalid arguments");
}
