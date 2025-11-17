import type IMovableSprite from "../contracts/IMovableSprite";
import KeyboardMover from "../services/movers/KeyboardMover";
import type Mover from "../services/movers/Mover";
import type { Coordinates } from "./Coordinates";
import type { Game } from "./Game";
import type Room from "./Room";
import type { Point2D } from "./World";
import type World from "./World";

export default class Player implements IMovableSprite {
    private _game: Game;
    private _world: World;

    private _coordinates: Coordinates = { room: { x: 5, y: 5 }, world: { x: 0, y: 0 } };

    private _currentRoom: Room;

    private _mover: Mover;

    private _facing: Point2D = { x: 1, y: 1 };

    private _isMoving: boolean = false;
    private _offset: Point2D = { x: 0, y: 0 };

    constructor(game: Game) {
        this._game = game;
        this._world = game.world;
        this._currentRoom = this._world.getRoom(this._coordinates.world);
        this._currentRoom.addSprite(this);

        this._mover = new KeyboardMover(this._game, this);
    }

    moveTo(coordinates: Coordinates): void {
        if (this._isMoving) {
            return;
        }

        this._isMoving = true;
        this._facing = this.toFacing(coordinates);

        this._coordinates = coordinates;

        const formerRoom = this._currentRoom;

        this._currentRoom = this._world.getRoom(this._coordinates.world);

        if (formerRoom !== this._currentRoom) {
            formerRoom.removeSprite(this);
            this._currentRoom.addSprite(this);
        }


        this._offset = { x: 64 * this._facing.x, y: 64 * this._facing.y };
        const offset = (count: number) => {

            this._offset.x -= this._facing.x;
            this._offset.y -= this._facing.y;

            if (count >= 0) {
                setTimeout(() => offset(count - 1), 1);
            }
            else {
                this._isMoving = false;
                this._offset = { x: 0, y: 0 };
            }
        }

        offset(64);
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
        let facing = Math.sign(this._facing.x);
        facing = facing === 0 ? 1 : facing;

        ctx.save();
        if (facing < 0) {
            ctx.translate(48, 16);
        }
        else {
            ctx.translate(16, 16);
        }
        ctx.translate(this._offset.x, this._offset.y);
        ctx.scale(facing, 1);

        ctx.beginPath();
        const image = this._game.library.getImage('player');
        if (image) {
            ctx.drawImage(image, 0, 0);
        }
        ctx.stroke();

        ctx.restore();
    }

    private toFacing(coordinates: Coordinates): Point2D {
        const facing = { x: 0, y: 0 };

        if (this._coordinates.world.x - coordinates.world.x > 0) {
            facing.x = 1;
        }
        else if (this._coordinates.world.x - coordinates.world.x < 0) {
            facing.x = -1;
        }
        else {
            if (this._coordinates.room.x - coordinates.room.x > 0) {
                facing.x = 1;
            }
            else if (this._coordinates.room.x - coordinates.room.x < 0) {
                facing.x = -1;
            }
            else {
                facing.x = 0;
            }
        }

        if (this._coordinates.world.y - coordinates.world.y > 0) {

            facing.y = 1;
        }
        else if (this._coordinates.world.y - coordinates.world.y < 0) {

            facing.y = -1;
        }
        else{
            if (this._coordinates.room.y - coordinates.room.y > 0) {
                facing.y = 1;
            }
            else if (this._coordinates.room.y - coordinates.room.y < 0) {
                facing.y = -1;
            }
            else {
                facing.y = 0;
            }
        }

        return facing;
    }
}