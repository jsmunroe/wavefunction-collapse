import { select } from "../utils/random";
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

    private _room: Room;

    private _isOngoing: boolean = true;

    constructor(room: Room, side1: Coordinates, side2: Coordinates) {
        const side1Entities = room.getSpritesAt(side1.room).filter(e => e instanceof Entity) as Entity[];
        const side2Entities = room.getSpritesAt(side2.room).filter(e => e instanceof Entity) as Entity[];

        for (const entity of [...side1Entities, ...side2Entities]) {
            entity.startBattle(this);
        }

        this.side1 = { ...side1.room, entities: side1Entities };
        this.side2 = { ...side2.room, entities: side2Entities };

        this._room = room;

        this.updateBattleState();
    }

    get isOngoing(): boolean {
        return this._isOngoing;
    }

    act(entity: Entity, direction: Direction): void {
        if (entity.timeToNextAction > 0) {
            return;
        }

        const isSide1 = this.side(entity) === 1;
        const opponentDirection = this.opponentDirection(entity);

        if (direction === opponentDirection) {
            // Attack
            console.log(`${isSide1 ? 'Side 1' : 'Side 2'} attacks`);
            const attacker = isSide1 ? this.side1 : this.side2;
            const defender = isSide1 ? this.side2 : this.side1;
            this.attack(attacker, defender);
        }
        else {
            // Flee
            console.log(`${isSide1 ? 'Side 1' : 'Side 2'} flees`);
        }

        if (this.side1.entities.length === 0 || this.side2.entities.length === 0) {
            this._isOngoing = false;

            for (const entity of [...this.side1.entities, ...this.side2.entities]) {
                entity.clearBattle();
            }

            this._room.zoomOut();
            console.log("Battle has ended.");
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

    protected attack(attacker: Side, defender: Side): void {
        const attackingEntity = select(attacker.entities.filter(e => e.hp > 0 && e.timeToNextAction <= 0));
        const defendingEntity = select(defender.entities.filter(e => e.hp > 0));

        if (!attackingEntity || !defendingEntity) {
            return;
        }

        const power = attackingEntity.level / defendingEntity.level / 5.0 * (Math.random() * 2);
        defendingEntity.hp = Math.max(0, defendingEntity.hp - power);

        if (defendingEntity.hp <= 0) {
            console.log(`${defendingEntity.constructor.name} has been defeated!`);
            defender.entities = defender.entities.filter(e => e !== defendingEntity);
            defendingEntity.currentRoom.removeSprite(defendingEntity);
            defendingEntity.clearBattle();
        }

        attackingEntity.timeToNextAction = 1.0;

        console.log(`${attackingEntity.constructor.name} attacks ${defendingEntity.constructor.name} for ${power.toFixed(2)} damage. (${defendingEntity.hp.toFixed(2)} HP left)`);
    }

    private updateBattleState(): void {
        for (const entity of [...this.side1.entities, ...this.side2.entities]) {
            entity.timeToNextAction = Math.max(0, entity.timeToNextAction - 0.005 * entity.level);
        }

        if (this.isOngoing) {
            setTimeout(() => this.updateBattleState(), 16);
        }
    }
}