import type Room from "../models/Room";
import type { Point2D } from "../models/World";

export default interface IRoomContext {
    getRoom(worldCoordinates: Point2D): Room;
    hasRoom(worldCoordinates: Point2D): boolean;
}