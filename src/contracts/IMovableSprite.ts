import type { Coordinates } from "../models/Coordinates";
import type { Direction } from "../models/Openings";
import type ISprite from "./ISprite";

export default interface IMovableSprite extends ISprite {
    readonly isMoving: boolean;
    moveTo(direction: Direction, coordinates: Coordinates): Promise<void>;
}