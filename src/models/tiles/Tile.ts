import { Boundary } from "../Boundary";
import type { Openings } from "../Openings";
import { Direction } from "../Openings";

export default abstract class Tile {
    readonly openings: Openings;
    readonly name: string;

    section: number = -1;

    constructor(name: string, openings: Openings) {
        this.name = name;
        this.openings = openings;
    }
  
    abstract draw(ctx: CanvasRenderingContext2D): void;

    boundary(direction: Direction): Boundary {
        return new Boundary(this.openings, direction);
    }

    wall(direction: Direction): number[] {
        throw new Error("Method not implemented.");
    }
}