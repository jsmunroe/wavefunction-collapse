import type IRoomContext from "../contracts/IRoomContext";
import { TileGridBuilder } from "../services/builders/TileGridBuilder";
import Blob from "./entities/Blob";
import type { Game } from "./Game";
import Room from "./Room";

export type Point2D = {
    x: number;
    y: number;
}

export default class World implements IRoomContext {
    private _game: Game;
    private _rooms: Map<string, Room> = new Map<string, Room>();
    private _tileGridBuilder: TileGridBuilder;

    constructor(game: Game) {
        this._game = game;
        this._tileGridBuilder = new TileGridBuilder(10, 10, this);
    }

    getRoom({ x, y }: Point2D): Room {
        const point: Point2D = { x, y };
        let room = this._rooms.get(JSON.stringify(point));
        if (!room) {
            room = this.createRoom(x, y);
        }
        return room;
    }

    hasRoom({ x, y }: Point2D): boolean {
        const point: Point2D = { x, y };
        return this._rooms.has(JSON.stringify(point));
    }

    private createRoom(x: number, y: number): Room {
        const tileGrid = this._tileGridBuilder.randomize({ x, y });
        const room = new Room(tileGrid.tiles);
        this._rooms.set(JSON.stringify({ x, y }), room);
        
        for (let i = 0; i < 5; i++) {
            const roomX = Math.floor(Math.random() * room.width);
            const roomY = Math.floor(Math.random() * room.height);
            room.addSprite(new Blob(this._game, { world: { x, y }, room: { x: roomX, y: roomY } }));
        }

        return room;
    }
}