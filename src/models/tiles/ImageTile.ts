import { Direction, type Openings } from "../Openings";
import Tile from "./Tile";

export default class ImageTile extends Tile {
    private _image: CanvasImageSource;

    readonly name: string;
    readonly walls: string;

    readonly north: number[];
    readonly east: number[];
    readonly south: number[];
    readonly west: number[];

    readonly northEast: boolean;
    readonly southEast: boolean
    readonly southWest: boolean;
    readonly northWest: boolean;
    
    constructor(name: string, walls: string, image: CanvasImageSource, 
        north: number[], east: number[], south: number[], west: number[], 
        northEast: boolean, southEast: boolean, northWest: boolean, southWest: boolean,
        openings: Openings) {
        super(name, openings);

        this._image = image;
        
        this.name = name;
        this.walls = walls;

        this.north = north;
        this.east = east;
        this.south = south;
        this.west = west;

        this.northEast = northEast;
        this.southEast = southEast;
        this.southWest = southWest;
        this.northWest = northWest;
    }
    
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = "dimgray";
        ctx.lineWidth = 1;

        ctx.clearRect(0, 0, 64, 64);
        //ctx.strokeRect(0, 0, 64, 64);
        ctx.drawImage(this._image, 0, 0, 64, 64);
    }

    wall(direction: Direction): number[] {
        switch (direction) {    
            case Direction.North:
                return this.north;
            case Direction.East:
                return this.east;
            case Direction.South:
                return this.south;
            case Direction.West:
                return this.west;
            case Direction.NorthEast:
                return this.northEast ? [1] : [];
            case Direction.SouthEast:
                return this.southEast ? [1] : [];
            case Direction.SouthWest:
                return this.southWest ? [1] : [];
            case Direction.NorthWest:
                return this.northWest ? [1] : [];
            default: 
                return [];
        }
    }
}