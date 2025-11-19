import type IRoomContext from "../contracts/IRoomContext";
import { TileGridBuilder } from "../services/builders/TileGridBuilder";
import { randomCoordinate, select } from "../utils/random";
import Blob from "./entities/Blob";
import type Entity from "./entities/Entity";
import Flicker from "./entities/Flicker";
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
        this._tileGridBuilder.removeIsolatedSections(tileGrid);
        
        const room = new Room({x, y}, tileGrid.tiles);
        this._rooms.set(JSON.stringify({ x, y }), room);
        
        for (const entity of this.createEntities({ x, y })) {
            room.addSprite(entity);
        }

        return room;
    }

    private createEntities(worldCoordinates: Point2D): Entity[] {
        const room = this.getRoom(worldCoordinates);
        const { x, y } = worldCoordinates;

        const entities: Entity[] = [];

        const entityCount = Math.ceil(Math.random() * room.level);

        const coordInit = randomCoordinate(0, room.width - 1, 0, room.height - 1);

        const entityInits = [
            () => new Blob(this._game, { world: { x, y }, room: coordInit() }),
            () => new Flicker(this._game, { world: { x, y }, room: coordInit() }),
        ];

        for (let i = 0; i < entityCount; i++) {
            const entity = select(entityInits)();
        
            entities.push(entity);
        }

        return entities;
    }
}