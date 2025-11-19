import Tile from "../../models/Tile";
import { type Element2D } from "../../utils/arrays";
import { select } from "../../utils/random";
import { Direction, reverse } from "../../models/Openings";
import TileGrid from "./TileGrid";
import type IRoomContext from "../../contracts/IRoomContext";
import type { Point2D } from "../../models/World";

export type Neighbor2D<TItem> = Element2D<TItem> & { direction: Direction };

export class TileGridBuilder {
    width: number;
    height: number;
    private _roomContext: IRoomContext;

    constructor(width: number, height: number, roomContext: IRoomContext) {
        this.width = width;
        this.height = height;
        this._roomContext = roomContext;
    }

    randomize(world: Point2D): TileGrid {
        const tilesGrid = new TileGrid(world, this.width, this.height, this._roomContext);

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

    removeIsolatedSections(tileGrid: TileGrid): void {
        let currentSection = 0;

        let allTiles = tileGrid.allTiles;

        const tileStack: Element2D<Tile>[] = [];
        
        const sections: Element2D<Tile>[][] = [[]];

        while (allTiles.length > 0) {
            const element = allTiles.shift();

            if (element === undefined || element.item.section >= 0) {
                continue;
            }

            tileStack.push(element);

            while (tileStack.length > 0) {
                const current = tileStack.pop();

                if (!current) {
                    continue;
                }

                const { item: tile, x, y } = current;

                tile.section = currentSection;
                sections[currentSection].push(current);
                
                const openNeighbors = this.getOpenNeighbors(tileGrid, { x, y }).filter(n => n.item.section < 0);

                tileStack.push(...openNeighbors);
            }

            allTiles = allTiles.filter(tile => tile.item.section < 0);
            currentSection++;
            sections.push([]);
        }

        for (const section of sections) {
            for (const element of section) {
                const { x, y, item: tile } = element;

                const closedNeighbors = this.getClosedNeighbors(tileGrid, { x, y });

                for (const neighbor of closedNeighbors) {
                    const { x: nx, y: ny, item: neighborTile, direction } = neighbor;

                    if (tile.section === neighborTile.section) {
                        continue;
                    }

                    tile.openings |= direction;
                    neighborTile.openings |= reverse(direction);

                    sections[neighborTile.section].forEach(e => e.item.section = tile.section);
                }
            }
        }
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

        for (const element of tileGrid.allSupersets.filter(e => e.item.length > 1)){
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

    private getOpenNeighbors(tileGrid: TileGrid, coord: Point2D): Neighbor2D<Tile>[] {
        const { x, y }  = coord;

        if (x < 0 || x >= tileGrid.width || y < 0 || y >= tileGrid.height) {
            return [];
        }

        const tiles: Neighbor2D<Tile>[] = [];
        const tile = tileGrid.getTilesAt(coord.x, coord.y)[0];
        const openings = tile.openings;

        if (openings === 0) {
            return [];
        }

        if ((openings & Direction.North) > 0 && y > 0) {
            const tile = tileGrid.getTilesAt(x, y - 1)[0];
            tiles.push({ x, y: y - 1, item: tile, direction: Direction.North });
        }

        if ((openings & Direction.East) > 0 && x < tileGrid.width - 1) {
            const tile = tileGrid.getTilesAt(x + 1, y)[0];
            tiles.push({ x: x + 1, y, item: tile, direction: Direction.East });
        }

        if ((openings & Direction.South) > 0 && y < tileGrid.height - 1) {
            const tile = tileGrid.getTilesAt(x, y + 1)[0];
            tiles.push({ x, y: y + 1, item: tile, direction: Direction.South });
        }

        if ((openings & Direction.West) > 0 && x > 0) {
            const tile = tileGrid.getTilesAt(x - 1, y)[0];
            tiles.push({ x: x - 1, y, item: tile, direction: Direction.West });
        }

        return tiles;
    }

    private getClosedNeighbors(tileGrid: TileGrid, coord: Point2D): Neighbor2D<Tile>[] {
        const { x, y }  = coord;

        if (x < 0 || x >= tileGrid.width || y < 0 || y >= tileGrid.height) {
            return [];
        }

        const tiles: Neighbor2D<Tile>[] = [];
        const tile = tileGrid.getTilesAt(coord.x, coord.y)[0];
        const openings = tile.openings;

        if (openings === (Direction.North | Direction.East | Direction.South | Direction.West)) {
            return [];
        }

        if ((openings & Direction.North) === 0 && y > 0) {
            const tile = tileGrid.getTilesAt(x, y - 1)[0];
            tiles.push({ x, y: y - 1, item: tile, direction: Direction.North });
        }

        if ((openings & Direction.East) === 0 && x < tileGrid.width - 1) {
            const tile = tileGrid.getTilesAt(x + 1, y)[0];
            tiles.push({ x: x + 1, y, item: tile, direction: Direction.East });
        }

        if ((openings & Direction.South) === 0 && y < tileGrid.height - 1) {
            const tile = tileGrid.getTilesAt(x, y + 1)[0];
            tiles.push({ x, y: y + 1, item: tile, direction: Direction.South });
        }

        if ((openings & Direction.West) === 0 && x > 0) {
            const tile = tileGrid.getTilesAt(x - 1, y)[0];
            tiles.push({ x: x - 1, y, item: tile, direction: Direction.West });
        }

        return tiles;
    }
}