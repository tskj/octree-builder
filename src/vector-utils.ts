import { Point } from "types";
import { assert } from "utils";

export const origin: Point = { x: 0, y: 0, z: 0 };

export const yAxis = { x: 0, y: 1, z: 0 };

export const scalar_m = (scalar: number, point: Point) => ({
    x: scalar * point.x,
    y: scalar * point.y,
    z: scalar * point.z,
});

export const add = (a: Point, b: Point): Point => ({
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
});

export const sub = (a: Point, b: Point): Point => ({
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
});

export const dot = (p1: Point, p2: Point): number => {
    return p1.x * p2.x + p1.y * p2.y + p1.z * p2.z;
}

export const lengthSq = ({x, y, z}: Point) => {
    return x ** 2 + y ** 2 + z ** 2;
}

export const length = ({ x, y, z }: Point): number => {
    return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
}

export const distSq = (p1: Point, p2: Point): number => {
    return lengthSq(sub(p1, p2));
}

export const normalize = (p: Point) => {
    const l = length(p);
    return {
        x: p.x / l,
        y: p.y / l,
        z: p.z / l,
    }
}

export const point_format = ({x, y, z}: Point) => `Point{${x}, ${y}, ${z}}`;

export const point_serialize = ({x, y, z}: Point) => `${x}:${y}:${z}`
export const point_parse = (point: string): Point => {
    const [x, y, z] = point.split(':').map(parseFloat)
    return {x, y, z}
}

/**
 * Matrix stuff =========================
 */

/**
 * multiplies a column vector by a matrix
 *
 * expects a row-major matrix `m` and a column vector `v`
 * these need to have dimensions for which matrix multiplication is defined
 */
export const mat_m_v = (m: number[][], v: number[]): number[] => {
    const vdot = (row: number[]) => {
        let result = 0;
        for (const i in row) {
            result += row[i] * v[i];
        }
        return result;
    }
    return m.map(vdot)
}

/**
 * returns the dimension of the matrix, throws if it's staggered
 */
export const m_dimensions = (m: number[][]) => {
    const height = m.length;
    let width = null;
    for (const row of m) {
        if (width) {
            assert("matrix is not staggered", width === row.length);
        }
        width = row.length;
    }
    return { height, width };
}

/**
 * multiples the two matrices together
 *
 * both input matrices and output matrix are row-major, dimensions need
 * to match so that matrix multiplication is defined (this is asserted on
 * by the implementation)
 */
export const mat_m_mat = (m1: number[][], m2: number[][]): number[][] => {

    const dim1 = m_dimensions(m1);
    const dim2 = m_dimensions(m2);

    assert("matrix multiplication is defined", dim1.width === dim2.height);

    const result = Array.from({length: dim1.height}).map(() => Array(dim2.width).fill(0));

    for (const row_index in result) {
        const row = result[row_index];
        for (const col_index in row) {
            for (let k = 0; k < dim1.width; k++) {
                row[col_index] += m1[row_index][k] * m2[k][col_index];
            }
        }
    }

    const dim3 = m_dimensions(result);

    assert("result dimensions are correct", dim1.height === dim3.height && dim2.width === dim3.width);

    return result;
}

/**
 * produces a square matrix of `dimensions` size, with ones along the diagonal
 * and zeroes elsewhere
 */
export const identity_matrix = (dimensions: number): number[][] => {
    const result = Array.from({length: dimensions}).map(() => Array(dimensions).fill(0));
    for (let k = 0; k < dimensions; k++) {
        result[k][k] = 1;
    }
    return result;
}

/**
 * right-handed rotation about the x-axis
 * of `a` radians
 */
export const rotX = (a: number) => {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return [
        [1,   0,    0],
        [0, cos, -sin],
        [0, sin,  cos],
    ];
}

/**
 * right-handed rotation about the y-axis
 * of `a` radians
 */
export const rotY = (a: number) => {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return [
        [cos,  0, sin],
        [0,    1,   0],
        [-sin, 0, cos],
    ];
}
