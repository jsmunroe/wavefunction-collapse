import type IMovableSprite from "../../contracts/IMovableSprite";
import type { Game } from "../../models/Game";
import { Direction } from "../../models/Openings";
import { select } from "../../utils/random";
import Mover from "./Mover";

export type RandomMoverOptions = {
    stepDelay?: number;
}

export default class RandomMover extends Mover {
    constructor(game: Game, entity: IMovableSprite, options: RandomMoverOptions = {}) {
        super(game, entity, options);
    }

    update(): void {
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

        const direction = select(validDirections);

        const coordinates = this.moveInRoom(direction, this.entity.coordinates);

        this.entity.moveTo(direction, coordinates)
            .then(() => this.endMove());
    }

}