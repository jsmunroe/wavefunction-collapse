import { equal, type Element2D } from "../../utils/arrays";
import { select } from "../../utils/random";
import { Direction, getDirectionFromCoords, reverse } from "../../models/Openings";
import TileGrid from "./TileGrid";
import type IRoomContext from "../../contracts/IRoomContext";
import type { Point2D } from "../../models/World";
import type Tile from "../../models/tiles/Tile";

export type Neighbor2D<TItem> = Element2D<TItem> & { direction: Direction };

export class TileGridBuilder {
    width: number;
    height: number;

    private _roomContext: IRoomContext;
    private _tiles: Tile[]; 

    constructor(width: number, height: number, roomContext: IRoomContext, tiles: Tile[]) {
        this.width = width;
        this.height = height;
        this._roomContext = roomContext;
        this._tiles = tiles;
    }

    randomize(world: Point2D): TileGrid {
        const tilesGrid = new TileGrid(world, this.width, this.height, this._roomContext, [...this._tiles]);
        /* * /

        tilesGrid.modifyTilesAt(1, 0, () => [tiles.find(t => (t as ImageTile).walls === "0111") ?? new NullTile(this._roomContext, { world, room: { x: 0, y: 0 } })]);
        tilesGrid.modifyTilesAt(2, 1, () => [tiles.find(t => (t as ImageTile).walls === "1001") ?? new NullTile(this._roomContext, { world, room: { x: 0, y: 0 } })]);
        tilesGrid.modifyTilesAt(1, 2, () => [tiles.find(t => (t as ImageTile).walls === "1101") ?? new NullTile(this._roomContext, { world, room: { x: 0, y: 0 } })]);
        tilesGrid.modifyTilesAt(0, 1, () => [tiles.find(t => (t as ImageTile).walls === "1111") ?? new NullTile(this._roomContext, { world, room: { x: 0, y: 0 } })]);
        tilesGrid.modifyTilesAt(1, 1, () => [tiles.find(t => (t as ImageTile).walls === "1111") ?? new NullTile(this._roomContext, { world, room: { x: 0, y: 0 } })]);

        const ignore = [{x: 1, y: 0}, {x: 2, y: 1}, {x: 1, y: 2}, {x: 0, y: 1}, {x: 1, y: 1}];

        tilesGrid.modifyTiles((xTile, yTile, tiles) => ignore.some(({x, y}) => x === xTile && y === yTile) ? tiles : [new NullTile(this._roomContext)]);

        //this.applyConstraintsToNeighbors(tilesGrid, 0, 1);

        return tilesGrid;
        /*/

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

        //*/
    }

    removeIsolatedSections(tileGrid: TileGrid): void {
        let currentSection = 0;

        let allTiles = tileGrid.allTiles;

        const tileStack: Element2D<Tile>[] = [];
        
        const sections: Element2D<Tile>[][] = [[]];

        while (allTiles.length > 0) {
            const element = allTiles.shift();

            if (!element?.item || element.item.section >= 0) {
                continue;
            }

            tileStack.push(element);

            while (tileStack.length > 0) {
                const current = tileStack.pop();

                if (!current) {
                    continue;
                }

                const { item: tile, x, y } = current;

                if (!tile) {
                    continue;
                }

                tile.section = currentSection;
                sections[currentSection].push(current);
                
                const openNeighbors = this.getOpenNeighbors(tileGrid, { x, y }).filter(n => n.item?.section < 0);

                tileStack.push(...openNeighbors);
            }

            allTiles = allTiles.filter(tile => tile.item?.section < 0);
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

                    if (this.openTileInDirection(tileGrid, {x, y}, direction)) {
                        sections[neighborTile.section].forEach(e => e.item.section = tile.section);
                    }
                }
            }
        }
    }

    private openTileInDirection(tileGrid: TileGrid, room: Point2D, direction: Direction) {

        const workingGrid = tileGrid.clone();

        let tiles = this._tiles.filter(tile => tile.openings & direction);

        if (direction !== Direction.North) {
            const neighbor = workingGrid.getTilesAt(room.x, room.y - 1);
            if (neighbor != null) {
                tiles = this.filterTiles(neighbor, Direction.South, tiles);
            }
        }

        if (direction != Direction.East) {
            const neighbor = workingGrid.getTilesAt(room.x + 1, room.y);
            if (neighbor != null) {
                tiles = this.filterTiles(neighbor, Direction.West, tiles);
            }
        }

        if (direction !== Direction.South) {
            const neighbor = workingGrid.getTilesAt(room.x, room.y + 1);
            if (neighbor != null) {
                tiles = this.filterTiles(neighbor, Direction.North, tiles);
            }
        }

        if (direction !== Direction.West) {
            const neighbor = workingGrid.getTilesAt(room.x - 1, room.y);
            if (neighbor != null) {
                tiles = this.filterTiles(neighbor, Direction.East, tiles);
            }
        }

        const thisTile = select(tiles);

        tiles = this._tiles.filter(tile => tile.openings & direction);

        let neighborCoords: Point2D | null = null;

        switch (direction) {
            case Direction.North:
                neighborCoords = { x: room.x, y: room.y - 1 };
                break;
            case Direction.East:
                neighborCoords = { x: room.x + 1, y: room.y };
                break;
            case Direction.South:
                neighborCoords = { x: room.x, y: room.y + 1 };
                break;
            default:
            case Direction.West:
                neighborCoords = { x: room.x - 1, y: room.y };
                break;
        }

        let neighbor = workingGrid.getTilesAt(neighborCoords.x, neighborCoords.y - 1);
        if (neighbor != null) {
            tiles = this.filterTiles(neighbor, Direction.South, tiles);
        }

        neighbor = workingGrid.getTilesAt(neighborCoords.x + 1, neighborCoords.y);
        if (neighbor != null) {
            tiles = this.filterTiles(neighbor, Direction.West, tiles);
        }

        neighbor = workingGrid.getTilesAt(neighborCoords.x, neighborCoords.y + 1);
        if (neighbor != null) {
            tiles = this.filterTiles(neighbor, Direction.North, tiles);
        }

        neighbor = workingGrid.getTilesAt(neighborCoords.x - 1, neighborCoords.y);
        if (neighbor != null) {
            tiles = this.filterTiles(neighbor, Direction.East, tiles);
        }
        
        const neighborTile = select(tiles);

        if (thisTile && neighborTile) {
            tileGrid.modifyTilesAt(neighborCoords.x, neighborCoords.y, () => [neighborTile]);
            tileGrid.modifyTilesAt(room.x, room.y, () => [thisTile]);

            return true;
        }

        return false;
    }

    private applyConstraintsToNeighbors(tileGrid: TileGrid, x: number, y: number) {
        if (tileGrid.hasTileAt(x, y) === false) {
            return;
        }

        const tiles = tileGrid.getTilesAt(x, y);

        if (!tiles) {
            return;
        }

        const tile = select(tiles);

        // North neighbors
        if (y > 0) {
            tileGrid.modifyTilesAt(x, y - 1, tiles => this.filterTiles([tile], Direction.North, tiles));
        }

        // East neighbors
        if (y > 0 && x < tileGrid.width - 1) {
            tileGrid.modifyTilesAt(x + 1, y - 1, tiles => this.filterTiles([tile], Direction.NorthEast, tiles));
        }

        // South neighbors
        if (x < tileGrid.width - 1) {
            tileGrid.modifyTilesAt(x + 1, y, tiles => this.filterTiles([tile], Direction.East, tiles));
        }

        // SouthEast neighbors
        if (x < tileGrid.width - 1 && y < tileGrid.height - 1) {
            tileGrid.modifyTilesAt(x + 1, y + 1, tiles => this.filterTiles([tile], Direction.SouthEast, tiles));
        }

        // SouthWest neighbors
        if (y < tileGrid.height - 1) {
            tileGrid.modifyTilesAt(x, y + 1, tiles => this.filterTiles([tile], Direction.South, tiles));
        }

        // West neighbors
        if (x > 0 && y < tileGrid.height - 1) {
            tileGrid.modifyTilesAt(x - 1, y + 1, tiles => this.filterTiles([tile], Direction.SouthWest, tiles));
        }

        // NorthWest neighbors
        if (x > 0) {
            tileGrid.modifyTilesAt(x - 1, y, tiles => this.filterTiles([tile], Direction.West, tiles));
        }

        if (x > 0 && y > 0) {
            tileGrid.modifyTilesAt(x - 1, y - 1, tiles => this.filterTiles([tile], Direction.NorthWest, tiles));
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
        const found =  neighbors.filter(neighbor => tiles.some(tile => this.isCompatible(tile, direction, neighbor)));

        return found;
    }

    private isCompatible(tileA: Tile, direction: Direction, tileB: Tile): boolean {
        const boundaryA = tileA?.wall(direction);
        const boundaryB = tileB?.wall(reverse(direction));

        return equal(boundaryA, boundaryB);
    }

    private getOpenNeighbors(tileGrid: TileGrid, coord: Point2D): Neighbor2D<Tile>[] {
        const { x, y }  = coord;

        if (x < 0 || x >= tileGrid.width || y < 0 || y >= tileGrid.height) {
            return [];
        }

        const tiles = tileGrid.tiles;

        const neighbors: Neighbor2D<Tile>[] = [];
        const tile = tiles[coord.x][coord.y];
        const openings = tile?.openings;

        if (!openings || openings === 0) {
            return [];
        }

        if ((openings & Direction.North) > 0 && y > 0) {
            const tile = tiles[x][y - 1];
            neighbors.push({ x, y: y - 1, item: tile, direction: Direction.North });
        }

        if ((openings & Direction.East) > 0 && x < tileGrid.width - 1) {
            const tile = tiles[x + 1][y];
            neighbors.push({ x: x + 1, y, item: tile, direction: Direction.East });
        }

        if ((openings & Direction.South) > 0 && y < tileGrid.height - 1) {
            const tile = tiles[x][y + 1];
            neighbors.push({ x, y: y + 1, item: tile, direction: Direction.South });
        }

        if ((openings & Direction.West) > 0 && x > 0) {
            const tile = tiles[x - 1][y];
            neighbors.push({ x: x - 1, y, item: tile, direction: Direction.West });
        }

        return neighbors;
    }

    private getClosedNeighbors(tileGrid: TileGrid, coord: Point2D): Neighbor2D<Tile>[] {
        const { x, y }  = coord;

        if (x < 0 || x >= tileGrid.width || y < 0 || y >= tileGrid.height) {
            return [];
        }

        const tiles = tileGrid.tiles;

        const neighbors: Neighbor2D<Tile>[] = [];
        const tile = tiles[coord.x][coord.y];
        if (!tile) {
            return [];
        }

        const openings = tile.openings;

        if (openings === (Direction.North | Direction.East | Direction.South | Direction.West)) {
            return [];
        }

        if ((openings & Direction.North) === 0 && y > 0) {
            const tile = tiles[x][y - 1];
            neighbors.push({ x, y: y - 1, item: tile, direction: Direction.North });
        }

        if ((openings & Direction.East) === 0 && x < tileGrid.width - 1) {
            const tile = tiles[x + 1][y];
            neighbors.push({ x: x + 1, y, item: tile, direction: Direction.East });
        }

        if ((openings & Direction.South) === 0 && y < tileGrid.height - 1) {
            const tile = tiles[x][y + 1];
            neighbors.push({ x, y: y + 1, item: tile, direction: Direction.South });
        }

        if ((openings & Direction.West) === 0 && x > 0) {
            const tile = tiles[x - 1][y];
            neighbors.push({ x: x - 1, y, item: tile, direction: Direction.West });
        }

        return neighbors.filter(t => t.item != null);
    }
}
