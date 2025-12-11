import type { Point2D } from "../models/World";
import { range } from "./arrays";

export type Rng = () => number;

export const Rng = {
    lcr: (seed: number | string, a = 1664525, c = 1013904233, m = Math.pow(2, 32)): Rng => {
        if (typeof seed === 'string') {
            seed = stringToNumber(seed);
        }

        let current = seed;
        return () => {
            current = (a * current + c) % m;
            const nextValue = current / m;
            return nextValue;
        }
    },
}

function stringToNumber(value: string): number {
    if (!value) {
        return 0;
    }
    
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + char; // Equivalent to hash * 31 + char
        hash = hash | 0; // Ensures the hash remains a 32-bit integer
    }
    return hash;
}

export const _TestTargets = {
    stringToNumber,
};

export class RandomSource {
    private _random: Rng;

    constructor(random: Rng = Math.random) {
        this._random = random;
    }

    next(): number {
        return this._random();
    }

    nextInt(min: number = Number.MAX_SAFE_INTEGER, max?: number): number {
        if (!max) {
            max = min;
            min = 0;
        }

        return Math.floor(this._random() * (max - min)) + min;
    }

    select<TItem>(array: TItem[]): TItem {
        const index = Math.floor(this._random() * array.length);
        return array[index];
    }

    shuffle<TItem>(array: TItem[]): TItem[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(this._random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    randomCoordinate(minX: number, maxX: number, minY: number, maxY: number): () => Point2D {
        const rangeX = range(minX, maxX + 1);

        const coordinates = this.shuffle(rangeX.flatMap(x => range(minY, maxY + 1).map(y => ({ x, y }))));
        let coordinateStack = [...coordinates];

        return () => {
            if (coordinateStack.length === 0) {
                coordinateStack = [...coordinates];
            }        

            return coordinateStack.pop()!;
        }
    }
}