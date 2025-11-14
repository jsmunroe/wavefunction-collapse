import type { Coordinates } from "../models/Coordinates";

export default interface ISprite {
    readonly coordinates: Coordinates;

    draw(ctx: CanvasRenderingContext2D): void;
}