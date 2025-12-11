import type Entity from "../../models/entities/Entity";
import type { Game } from "../../models/Game";
import { Direction } from "../../models/Openings";
import AiMover from "./AiMover";

export type RandomMoverOptions = {
    stepDelay?: number;
}

export default class RandomMover extends AiMover {
    constructor(game: Game, entity: Entity, options: RandomMoverOptions = {}) {
        super(game, entity, options);
    }

    protected move(): void {
        if (this.currentBattle) {
            this.battle();
            return;
        }

        if (this.isDelaying) {
            return;
        }

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

        if (validDirections.length === 0) {
            return;
        }

        const direction = this.random.select(validDirections);

        const coordinates = this.moveInRoom(direction, this.entity.coordinates);

        this.entity.moveTo(direction, coordinates)
            .then(() => this.endMove());
    }
}