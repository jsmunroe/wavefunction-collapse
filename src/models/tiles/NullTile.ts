import type IGameContext from "../../contracts/IRoomContext";
import { north, east, south, west, type Coordinates } from "../Coordinates";
import { Direction } from "../Openings";
import type World from "../World";
import Tile from "./Tile";

export default class NullTile extends Tile {
    roomContext: IGameContext;
    coordinates?: Coordinates;

    constructor(roomContext: IGameContext, coordinates?: Coordinates) {
        super(0);

        this.roomContext = roomContext;
        this.coordinates = coordinates;
    }

    draw(ctx: CanvasRenderingContext2D): void { 
        if (!this.coordinates) {
            return;
        }

        ctx.clearRect(0, 0, 64, 64);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(64, 64);
        ctx.moveTo(64, 0);
        ctx.lineTo(0, 64);
        ctx.stroke();     
    }

    wall(direction: Direction): number[] {
        if (!this.coordinates) {
            return [];
        }

        switch (direction) {    
            case Direction.North:
                return this.roomContext.getExistingTile(north(this.coordinates))?.wall(Direction.South) ?? [];
            case Direction.East:
                return this.roomContext.getExistingTile(east(this.coordinates))?.wall(Direction.West) ?? [];
            case Direction.South:
                return this.roomContext.getExistingTile(south(this.coordinates))?.wall(Direction.North) ?? [];
            case Direction.West:
                return this.roomContext.getExistingTile(west(this.coordinates))?.wall(Direction.East) ?? [];
            default: 
                return [];
        }
    }
}