import type IMovableSprite from "../../contracts/IMovableSprite";
import type { Coordinates } from "../../models/Coordinates";
import type { Game } from "../../models/Game";
import { Direction } from "../../models/Openings";

export default abstract class Mover {
    protected game: Game;
    protected entity: IMovableSprite;

    constructor(game: Game, entity: IMovableSprite) {
        this.game = game;
        this.entity = entity;
    }

    abstract update(): void;

    protected moveInRoom(direction: Direction, coordinates: Coordinates): Coordinates {
        let { room } = coordinates;
        let { x, y } = room;

        switch (direction) {
            case Direction.North:
                y -= 1;
                break;
            case Direction.East:
                x += 1;
                break;
            case Direction.South:
                y += 1;
                break;
            case Direction.West:
                x -= 1;
                break;
        }

        room = {x, y};

        return this.normalizeCoordinates({ ...coordinates, room });
    }

    protected normalizeCoordinates(coordinates: Coordinates): Coordinates {
        let { world, room } = coordinates;
        let { x, y } = room;

        const currentRoom = this.game.world.getRoom(world);

        while (x < 0) {
            world = { x: world.x - 1, y: world.y };
            x += currentRoom.width;
        }

        while (y < 0) {
            world = { x: world.x,  y: world.y - 1 };
            y += currentRoom.height;
        }

        while (x >= currentRoom.width) {
            world = { x: world.x + 1, y: world.y };
            x -= currentRoom.width;
        }

        while (y >= currentRoom.height) {
            world = { x: world.x, y: world.y + 1 };
            y -= currentRoom.height;
        }

        room = { x, y };

        return { world, room };
    }
}