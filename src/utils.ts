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

export const recordMap = <S extends string, A, B>(o: Record<S, A>, f: (k: S, a: A) => B): Record<S, B> =>
  Object.fromEntries(Object.entries(o).map(([k, v]: any) => [k, f(k, v)])) as any;
