import { equal, type Element2D } from "../../utils/arrays";
import { Direction, getDirectionFromCoords, reverse } from "../../models/Openings";
import TileGrid from "./TileGrid";
import type IGameContext from "../../contracts/IRoomContext";
import type { Point2D } from "../../models/World";
import type Tile from "../../models/tiles/Tile";
import type World from "../../models/World";

export type Neighbor2D<TItem> = Element2D<TItem> & { direction: Direction };

export class TileGridBuilder {
    width: number;
    height: number;

    readonly world: World;
    readonly tiles: Tile[]; 

    constructor(width: number, height: number, world: World, tiles: Tile[]) {
        this.width = width;
        this.height = height;
        this.world = world;
        this.tiles = tiles;
    }

    randomize(world: Point2D): TileGrid {
        const tilesGrid = new TileGrid(world, this.width, this.height, this.world, [...this.tiles]);
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

        const startX = Math.floor(this.world.random.next() * this.width);
        const startY = Math.floor(this.world.random.next() * this.height);

        this.propagateConstraints(tilesGrid, startX, startY);

        return tilesGrid;

        //*/
    }

    removeOrphanCorners(tileGrid: TileGrid) {
        const hasCorner = (tile: Tile, corner: string) => {
            const rexCorner = new RegExp(`^\\w+_\\d+[abcd]*(?<corner>${corner})`);
            return rexCorner.test(tile.name);
        }

        const removeCorner = (tile: Tile, corner: string) => {
            const rexName = /^(?<rest>\w+_\d+)(?<corners>[abcd]*)$/;

            const match = tile.name.match(rexName);
            if (!match?.groups) {
                return tile;
            }

            const { rest, corners } = match.groups;

            const newCorners = corners.replace(corner, '');
            const newName = `${rest}${newCorners}`;

            const newTile = this.tiles.find(t => t.name === newName) ?? tile;

            return newTile;
        }

        for (let y = 0; y < this.height - 1; y++) {
        for (let x = 0; x < this.width - 1; x++) {
            const hasA = hasCorner(tileGrid.tiles[y+1][x], 'a');
            const hasB = hasCorner(tileGrid.tiles[y][x], 'b');
            const hasC = hasCorner(tileGrid.tiles[y][x+1], 'c');
            const hasD = hasCorner(tileGrid.tiles[y+1][x+1], 'd');

            if (hasA && hasB && hasC && hasD) {
                tileGrid.modifyTilesAt(x, y+1, tiles => [removeCorner(tiles[0], 'a')]);
                tileGrid.modifyTilesAt(x, y, tiles => [removeCorner(tiles[0], 'b')]);
                tileGrid.modifyTilesAt(x+1, y, tiles => [removeCorner(tiles[0], 'c')]);
                tileGrid.modifyTilesAt(x+1, y+1, tiles => [removeCorner(tiles[0], 'd')]);
            }            
        }}
    }

    private applyConstraintsToNeighbors(tileGrid: TileGrid, x: number, y: number) {
        if (tileGrid.hasTileAt(x, y) === false) {
            return;
        }

        const tiles = tileGrid.getTilesAt(x, y);

        if (!tiles) {
            return;
        }

        const tile = this.world.random.select(tiles);

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
