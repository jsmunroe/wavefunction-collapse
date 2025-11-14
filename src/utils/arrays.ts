export function create<TItem>(length: number, factory: (index: number) => TItem): TItem[] {
    const array: TItem[] = [];

    for (let i = 0; i < length; i++) {
        array.push(factory(i));
    }
 
    return array;
}

export type Element2D<TItem> = {
    x: number;
    y: number;
    item: TItem;
}

type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;

declare global {
    interface Array<T> {
        findNextIndex(predicate: (item: T) => boolean, fromIndex: number): number;
        flat2D(): Element2D<Flatten<T>>[];
        map2D<TResult>(callback: (item: Flatten<T>, x: number, y: number) => TResult): TResult[][];
    }
}

if (!Array.prototype.findNextIndex) {
    Array.prototype.findNextIndex = function <T>(this: T[], predicate: (item: T) => boolean, fromIndex: number): number  {
        const index = this.slice(fromIndex).findIndex(predicate);
        const adjustedIndex = index !== -1 ? index + fromIndex : -1;

        return adjustedIndex;
    };
}

if (!Array.prototype.flat2D) {
    Array.prototype.flat2D = function <T>(this: Flatten<T>[][]): Element2D<Flatten<T>>[] {
        const result: Element2D<Flatten<T>>[] = [];

        for (let y = 0; y < this.length; y++) {
            for (let x = 0; x < this[y].length; x++) {
                result.push({ x, y, item: this[y][x] });
            }
        }
        return result;
    };
}

if (!Array.prototype.map2D) {
    Array.prototype.map2D = function <T, TResult>(this: Flatten<T>[][], callback: (item: Flatten<T>, x: number, y: number) => TResult): TResult[][] {
        const result: TResult[][] = [];

        for (let y = 0; y < this.length; y++) {
            result[y] = [];
            for (let x = 0; x < this[y].length; x++) {
                result[y][x] = callback(this[y][x], x, y);
            }
        }
        
        return result;
    };
}