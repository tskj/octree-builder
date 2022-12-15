import fc from 'fast-check';
import { readFileSync } from 'node:fs';

import { point_parse, point_serialize } from 'vector-utils';
import { Point } from 'types';
import { maxBoundingBox } from './utils';
import { parse } from "binary-format-parser";

export const fc_point = (): fc.Arbitrary<Point> =>
    fc.tuple(
        fc.double({min: -1000, max: 1000, noNaN: true}),
        fc.double({min: -1000, max: 1000, noNaN: true}),
        fc.double({min: -1000, max: 1000, noNaN: true}))
    .map(([x, y, z]) => ({x, y, z}))

/**
 * arbitrary for a list of unique points, which the octree requires
 * it also gives a minimum size for the octant width, based on the biggest
 * point and potentially some padding (for convenience)
 */
export const fc_listOfUniquePoints = () =>
        fc.tuple(
            fc.array(fc_point()).map(array =>
                [...new Set(array.map(point_serialize))].map(point_parse)
            ),
            fc.double({min: 0, max: 100, noNaN: true})
        ).map(([points, padding]) => {
            const max = maxBoundingBox(points);
            return {
                points,
                octantWidth: max + padding
            }
        })

export const fc_vector = (length: number) =>
        fc.array(fc.double({noNaN: true, min: 1e-1, max: 1e3}), {minLength: length, maxLength: length});

export const fc_matrix = (width: number, height: number) =>
        fc.array(fc_vector(width), {minLength: height, maxLength: height});

// hack to make contexts work in examples
const context = () => fc.sample(fc.context(), {numRuns:1})[0]

let points: Point[] | null;
if (process.argv[2] === "-use-real-data") {
    const pointsFile = readFileSync("./data/pointcloud.bin");
    points = parse(pointsFile.buffer).slice(0, 1e5);
}

export const fc_examples = {
    context,

    // this fails because of floating point rounding issues if the
    // asserts are on when building the octree
    twoPointsFailure: {"points":[{"x":-5e-324,"y":8749.999999999982,"z":-5e-324},{"x":-5e-324,"y":7656.249999999984,"z":-5e-324}],"octantWidth":8749.999999999982},

    realData: points,
}
