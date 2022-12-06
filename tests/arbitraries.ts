import fc from 'fast-check';

import { Point } from '../src/types'

export const fc_point = (): fc.Arbitrary<Point> =>
    fc.tuple(
        fc.double({min: -10000, max: 10000, noNaN: true}), 
        fc.double({min: -10000, max: 10000, noNaN: true}), 
        fc.double({min: -10000, max: 10000, noNaN: true}))
    .map(([x, y, z]) => ({x, y, z}))
