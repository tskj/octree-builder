import fc from 'fast-check';
import { point_parse, point_serialize } from 'point-utils';

import { Point } from '../src/types'
import { maxBoundingBox } from './utils';

export const fc_point = (): fc.Arbitrary<Point> =>
    fc.tuple(
        fc.double({min: -10000, max: 10000, noNaN: true}), 
        fc.double({min: -10000, max: 10000, noNaN: true}), 
        fc.double({min: -10000, max: 10000, noNaN: true}))
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

export const fc_examples = {
    context: () => fc.sample(fc.context(), {numRuns:1})[0],
    twoPointsFailure: {"points":[{"x":-5e-324,"y":8749.999999999982,"z":-5e-324},{"x":-5e-324,"y":7656.249999999984,"z":-5e-324}],"octantWidth":8749.999999999982},
}