import type IRoomContext from "../../contracts/IRoomContext";
import { create, type Element2D } from "../../utils/arrays";
import type { Point2D } from "../../models/World";
import type Tile from "../../models/tiles/Tile";
import NullTile from "../../models/tiles/NullTile";
import { select } from "../../utils/random";

export default class TileGrid {
    private _tiles: Tile[][][];

    readonly width: number;
    readonly height: number;

    private _roomContext: IRoomContext;
    private _worldCoordinates: Point2D;

    constructor(world: Point2D, width: number, height: number, roomContext: IRoomContext, tiles: Tile[]) {
        this._tiles = create(height, () => create(width, () => [...tiles]));
        this.width = width;
        this.height = height;
        this._roomContext = roomContext;
        this._worldCoordinates = world;
    }

    get worldCoordinates(): Point2D {
        return this._worldCoordinates;
    }

    get tiles(): Tile[][] {
        return this._tiles.map2D(tiles => select(tiles));
    }

    get allTiles(): Element2D<Tile>[] {
        return this._tiles.flat2D().map(element => ({ x: element.x, y: element.y, item: element.item[0] }));
    }

    get allSupersets(): Element2D<Tile[]>[] {
        return this._tiles.flat2D();
    }

    hasTileAt(x: number, y: number): boolean {
        return (x >= -1 && x <= this._tiles[0].length && y >= -1 && y <= this._tiles.length);
    }

    getTilesAt(x: number, y: number): Tile[] | null {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || this._tiles[y][x].length === 0) {
            const tile = this._roomContext.getRelativeTile(this._worldCoordinates, {x, y});

            return tile ? [tile] : null;
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

        if (this._tiles[y][x].length === 0) {
            this._tiles[y][x] = [new NullTile(this._roomContext, { world: this._worldCoordinates, room: { x, y } })];
        }
    }

    modifyTiles(modifier: (x: number, y: number, tiles: Tile[]) => Tile[]) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this._tiles[y][x] = modifier(x, y, this._tiles[y][x]);
                if (this._tiles[y][x].length === 0) {
                    this._tiles[y][x] = [new NullTile(this._roomContext, { world: this._worldCoordinates, room: { x, y } })];
                }
            }
        }
    }

    clone(): TileGrid {
        const tileGrid = new TileGrid(this._worldCoordinates, this.width, this.height, this._roomContext, []);
        tileGrid._tiles = this._tiles.map(row => row.map(tiles => [...tiles]));
        return tileGrid;
    }
}

