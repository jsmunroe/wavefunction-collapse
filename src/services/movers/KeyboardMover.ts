import type Entity from "../../models/entities/Entity";
import type { Game } from "../../models/Game";
import { Direction } from "../../models/Openings";
import { wrapWeakHandler } from "../../utils/weak";
import Mover from "./Mover";

const keyboardMoverRegistry = new FinalizationRegistry((controller: AbortController) => {
    controller.abort();
});

export default class KeyboardMover extends Mover {

    private _keysDown: Set<string> = new Set();

    constructor(game: Game, entity: Entity) {
        super(game, entity);

        this.bindEvents();
    }

    protected move(): void {
        if (this.currentBattle) {
            this.battle();
            return;
        }

        if (this._keysDown.has("ArrowUp") || this._keysDown.has("w")) {
            this.moveInDirection(Direction.North);
        }
        else if (this._keysDown.has("ArrowRight") || this._keysDown.has("d")) {
            this.moveInDirection(Direction.East);
        }
        else if (this._keysDown.has("ArrowDown") || this._keysDown.has("s")) {
            this.moveInDirection(Direction.South);
        }
        else if (this._keysDown.has("ArrowLeft") || this._keysDown.has("a")) {
            this.moveInDirection(Direction.West);
        }
    }

    protected battle(): void {
        if (!this.currentBattle) {
            return;
        }

        if (this._keysDown.has("ArrowUp") || this._keysDown.has("w")) {
            this.currentBattle.act(this.entity, Direction.North);
        }
        else if (this._keysDown.has("ArrowRight") || this._keysDown.has("d")) {
            this.currentBattle.act(this.entity, Direction.East);
        }
        else if (this._keysDown.has("ArrowDown") || this._keysDown.has("s")) {
            this.currentBattle.act(this.entity, Direction.South);
        }
        else if (this._keysDown.has("ArrowLeft") || this._keysDown.has("a")) {
            this.currentBattle.act(this.entity, Direction.West);
        }

    }

    private bindEvents(): void {
        const controller = new AbortController();
        keyboardMoverRegistry.register(this, controller);

        const { signal } = controller;

        document.addEventListener("keydown", wrapWeakHandler(this, this.onKeyDown), { signal });
        document.addEventListener("keyup", wrapWeakHandler(this, this.onKeyUp), { signal });
    }

    private onKeyDown = (event: KeyboardEvent): void => {
        this._keysDown.add(event.key);
    };

    private onKeyUp = (event: KeyboardEvent): void => {
        this._keysDown.delete(event.key);
    };

    private moveInDirection(direction: Direction): void {
        const currentRoom = this.game.world.getRoom(this.entity.coordinates.world);

        let { world } = this.entity.coordinates;
        const { room } = this.entity.coordinates;
        const openings = currentRoom.getMovableDirectionsFrom(room);

        if ((openings & direction) === 0) {
            return;
        }

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

        if (x < 0) {
            x = currentRoom.width - 1;
            world = { ...world, x: world.x - 1 };
        }

        if (x >= currentRoom.width) {
            x = 0;
            world = { ...world, x: world.x + 1 };
        }

        if (y < 0) {
            y = currentRoom.height - 1;
            world = { ...world, y: world.y - 1 };
        }

        if (y >= currentRoom.height) {
            y = 0;
            world = { ...world, y: world.y + 1 };
        }

        this.entity.moveTo(direction, { world, room: { x, y } });
    }
}