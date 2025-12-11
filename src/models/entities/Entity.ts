import type IMovableSprite from "../../contracts/IMovableSprite";
import type Mover from "../../services/movers/Mover";
import RandomMover from "../../services/movers/RandomMover";
import Battle from "../Battle";
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
    animationSpeed?: 1 | 2 | 3 | 4 | 5;
}

export default abstract class Entity implements IMovableSprite {
    protected game: Game;
    protected world: World;

    protected standingSprite;
    protected sprite;

    protected _faction: number;

    protected _coordinates: Coordinates;

    protected _mover: Mover;

    protected moving: Point2D = { x: 1, y: 1 };
    protected facing: number = 1;
    protected facingDirections: FacingDirections = FacingDirections.EastWest;

    protected animationFrameCount: number = 1;
    protected animationSpeed: 1 | 2 | 3 | 4 | 5 = 3;

    protected _isMoving: boolean = false;

    protected offset: Point2D = { x: 0, y: 0 };
    protected offsetZ: number = 0;

    protected _currentBattle: Battle | null = null;

    level: number = 1;

    hp: number = 1;
    timeToNextAction: number = 1;

    constructor(game: Game, sprite: string, faction: number, coordinates: Coordinates, options: EntityOptions = {}) {
        this.game = game;
        this.world = game.world;
        this._coordinates = coordinates;

        this._mover = new RandomMover(this.game, this);

        this.sprite = this.standingSprite = sprite;

        this._faction = faction;

        this.facingDirections = options.facingDirections ?? this.facingDirections;
        this.animationFrameCount = options.animationFrameCount ?? this.animationFrameCount;
        this.animationSpeed = options.animationSpeed ?? this.animationSpeed;

        if (this.animationFrameCount > 1) {
            this.cycleFrames();
        }
    }

    get coordinates(): Coordinates {
        return this._coordinates;
    }

    get currentRoom(): Room | null {
        return this.world.getRoom(this.coordinates.world);
    }

    get isMoving(): boolean {
        return this._isMoving;
    }

    get faction(): number {
        return this._faction;
    }

    get mover(): Mover {
        return this._mover;
    }

    get currentBattle(): Battle | null {
        return this._currentBattle;
    }

    moveTo(direction: Direction, coordinates: Coordinates): Promise<void> {
        if (this._isMoving) {
            return Promise.resolve();
        }

        this._isMoving = true;
        this.computeFacingAndMoving(direction);

        const formerRoom = this.currentRoom;

        this._coordinates = coordinates;

        const currentRoom = this.world.getRoom(this.coordinates.world);

        if (formerRoom !== currentRoom) {
            formerRoom?.removeSprite(this);
            currentRoom.addSprite(this);
        }

        return Promise.resolve();
    }

    attack(direction: Direction): Promise<void> {
        return this.animateAttack(direction);
    }

    update(): void {
        this._mover.update();
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

        ctx.imageSmoothingEnabled = false;
        ctx.beginPath();
        const image = this.game.library.getSprite(this.sprite);
        if (image) {
            ctx.drawImage(image, 0, 0);
        }
        ctx.stroke();

        ctx.restore();

        if (this.currentBattle) {
            ctx.fillStyle = "red";
            ctx.fillRect(16, 46, 32, 2);
            ctx.fillStyle = "green";
            ctx.fillRect(16, 46, 32 * this.hp, 2);

            ctx.fillStyle = "blue";
            ctx.fillRect(16, 48, 32, 2);
            ctx.fillStyle = "white";
            ctx.fillRect(16, 48, 32 * (1 - this.timeToNextAction), 2);
        }
    }

    setCurrentRoom(x: number, y: number) {
        if (this.currentRoom) {
            this.currentRoom.removeSprite(this);
        }

        this.coordinates.room = { x, y };

        this.currentRoom?.addSprite(this);
    }

    startBattle(battle: Battle): void {
        this._currentBattle = battle;
        this.timeToNextAction = 1;
        this._mover.startBattle(battle);
    }

    clearBattle(): void {
        this._currentBattle = null;
        this._mover.clearBattle();
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

    protected animateAttack(direction: Direction): Promise<void> {
        const unitVector = { x: 0, y: 0 };
        if (direction === Direction.North) {
            unitVector.y = -1;  
        }
        else if (direction === Direction.South) {
            unitVector.y = 1;  
        }
        else if (direction === Direction.West) {
            unitVector.x = -1;  
        }
        else if (direction === Direction.East) {
            unitVector.x = 1;  
        }

        return new Promise((resolve) => {
            const attack = (count: number) => {
                const factor = (1 - count / 16) ** 2;

                this.offset.x = unitVector.x * factor * 32;
                this.offset.y = unitVector.y * factor * 32;

                if (count >= 0) {
                    setTimeout(() => attack(count - 1), 16);
                }
                else {
                    recoil(16);
                }
            }

            const recoil = (count: number) => {
                const factor = (count / 16) ** 2;

                this.offset.x = unitVector.x * factor * 32;
                this.offset.y = unitVector.y * factor * 32; 

                if (count >= 0) {
                    setTimeout(() => recoil(count - 1), 16);
                }
                else {
                    resolve();
                }
            }

            attack(16);
        });
    }

    protected async battle(coordinates: Coordinates): Promise<void> {
        const currentRoom = this.world.getRoom(this.coordinates.world);        
        const currentBattle = new Battle(currentRoom, this.coordinates, coordinates);

        const battleCoordinates = {
            x: (currentBattle.side1.x + currentBattle.side2.x) / 2,
            y: (currentBattle.side1.y + currentBattle.side2.y) / 2,
        };

        await this.currentRoom?.zoomIn(battleCoordinates);
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

        const delay = [256, 128, 96, 64, 48][this.animationSpeed]

        setTimeout(() => this.cycleFrames((frame + 1) % this.animationFrameCount), delay);
    }
}