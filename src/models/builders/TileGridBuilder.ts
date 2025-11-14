import Tile from "../Tile";
import { type Element2D } from "../../utils/arrays";
import { select } from "../../utils/random";
import { Direction, reverse } from "../Openings";
import TileGrid from "./TileGrid";

export class TileGridBuilder {
    width: number;
    height: number;
    private _roomContext: IRoomContext;

    constructor(width: number, height: number, roomContext: IRoomContext) {
        this.width = width;
        this.height = height;
        this._roomContext = roomContext;
    }

    randomize(): TileGrid {
        const tilesGrid = new TileGrid(this.width, this.height, this._roomContext);

        for (let y = 0; y < this.height; y++) {
            this.applyConstraintsToNeighbors(tilesGrid, -1, y);
            this.applyConstraintsToNeighbors(tilesGrid, this.width, y);
        }

        for (let x = 0; x < this.width; x++) {
            this.applyConstraintsToNeighbors(tilesGrid, x, -1);
            this.applyConstraintsToNeighbors(tilesGrid, x, this.height);
        }

        const startX = Math.floor(Math.random() * this.width);
        const startY = Math.floor(Math.random() * this.height);

        this.propagateConstraints(tilesGrid, startX, startY);

        return tilesGrid;
    }

    private applyConstraintsToNeighbors(tileGrid: TileGrid, x: number, y: number) {
        if (tileGrid.hasTileAt(x, y) === false) {
            return;
        }

        const tiles = tileGrid.getTilesAt(x, y);

        const tile = select(tiles);

        if (y > 0) {
            tileGrid.modifyTilesAt(x, y - 1, tiles => this.filterTiles([tile], Direction.North, tiles));
        }

        if (x < tileGrid.width - 1) {
            tileGrid.modifyTilesAt(x + 1, y, tiles => this.filterTiles([tile], Direction.East, tiles));
        }

        if (y < tileGrid.height - 1) {
            tileGrid.modifyTilesAt(x, y + 1, tiles => this.filterTiles([tile], Direction.South, tiles));
        }

        if (x > 0) {
            tileGrid.modifyTilesAt(x - 1, y, tiles => this.filterTiles([tile], Direction.West, tiles));
        }

        tileGrid.setTilesAt(x, y, [tile]);
    }

    private propagateConstraints(tileGrid: TileGrid, x: number, y: number) {
        if (x < 0 || x >= tileGrid.width || y < 0 || y >= tileGrid.height) {
            return;
        }
        
        this.applyConstraintsToNeighbors(tileGrid, x, y);

        const next = this.findSmallestSuperset(tileGrid);
        if (next !== null) {
            this.propagateConstraints(tileGrid, next.x, next.y);
        }
    }

    private findSmallestSuperset(tileGrid: TileGrid): Element2D<Tile[]> | null {
        let tiles: Element2D<Tile[]> | null = null;

        for (const element of tileGrid.allTiles.filter(e => e.item.length > 1)){
            if (tiles === null || (element.item.length < tiles.item.length)) {
                tiles = element;
            }
        }

        return tiles;
    }

    private filterTiles(tiles: Tile[], direction: Direction, neighbors: Tile[]): Tile[] {
        neighbors =  neighbors.filter(neighbor => tiles.some(tile => this.isCompatible(tile, direction, neighbor)));

        if (neighbors.length === 0) {
            throw new Error("No compatible tiles found");
        }

        return neighbors;
    }

    private isCompatible(tileA: Tile, direction: Direction, tileB: Tile): boolean {
        const boundaryA = tileA.boundary(direction);
        const boundaryB = tileB.boundary(reverse(direction)).flip();

        return boundaryA.matches(boundaryB);
    }
}