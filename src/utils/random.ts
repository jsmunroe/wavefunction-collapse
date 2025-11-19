import type { Point2D } from "../models/World";
import { range } from "./arrays";

export function select<TItem>(array: TItem[]): TItem {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

export function shuffle<TItem>(array: TItem[]): TItem[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}


export function randomCoordinate(minX: number, maxX: number, minY: number, maxY: number): () => Point2D {
    const rangeX = range(minX, maxX + 1);

    const coordinates = shuffle(rangeX.flatMap(x => range(minY, maxY + 1).map(y => ({ x, y }))));
    let coordinateStack = [...coordinates];

    return () => {
        if (coordinateStack.length === 0) {
            coordinateStack = [...coordinates];
        }        

        return coordinateStack.pop()!;
    }
}