import type { Coordinates } from "../models/Coordinates";
import type ISprite from "./ISprite";

export default interface IMovableSprite extends ISprite {
    moveTo(coordinates: Coordinates): Promise<void>;
}