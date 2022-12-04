import {Point} from "types"

export const assert = (msg: string, condition: boolean) => {
    if (!condition) {
        throw Error("Assertion failed: " + msg);
    }
}

export const isFiniteNumber = (n: number) =>
    !isNaN(n) && isFinite(n);

export const distSq = ({x, y, z}: Point) => {
    return x ** 2 + y ** 2 + z ** 2;
}
