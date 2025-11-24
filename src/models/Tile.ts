import { Boundary } from "./Boundary";
import type { Openings } from "./Openings";
import { Direction, isOpen } from "./Openings";

export default class Tile {

    constructor(openings: Openings) {
        this.openings = openings;
    }

    section: number = -1;

    openings: Openings;


    boundary(direction: Direction): Boundary {
        return new Boundary(this.openings, direction);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, 64, 64);

        ctx.fillStyle = "#CCCCEE";

        ctx.fillRect(56, 0, 8, 8);
        ctx.fillRect(56, 56, 8, 8);
        ctx.fillRect(0, 56, 8, 8);
        ctx.fillRect(0, 0, 8, 8);

        if (!isOpen(this.openings, Direction.North)) {
            ctx.fillRect(8, 0, 48, 8);
        }
        if (!isOpen(this.openings, Direction.East)) {
            ctx.fillRect(56, 8, 8, 48);
        }
        if (!isOpen(this.openings, Direction.South)) {
            ctx.fillRect(8, 56, 48, 8);
        }
        if (!isOpen(this.openings, Direction.West)) {
            ctx.fillRect(0, 8, 8, 48);
        }
    }

    static get all(): Tile[] {
        return buildTrivialTiles();
    }
}

function buildTrivialTiles(): Tile[] {
    const tiles: Tile[] = [];

    for (let i = 0; i < 16; i++) {
        tiles.push(new Tile(i));
    }

    return tiles;
}