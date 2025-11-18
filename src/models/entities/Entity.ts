import type IMovableSprite from "../../contracts/IMovableSprite";
import type Mover from "../../services/movers/Mover";
import RandomMover from "../../services/movers/RandomMover";
import type { Coordinates } from "../Coordinates";
import type { Game } from "../Game";
import { Direction } from "../Openings";
import type Room from "../Room";
import type { Point2D } from "../World";
import type World from "../World";

export type AnimateOptions = {
    curve?: (t: number) => number;
}

export const FacingDirections = {
    None: 0,
    EastWest: 1, 
} as const;

export type FacingDirections = typeof FacingDirections[keyof typeof FacingDirections];

export type EntityOptions = {
    facingDirections?: FacingDirections,
    animationFrameCount?: number,
}

export default abstract class Entity implements IMovableSprite {
    protected game: Game;
    protected world: World;

    protected standingSprite;
    protected sprite;

    protected _coordinates: Coordinates;

    protected _currentRoom: Room;

    protected mover: Mover;

    protected moving: Point2D = { x: 1, y: 1 };
    protected facing: number = 1;
    protected facingDirections: FacingDirections = FacingDirections.EastWest;

    protected animationFrameCount: number = 1;

    protected _isMoving: boolean = false;

    protected offset: Point2D = { x: 0, y: 0 };
    protected offsetZ: number = 0;

    constructor(game: Game, sprite: string, coordinates: Coordinates, options: EntityOptions = {}) {
        this.game = game;
        this.world = game.world;
        this._coordinates = coordinates;
        this._currentRoom = this.world.getRoom(this.coordinates.world);
        this._currentRoom.addSprite(this);

        this.mover = new RandomMover(this.game, this);

        this.sprite = this.standingSprite = sprite;

        this.facingDirections = options.facingDirections ?? this.facingDirections;
        this.animationFrameCount = options.animationFrameCount ?? this.animationFrameCount;

        if (this.animationFrameCount > 1) {
            this.cycleFrames();
        }
    }

    get coordinates(): Coordinates {
        return this._coordinates;
    }

    get currentRoom(): Room {
        return this._currentRoom;
    }

    get isMoving(): boolean {
        return this._isMoving;
    }

    abstract moveTo(direction: Direction, coordinates: Coordinates): Promise<void>;

    update(): void {
        this.mover.update();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        if (this.facing < 0) {
            ctx.translate(48, 16);
        }
        else {
            ctx.translate(16, 16);
        }
        ctx.translate(this.offset.x, this.offset.y + this.offsetZ);
        ctx.scale(this.facing, 1);

        ctx.beginPath();
        const image = this.game.library.getImage(this.sprite);
        if (image) {
            ctx.drawImage(image, 0, 0);
        }
        ctx.stroke();

        ctx.restore();
    }

    setCurrentRoom(x: number, y: number) {
        this.coordinates.room = { x, y };
        if (this._currentRoom) {
            this._currentRoom.removeSprite(this);
        }

        this._currentRoom = this.world.getRoom(this.coordinates.world);
        this._currentRoom.addSprite(this);
    }

    protected updateFrame(frame: number): string | null {
        return null;
    }

    protected animate(frames: string[], frameCount: number, options: AnimateOptions = {}): Promise<void> {
        return new Promise((resolve) => {
            this.offset = { x: 64 * this.moving.x, y: 64 * this.moving.y };
            const animate = (count: number) => {

                this.offset.x -= this.moving.x * 64 / frameCount;
                this.offset.y -= this.moving.y * 64 / frameCount;

                const t = 1 - count / frameCount;
                this.offsetZ = options.curve ? options.curve(t) * 64 : 0;

                if (frames.length > 0) {
                    this.sprite = frames[Math.floor((frameCount - count) / 16) % frames.length];
                }

                if (count >= 0) {
                    setTimeout(() => animate(count - 1), 4);
                }
                else {
                    this._isMoving = false;
                    this.offset = { x: 0, y: 0 };
                    this.sprite = this.standingSprite;
                    resolve();
                }
            }

            animate(frameCount);
        })
    }

    protected computeFacingAndMoving(direction: Direction) {
        this.moving = { x: 0, y: 0 };

        if (direction === Direction.North) {
            this.moving = { x: 0, y: 1 };
        } 
        else if (direction === Direction.South) {
            this.moving = { x: 0, y: -1 };
        } 
        
        if (direction === Direction.West) {
            this.facing = this.facingDirections == FacingDirections.EastWest ? 1 : this.facing;
            this.moving = { x: 1, y: 0 };
        }
        else if (direction === Direction.East) {
            this.facing = this.facingDirections == FacingDirections.EastWest ? -1 : this.facing;
            this.moving = { x: -1, y: 0 };
        }
    }

    private cycleFrames(frame: number = 0): void {
        this.sprite = this.updateFrame(frame) ?? this.sprite;

        setTimeout(() => this.cycleFrames((frame + 1) % this.animationFrameCount), 128);
    }
}