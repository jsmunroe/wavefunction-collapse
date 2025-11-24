import type { Element2D } from "../utils/arrays";
import type { Coordinates } from "./Coordinates";
import Entity from "./entities/Entity";
import { Direction } from "./Openings";
import type Room from "./Room";

type BattleAction = 'attack' | 'flee';

type Side = {
    x: number;
    y: number;
    entities: Entity[];
}

export default class Battle {
    side1: Side;
    side2: Side;

    constructor(room: Room, side1: Coordinates, side2: Coordinates) {
        const side1Entities = room.getSpritesAt(side1.room).filter(e => e instanceof Entity) as Entity[];
        const side2Entities = room.getSpritesAt(side2.room).filter(e => e instanceof Entity) as Entity[];

        for (const entity of [...side1Entities, ...side2Entities]) {
            entity.startBattle(this);
        }

        this.side1 = { ...side1.room, entities: side1Entities };
        this.side2 = { ...side2.room, entities: side2Entities };
    }

    act(entity: Entity, direction: Direction): void {
        const isSide1 = this.side(entity) === 1;
        const opponentDirection = this.opponentDirection(entity);

        if (direction === opponentDirection) {
            // Attack
            console.log(`${isSide1 ? 'Side 1' : 'Side 2'} attacks`);
        }
        else {
            // Flee
            console.log(`${isSide1 ? 'Side 1' : 'Side 2'} flees`);
        }
    }

    side(entity: Entity): number {
        return this.side1.entities.includes(entity) ? 1 : 2;
    }

    opponent(entity: Entity): Entity[] {
        const isSide1 = this.side(entity) === 1;
        return isSide1 ? this.side2.entities : this.side1.entities;
    }

    opponentDirection(entity: Entity): Direction {
        const isSide1 = this.side(entity) === 1 ;

        if (this.side1.x < this.side2.x) {
            return isSide1 ? Direction.East : Direction.West;
        }

        if (this.side1.x > this.side2.x) {
            return isSide1 ? Direction.West : Direction.East;
        }

        if (this.side1.y < this.side2.y) {
            return isSide1 ? Direction.South : Direction.North;
        }

        return isSide1 ? Direction.North : Direction.South;
    }
}