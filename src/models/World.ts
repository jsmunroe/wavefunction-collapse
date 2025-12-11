import type IRoomContext from "../contracts/IRoomContext";
import { TileGridBuilder } from "../services/builders/TileGridBuilder";
import { randomCoordinate, select } from "../utils/random";
import type { Coordinates } from "./Coordinates";
import Blob from "./entities/Blob";
import type Entity from "./entities/Entity";
import Flicker from "./entities/Flicker";
import type { Game } from "./Game";
import Room from "./Room";
import type Tile from "./tiles/Tile";

export type Point2D = {
    x: number;
    y: number;
}

export const roomWidth = 10;
export const roomHeight = 10;

export default class World implements IRoomContext {
    private _game: Game;
    private _rooms: Map<string, Room> = new Map<string, Room>();
    private _tileGridBuilder: TileGridBuilder | null = null;

    constructor(game: Game) {
        this._game = game;
    }

    get game(): Game {
        return this._game;
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

    getExistingTile(coordinates: Coordinates): Tile | null {
        const room = this._rooms.get(JSON.stringify(coordinates.world));

        if (!room) {
            return null;
        }

        return room.getTile(coordinates.room);
    }

    getRelativeTile(world: Point2D, room: Point2D): Tile | null {
        if (room.x < 0) {
            world = { ...world, x: world.x - 1 };
            room.x += roomWidth;
        }

        if (room.x >= roomWidth) {
            world = { ...world, x: world.x + 1 };
            room.x -= roomWidth;
        }

        if (room.y < 0) {
            world = { ...world, y: world.y - 1 };
            room.y += roomHeight;
        }

        if (room.y >= roomHeight) {
            world = { ...world, y: world.y + 1 };
            room.y -= roomHeight;
        }

        return this.getExistingTile({ world, room });
    }

    private createRoom(x: number, y: number): Room {
        
        if (!this._tileGridBuilder) {
            const tiles = this._game.library.getTiles();
            this._tileGridBuilder = new TileGridBuilder(roomWidth, roomHeight, this, tiles);
        }

        const tileGrid = this._tileGridBuilder.randomize({ x, y });
        //this._tileGridBuilder.removeIsolatedSections(tileGrid);
        
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