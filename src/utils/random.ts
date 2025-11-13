export function select<TItem>(array: TItem[]): TItem {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}