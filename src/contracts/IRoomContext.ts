import type { Coordinates } from "../models/Coordinates";
import type Room from "../models/Room";
import type Tile from "../models/tiles/Tile";
import type { Point2D } from "../models/World";
import type { RandomSource } from "../utils/random";

export default interface IGameContext {
    get random(): RandomSource;

    getRoom(worldCoordinates: Point2D): Room;
    hasRoom(worldCoordinates: Point2D): boolean;

    getExistingTile(coordinates: Coordinates): Tile | null
    getRelativeTile(world: Point2D, room: Point2D): Tile | null;
}