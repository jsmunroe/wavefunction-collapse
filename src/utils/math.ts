import type { Point2D } from "../models/World";

declare global {
    interface Math {
        mod(value: number, divisor: number): number;
    }
}

if (!Math.mod) {
    Math.mod = function (value: number, divisor: number): number {
        const result = value % divisor;
        return result >= 0 ? result : result + divisor;
    }
}

export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

export function lerpPoint2D(start: Point2D, end: Point2D, t: number): Point2D {
    return {
        x: lerp(start.x, end.x, t),
        y: lerp(start.y, end.y, t),
    };
}