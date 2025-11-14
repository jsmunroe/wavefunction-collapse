import type ISprite from "../contracts/ISprite";
import Tile from "./Tile";
import type { Point2D } from "./World";

export default class Room {
    private _tiles: Tile[][];
    private _sprites: Map<Point2D, ISprite[]> = new Map<Point2D, ISprite[]>();

    constructor(tiles: Tile[][]) {
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

    addSprite(sprite: ISprite) {
        const sprites = this._sprites.get(sprite.coordinates.room) || [];
        this._sprites.set(sprite.coordinates.room, [...sprites, sprite]);
    }

    removeSprite(sprite: ISprite) {
        const entry = Array.from(this._sprites).find(([, spritesAtPoint]) => spritesAtPoint.includes(sprite));
        if (entry) {
            const [point, spritesAtPoint] = entry;
            this._sprites.set(point, spritesAtPoint.filter(s => s !== sprite));
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this._tiles[y][x];
                ctx.save();
                ctx.translate(x * 64, y * 64);
                tile.draw(ctx);
                ctx.restore();
            }
        }
        
        for (const [{x, y}, sprites] of this._sprites) {
            for (const sprite of sprites) {
                ctx.save();
                ctx.translate(x * 64 + 16, y * 64 + 16);
                sprite.draw(ctx);
                ctx.restore();
            }
        }
    }
}
