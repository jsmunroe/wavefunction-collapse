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

    private _sprite = 'player';

    private _coordinates: Coordinates = { room: { x: 5, y: 5 }, world: { x: 0, y: 0 } };

    private _currentRoom: Room;

    private _mover: Mover;

    private _moving: Point2D = { x: 1, y: 1 };
    private _facing: number = 1;

    private _isMoving: boolean = false;
    private _offset: Point2D = { x: 0, y: 0 };

    constructor(game: Game) {
        this._game = game;
        this._world = game.world;
        this._currentRoom = this._world.getRoom(this._coordinates.world);
        this._currentRoom.addSprite(this);

        this._mover = new KeyboardMover(this._game, this);
    }

    moveTo(coordinates: Coordinates): Promise<void> {
        if (this._isMoving) {
            return Promise.resolve();
        }

        this._isMoving = true;
        this.computeFacingAndMoving(coordinates);

        this._coordinates = coordinates;

        const formerRoom = this._currentRoom;

        this._currentRoom = this._world.getRoom(this._coordinates.world);

        if (formerRoom !== this._currentRoom) {
            formerRoom.removeSprite(this);
            this._currentRoom.addSprite(this);
        }

        const sprites = [
            'player.walking.0',
            'player',
            'player.walking.1',
            'player',
        ]

        return new Promise((resolve) => {
            this._offset = { x: 64 * this._moving.x, y: 64 * this._moving.y };
            const offset = (count: number) => {

                this._offset.x -= this._moving.x;
                this._offset.y -= this._moving.y;

                this._sprite = sprites[Math.floor(count / 16) % sprites.length];

                if (count >= 0) {
                    setTimeout(() => offset(count - 1), 5);
                }
                else {
                    this._isMoving = false;
                    this._offset = { x: 0, y: 0 };
                    this._sprite = 'player';
                    resolve();
                }
            }

            offset(64);
        })
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

    update(): void {
        this._mover.update();
    }

    draw(ctx: CanvasRenderingContext2D): void {
            ctx.save();
        if (this._facing < 0) {
            ctx.translate(48, 16);
        }
        else {
            ctx.translate(16, 16);
        }
        ctx.translate(this._offset.x, this._offset.y);
        ctx.scale(this._facing, 1);

        ctx.beginPath();
        const image = this._game.library.getImage(this._sprite);
        if (image) {
            ctx.drawImage(image, 0, 0);
        }
        ctx.stroke();

        ctx.restore();
    }

    private computeFacingAndMoving(coordinates: Coordinates) {
        this._moving = { x: 0, y: 0 };

        if (this._coordinates.world.x - coordinates.world.x > 0) {
            this._facing = 1;
            this._moving = {...this._moving, x: 1 };
        }
        else if (this._coordinates.world.x - coordinates.world.x < 0) {
            this._facing = -1;
            this._moving = {...this._moving, x: -1 };
        }
        else {
            if (this._coordinates.room.x - coordinates.room.x > 0) {
                this._facing = 1;
                this._moving = {...this._moving, x: 1 };
            }
            else if (this._coordinates.room.x - coordinates.room.x < 0) {
                this._facing = -1;
                this._moving = {...this._moving, x: -1 };
            }
            else {
                this._moving = {...this._moving, x: 0 };
            }
        }

        if (this._coordinates.world.y - coordinates.world.y > 0) {
            this._moving = {...this._moving, y: 1 };
        }
        else if (this._coordinates.world.y - coordinates.world.y < 0) {
            this._moving = {...this._moving, y: -1 };
        }
        else{
            if (this._coordinates.room.y - coordinates.room.y > 0) {
                this._moving = {...this._moving, y: 1 };
            }
            else if (this._coordinates.room.y - coordinates.room.y < 0) {
                this._moving = {...this._moving, y: -1 };
            }
            else {
                this._moving = {...this._moving, y: 0 };
            }
        }
    }
}