import fc from 'fast-check';
import { point_parse, point_serialize } from 'point-utils';

import { Point } from '../src/types'

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
            const max = Math.max(...points.map(({x,y,z}) =>
                Math.max(
                    Math.abs(x), Math.abs(y), Math.abs(z))))
            return {
                points,
                octantWidth: max + padding
            }
        })
