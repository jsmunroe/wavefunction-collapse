import type ISprite from "../contracts/ISprite";
import type { Coordinates } from "./Coordinates";
import type { Game } from "./Game";
import type Room from "./Room";
import type World from "./World";

export default class Player implements ISprite {
    private _game: Game;
    private _world: World;

    private _coordinates: Coordinates = { room: { x: 5, y: 5 }, world: { x: 0, y: 0 } };

    private _currentRoom: Room;

    constructor(game: Game) {
        this._game = game;
        this._world = game.world;
        this._currentRoom = this._world.getRoom(this._coordinates.world);
        this._currentRoom.addSprite(this);
    }

    get coordinates() {
        return this._coordinates;
    }

    get currentRoom() {
        return this._currentRoom;
    }

    setCurrentRoom(x: number, y: number) {
        this._coordinates.room = { x, y };
        if (this._currentRoom) {
            this._currentRoom.removeSprite(this);
        }

        this._currentRoom = this._world.getRoom(this._coordinates.world);
        this._currentRoom.addSprite(this);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-32, 0);
        const image = this._game.library.getImage('player');
        if (image) {
            ctx.drawImage(image, 0, 0);
        }
        ctx.restore();
    }


}