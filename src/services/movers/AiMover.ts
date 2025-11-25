import type Entity from "../../models/entities/Entity";
import type { Game } from "../../models/Game";
import Mover, { type MoverOptions } from "./Mover";

export default abstract class AiMover extends Mover {
    constructor(game: Game, entity: Entity, options: MoverOptions = {}) {
        super(game, entity, options);
    }
        
    protected async battle(): Promise<void> {
        if (!this.currentBattle) {
            return;
        }

        if (this.entity.timeToNextAction > 0) {
            return;
        }

        const opponentDirection = this.currentBattle?.opponentDirection(this.entity);
        
        this.currentBattle.act(this.entity, opponentDirection);
        
        this.entity.timeToNextAction = 1;
        await this.entity.attack(opponentDirection);
        
    }
}