import type Battle from "../../models/Battle";
import type { Coordinates } from "../../models/Coordinates";
import type Entity from "../../models/entities/Entity";
import type { Game } from "../../models/Game";
import { Direction } from "../../models/Openings";
import { select } from "../../utils/random";

export type MoverOptions = {
    stepDelay?: number;
}

export default abstract class Mover {
    protected game: Game;
    protected entity: Entity;

    protected stepDelay: number = 500;
    protected isDelaying: boolean = false;

    protected currentBattle: Battle | null = null;

    constructor(game: Game, entity: Entity, options: MoverOptions = {}) {
        this.game = game;
        this.entity = entity;
        this.stepDelay = options.stepDelay ?? this.stepDelay;
    }

    update() {
        this.move();
    }

    startBattle(battle: Battle): void {
        this.currentBattle = battle;
    }

    clearBattle(): void {
        this.currentBattle = null;
    }

    protected abstract move(): void;

    protected endMove(): void {
        if (this.isDelaying || this.stepDelay <= 0) {
            return;
        }

        this.isDelaying = true;

        setTimeout(() => {
            this.isDelaying = false;
        }, this.stepDelay);
    }

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

    protected getValidDirections(): Direction[] {
        const { world, room } = this.entity.coordinates;

        const currentRoom = this.game.world.getRoom(world);
        const openings = currentRoom.getMovableDirectionsFrom(room);

        const validDirections: Direction[] = [];

        if ((openings & Direction.North) !== 0 && room.y > 0) {
            validDirections.push(Direction.North);
        }

        if ((openings & Direction.East) !== 0 && room.x < currentRoom.width - 1) {
            validDirections.push(Direction.East);
        }

        if ((openings & Direction.South) !== 0 && room.y < currentRoom.height - 1) {
            validDirections.push(Direction.South);
        }

        if ((openings & Direction.West) !== 0 && room.x > 0) {
            validDirections.push(Direction.West);
        }
        return validDirections;
    }

    protected selectRandomDirection(): Direction | null {
        const validDirections = this.getValidDirections();

        if (validDirections.length === 0) {
            return null;
        }

        return select(validDirections);
    }
}