import { OctantDirections, Point } from "types";
import { m_dimensions } from "vector-utils";

/**
 * checks if the lists contain the same elements regardless of ordering - i.e. they
 * are permutations of each other (or the same)
 */
export const expectToBePermutation = <T extends string | number>(xs: T[], ys: T[]) => {
    expect(xs.length).toBe(ys.length);

    const xs_set = new Set(xs);
    const ys_set = new Set(xs);
    if (xs.length === xs_set.size && ys.length === ys_set.size) {
        // no duplicates, we can do this for performance instead
        expect(xs_set).toEqual(ys_set);
        return;
    }

    const xsCount = xs.reduce((acc, e) => ({...acc, [e]: (acc[e] ?? 0) + 1}), {} as any);
    const ysCount = ys.reduce((acc, e) => ({...acc, [e]: (acc[e] ?? 0) + 1}), {} as any);

    expect(xsCount).toEqual(ysCount);
};

/**
 * checks that the points in the specified octants are ordered
 * along the relevant axis (in the sense that the lowest x-coordinate
 * in the octants in positive x direction is higher than the highest
 * x-coordinate in the negative direction)
 */
export const expectOrderingOfPoints =
    (octants: Record<OctantDirections, Point[]>,
        projection: (p: Point) => number,
        fourOctants: {bigger: OctantDirections[], smaller: OctantDirections[]},
    ) => {
    const bigger = fourOctants.bigger.flatMap(direction => octants[direction]).map(projection);
    const smaller = fourOctants.smaller.flatMap(direction => octants[direction]).map(projection);

    expect(Math.max(...smaller)).toBeLessThan(Math.min(...bigger));
}

/**
 * returns the coordinate furthest away from the origin
 * along any axis (in absolute value), which is useful
 * for defining octant widths that encapsulate all the
 * points
 */
export const maxBoundingBox = (points: Point[]) =>
    Math.max(...points.map(({x,y,z}) =>
                Math.max(
                    Math.abs(x), Math.abs(y), Math.abs(z))))

/**
 * checks numerical equalness to a precision of 1e-5
 */
export const expectEqualMatrices = (m1: number[][], m2: number[][]) => {
    const dim1 = m_dimensions(m1);
    const dim2 = m_dimensions(m2);

    expect(dim1).toEqual(dim2);

    for (const row_index in m1) {
        const row = m1[row_index];
        for (const col_index in row) {
            const a = row[col_index];
            const b = m2[row_index][col_index];

            expect(Math.abs(a-b)).toBeLessThanOrEqual(1e-5);
        }
    }
}
