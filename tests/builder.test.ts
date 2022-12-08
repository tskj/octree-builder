import fc from "fast-check";
import { fc_examples, fc_listOfUniquePoints, } from "./arbitraries";

import { buildOctree } from "../src/builder";
import { octree_format, traverse } from "octree-utils";
import { point_serialize } from "point-utils";
import { expectToBePermutation } from "./utils";


test('retrieved points match input points', () => {
    fc.assert(
        fc.property(
            fc_listOfUniquePoints(),
            fc.context(),
            ({points, octantWidth}, ctx) => {

                const octree = buildOctree(points, octantWidth);

                const list = [];
                traverse(octree, p => list.push(p));

                expectToBePermutation(points.map(point_serialize), list.map(point_serialize))
            }
        ),
        { examples: [[fc_examples.twoPointsFailure, fc_examples.context()]] }
    )
})

test('all points exist in octree', () => {
    fc.assert(
        fc.property(
            fc_listOfUniquePoints(),
            fc.context(),
            ({points, octantWidth}, ctx) => {

                const octree = buildOctree(points, octantWidth);

                
            }
        ),
        { examples: [[fc_examples.twoPointsFailure, fc_examples.context()]] }
    )
})

// ideas for properties:
// - maximum depth is equal to number of points
// - there should be no octants which are only empty
// - all the leaves in an octant should be ordered among themselves
// - somehow all points should be ordered within the tree
// - lowest value in an right octant should be bigger than highest value in a left octant
// - points exist in octree requires us to actually look up a point I think
//   retrieving all the points is a different test!

// need a function to calculate depth
// maybe a function to extract all values

// points need to be unique I now realize!
