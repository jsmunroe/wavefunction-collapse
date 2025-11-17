import type IMovableSprite from "../../contracts/IMovableSprite";
import type { Game } from "../../models/Game";

export default abstract class Mover {
    protected game: Game;
    protected entity: IMovableSprite;

    constructor(game: Game, entity: IMovableSprite) {
        this.game = game;
        this.entity = entity;
    }

    abstract update(deltaTime: number): void;
}