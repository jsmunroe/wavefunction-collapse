import type IRoomContext from "../../contracts/IRoomContext";
import { create, type Element2D } from "../../utils/arrays";
import Tile from "../../models/Tile";
import type { Point2D } from "../../models/World";

export default class TileGrid {
    private _tiles: Tile[][][];

    readonly width: number;
    readonly height: number;

    private _roomContext: IRoomContext;
    private _worldCoordinates: Point2D;


    constructor(world: Point2D, width: number, height: number, roomContext: IRoomContext) {
        this._tiles = create(height, () => create(width, () => [...Tile.all]));
        this.width = width;
        this.height = height;
        this._roomContext = roomContext;
        this._worldCoordinates = world;
    }

    get worldCoordinates(): Point2D {
        return this._worldCoordinates;
    }

    get tiles(): Tile[][] {
        return this._tiles.map2D(tiles => tiles[0]);
    }

    get allTiles(): Element2D<Tile[]>[] {
        return this._tiles.flat2D();
    }

    hasTileAt(x: number, y: number): boolean {
        return (x >= -1 && x <= this._tiles[0].length && y >= -1 && y <= this._tiles.length);
    }

    getTilesAt(x: number, y: number): Tile[] {
        if (x < 0) {
            if (this._roomContext.hasRoom({ x: this._worldCoordinates.x - 1, y: this._worldCoordinates.y })) {
                return [this._roomContext.getRoom({ x: this._worldCoordinates.x - 1, y: this._worldCoordinates.y }).tiles[y][this.width - 1]];
            }

            return Tile.all;
        }

        if (x >= this.width) {
            if (this._roomContext.hasRoom({ x: this._worldCoordinates.x + 1, y: this._worldCoordinates.y })) {
                return [this._roomContext.getRoom({ x: this._worldCoordinates.x + 1, y: this._worldCoordinates.y }).tiles[y][0]];
            }

            return Tile.all;
        }

        if (y < 0) {
            if (this._roomContext.hasRoom({ x: this._worldCoordinates.x, y: this._worldCoordinates.y - 1 })) {
                return [this._roomContext.getRoom({ x: this._worldCoordinates.x, y: this._worldCoordinates.y - 1 }).tiles[this.height - 1][x]];
            }

            return Tile.all;
        }

        if (y >= this.height) {
            if (this._roomContext.hasRoom({ x: this._worldCoordinates.x, y: this._worldCoordinates.y + 1 })) {
                return [this._roomContext.getRoom({ x: this._worldCoordinates.x, y: this._worldCoordinates.y + 1 }).tiles[0][x]];
            }

            return Tile.all;
        }

        return this._tiles[y][x];
    }

    setTilesAt(x: number, y: number, tiles: Tile[]) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }

        this._tiles[y][x] = tiles;
    }

    modifyTilesAt(x: number, y: number, modifier: (tiles: Tile[]) => Tile[]) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }   
        this._tiles[y][x] = modifier(this._tiles[y][x]);
    }
}

