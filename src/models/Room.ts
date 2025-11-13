import { create, type Element2D } from "../utils/arrays";
import { select } from "../utils/random";
import Tile, { Direction, reverse } from "./Tile";

const roomWidth = 10;
const roomHeight = 10;

export default class Room {
    private _tiles: TileGrid;

    constructor(tiles: TileGrid) {
        this._tiles = tiles;
    }

    get width(): number {
        return this._tiles[0].length;
    }

    get height(): number {
        return this._tiles.length;
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this._tiles[y][x][0];
                ctx.save();
                ctx.translate(x * 64, y * 64);
                tile.draw(ctx);
                ctx.restore();
            }
        }
    }
}

type TileGrid = Tile[][][];

export function buildRoom(): Room {
    const tiles: TileGrid = create(roomHeight, () => create(roomWidth, () => [...Tile.all]));

    const startX = Math.floor(Math.random() * roomWidth);
    const startY = Math.floor(Math.random() * roomHeight);
    
    propagateConstraints(tiles, startX, startY);

    return new Room(tiles);
}

function propagateConstraints(tileGrid: TileGrid, x: number, y: number) {
    if (x < 0 || x >= roomWidth || y < 0 || y >= roomHeight) {
        return;
    }
    
    const tiles = tileGrid[y][x];

    if (tiles.length === 1) {
        return;
    }

    const tile = select(tiles);

    if (y > 0) {
        tileGrid[y - 1][x] = filterTiles(tile, Direction.North, tileGrid[y - 1][x]);
    }

    if (x < roomWidth - 1) {
        tileGrid[y][x + 1] = filterTiles(tile, Direction.East, tileGrid[y][x + 1]);
    }

    if (y < roomHeight - 1) {
        tileGrid[y + 1][x] = filterTiles(tile, Direction.South, tileGrid[y + 1][x]);
    }

    if (x > 0) {
        tileGrid[y][x - 1] = filterTiles(tile, Direction.West, tileGrid[y][x - 1]);
    }

    tileGrid[y][x] = [tile];

    const next = findSmallestSuperset(tileGrid);
    if (next !== null) {
        propagateConstraints(tileGrid, next.x, next.y);
    }
}

function findSmallestSuperset(tileGrid: TileGrid): Element2D<Tile[]> | null {
    let tiles: Element2D<Tile[]> | null = null;

    for (const element of tileGrid.flat2D().filter(e => e.item.length > 1)){
        if (tiles === null || (element.item.length < tiles.item.length)) {
            tiles = element;
        }
    }

    return tiles;
}

function filterTiles(tile: Tile, direction: Direction, neighbors: Tile[]): Tile[] {
    neighbors =  neighbors.filter(neighbor => isCompatible(tile, direction, neighbor));

    if (neighbors.length === 0) {
        throw new Error("No compatible tiles found");
    }

    return neighbors;
}

function isCompatible(tileA: Tile, direction: Direction, tileB: Tile): boolean {
    const boundaryA = tileA.boundary(direction);
    const boundaryB = tileB.boundary(reverse(direction)).flip();

    return boundaryA.matches(boundaryB);
}
