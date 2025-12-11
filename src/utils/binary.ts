export function rotateByteLeft(value: number, bitCount: number): number {
    return ((value << bitCount) | (value >> (8 - bitCount))) & 0xFF;
}

export function rotateNibbleLeft(value: number, bitCount: number): number {
    return ((value << bitCount) | (value >> (4 - bitCount))) & 0x0F;
}

export function reverseNibble(x: number): number {
    x &= 0x0F;
    x = ((x >> 1) & 0x05) | ((x & 0x05) << 1);
    x = ((x >> 2) & 0x03) | ((x & 0x03) << 2);
    return x >>> 0;
}
