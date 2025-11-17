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