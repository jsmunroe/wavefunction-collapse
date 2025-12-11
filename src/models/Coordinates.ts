import { roomHeight, type Point2D } from "./World";

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

export function north(coordinates: Coordinates, units = 1): Coordinates {
    let { world, room } = {...coordinates};

    room = { x: room.x, y: room.y - units };

    if (room.y - units <= 0) {
        world = { x: world.x, y: world.y - 1 };
        room = { x: room.x, y: room.y + roomHeight };
    }

    return { world, room };
}

export function east(coordinates: Coordinates, units = 1): Coordinates {
    let { world, room } = {...coordinates};

    room = { x: room.x + units, y: room.y };
    if (room.x >= roomHeight) {
        world = { x: world.x + 1, y: world.y };
        room = { x: room.x - roomHeight, y: room.y };
    }
    return { world, room };
}

export function south(coordinates: Coordinates, units = 1): Coordinates {
    let { world, room } = {...coordinates};

    room = { x: room.x, y: room.y + units };

    if (room.y >= roomHeight) {
        world = { x: world.x, y: world.y + 1 };
        room = { x: room.x, y: room.y - roomHeight };
    }

    return { world, room };
}

export function west(coordinates: Coordinates, units = 1): Coordinates {
    let { world, room } = {...coordinates};

    room = { x: room.x - units, y: room.y };
    
    if (room.x < 0) {
        world = { x: world.x - 1, y: world.y };
        room = { x: room.x + roomHeight, y: room.y };
    }

    return { world, room };
}