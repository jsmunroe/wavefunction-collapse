import type IMovableSprite from "../../contracts/IMovableSprite";
import type { Game } from "../../models/Game";
import { Direction } from "../../models/Openings";
import { wrapWeakHandler } from "../../utils/weak";
import Mover from "./Mover";

const keyboardMoverRegistry = new FinalizationRegistry((controller: AbortController) => {
    controller.abort();
});

export default class KeyboardMover extends Mover {

    constructor(game: Game, entity: IMovableSprite) {
        super(game, entity);

        this.bindEvents();
    }

    update(_deltaTime: number): void { }

    private bindEvents(): void {
        const controller = new AbortController();
        keyboardMoverRegistry.register(this, controller);

        const { signal } = controller;

        document.addEventListener("keydown", wrapWeakHandler(this, this.onKeyDown), { signal });
    }

    private onKeyDown = (event: KeyboardEvent): void => {
        switch (event.key) {
            case "ArrowUp":
                this.move(Direction.North);
                break;
            case "ArrowRight":
                this.move(Direction.East);
                break;
            case "ArrowDown":
                this.move(Direction.South);
                break;
            case "ArrowLeft":
                this.move(Direction.West);
                break;
        }
    };

    private move(direction: Direction): void {
        const currentRoom = this.game.world.getRoom(this.entity.coordinates.world);

        let { world } = this.entity.coordinates;
        const { room } = this.entity.coordinates;
        const openings = currentRoom.getMovableDirectionsFrom(room);

        if ((openings & direction) !== 0) {
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

            this.entity.moveTo({ world, room: { x, y } });
        }
    }
}