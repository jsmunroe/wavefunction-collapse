import type IRoomContext from "../contracts/IRoomContext";
import { TileGridBuilder } from "./builders/TileGridBuilder";
import Room from "./Room";

export type Point2D = {
    x: number;
    y: number;
}

export default class World implements IRoomContext {
    private _rooms: Map<Point2D, Room> = new Map<Point2D, Room>();
    private _tileGridBuilder: TileGridBuilder;

    constructor() {
        this._tileGridBuilder = new TileGridBuilder(10, 10, this);
        this.createRoom(0, 0);
    }

    getRoom({ x, y }: Point2D): Room {
        const point: Point2D = { x, y };
        let room = this._rooms.get(point);
        if (!room) {
            room = this.createRoom(x, y);
        }
        return room;
    }

    hasRoom({ x, y }: Point2D): boolean {
        const point: Point2D = { x, y };
        return this._rooms.has(point);
    }

    private createRoom(x: number, y: number): Room {
        const tileGrid = this._tileGridBuilder.randomize();
        const room = new Room(tileGrid.tiles);
        this._rooms.set({ x, y }, room);
        
        return room;
    }
}