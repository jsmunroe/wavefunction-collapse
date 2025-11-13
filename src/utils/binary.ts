export function rotateByteLeft(value: number, bitCount: number): number {
    return ((value << bitCount) | (value >> (8 - bitCount))) & 0xFF;
}

export function rotateNibbleLeft(value: number, bitCount: number): number {
    return ((value << bitCount) | (value >> (4 - bitCount))) & 0x0F;
}