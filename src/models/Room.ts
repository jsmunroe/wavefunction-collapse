import type ISprite from "../contracts/ISprite";
import type { Openings } from "./Openings";
import Tile from "./Tile";
import type { Point2D } from "./World";
import type { Element2D } from "../utils/arrays";

export default class Room {
    private _tiles: Tile[][];
    private _sprites: Element2D<ISprite[]>[] = [];

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
        const { room } = sprite.coordinates;

        const existing = this._sprites.find(({item}) => item.includes(sprite));

        if (existing) {
            existing.item = existing.item.filter(s => s !== sprite);
        }

        const sprites = this._sprites.find(({x, y}) => x === room.x && y === room.y);

        if (!sprites) {
            this._sprites.push({ x: room.x, y: room.y, item: [sprite] });
        } else {
            sprites.item.push(sprite);
        }
    }

    removeSprite(sprite: ISprite) {
        const entry = this._sprites.find(({item}) => item.includes(sprite));
        if (entry) {
            entry.item = entry.item.filter(s => s !== sprite);
        }
    }

    getMovableDirectionsFrom({x, y}: Point2D): Openings {
        const tile = this._tiles[y][x];

        return tile.openings;
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

        for (const {item: sprites} of this._sprites) {
            for (const sprite of sprites) {
                const { x, y } = sprite.coordinates.room;
                ctx.save();
                ctx.translate(x * 64, y * 64);
                sprite.draw(ctx);
                ctx.restore();
            }
        }
    }
}
