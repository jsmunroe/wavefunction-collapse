import type ISprite from "../contracts/ISprite";
import type { Openings } from "./Openings";
import Tile from "./Tile";
import type { Point2D } from "./World";
import { equals } from "./Coordinates";

export default class Room {
    private _coordinates: Point2D;
    private _tiles: Tile[][];
    private _sprites: Set<ISprite> = new Set();

    // Used for zooming and battle mode
    private _zoomLevel: number = 1;
    private _zoomTarget: Point2D | null = null;

    constructor(coordinates: Point2D, tiles: Tile[][]) {
        this._coordinates = coordinates;
        this._tiles = tiles;
    }

    get width(): number {
        return this._tiles[0].length;
    }

    get height(): number {
        return this._tiles.length;
    }

    get tiles(): Tile[][] {
        return [...this._tiles.map(row => [...row])];
    }

    get sprites(): ISprite[] {
        return Array.from(this._sprites);
    }

    get level(): number {
        return Math.ceil( Math.sqrt(this._coordinates.x ** 2 + this._coordinates.y ** 2)) + 1;
    }

    get x(): number {
        return this._coordinates.x;
    }

    get y(): number {
        return this._coordinates.y;
    }

    addSprite(sprite: ISprite) {
        if (this._sprites.has(sprite)) {
            return;
        }

        this._sprites.add(sprite);
    }

    removeSprite(sprite: ISprite) {
        this._sprites.delete(sprite);
    }

    getSpritesAt(coord: Point2D): ISprite[] {
        return [...this._sprites].filter(sprite => equals(sprite.coordinates.room, coord));
    }

    getMovableDirectionsFrom({x, y}: Point2D): Openings {
        try {            const tile = this._tiles[y][x];

            return tile.openings;
        }
        catch {
            return 0;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        if (this._zoomTarget) {
            ctx.translate(this._zoomTarget.x + ctx.canvas.width / 2, this._zoomTarget.y + ctx.canvas.height / 2);
        }

        ctx.scale(this._zoomLevel, this._zoomLevel);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this._tiles[y][x];
                ctx.save();
                ctx.translate(x * 64, y * 64);
                tile.draw(ctx);
                ctx.restore();
            }
        }

        for (const sprite of this._sprites) {
            const { x, y } = sprite.coordinates.room;
            ctx.save();
            ctx.translate(x * 64, y * 64);
            sprite.draw(ctx);
            ctx.restore();
        }

        ctx.font = "24px Arial";
        ctx.fillStyle = "#CCCCEE";
        ctx.fillText(`${this.level}`, 20, 30);

        ctx.restore();
    }

    zoomIn(target: Point2D, zoomLevel = 5): Promise<void> {
        return new Promise((resolve) => {
                const zoomTarget = {
                x: (target.x + 0.5) * 64 * zoomLevel / (zoomLevel - 1),
                y: (target.y + 0.5) * 64 * zoomLevel / (zoomLevel - 1),
            }

            const animageZoom = (count: number) => {
                this._zoomLevel = 1 + (zoomLevel - 1) * (count / 64);
                console.log(this._zoomLevel);
                this._zoomTarget = {
                    x: zoomTarget.x * (1 - this._zoomLevel),
                    y: zoomTarget.y * (1 - this._zoomLevel),
                };

                if (count < 64) {
                    setTimeout(() => animageZoom(count + 1), 16);
                }
                else {
                    resolve();
                }
            }

            animageZoom(0);
        });
    }
}
