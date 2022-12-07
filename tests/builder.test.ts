import fc from "fast-check";
import { fc_listOfUniquePoints, fc_point } from "./arbitraries";

import { buildOctree } from "../src/builder";
import { octree_format, traverse } from "octree-utils";


test('all points exist in octree', () => {
    fc.assert(
        fc.property(
            fc_listOfUniquePoints(),
            fc.context(),
            ({points, octantWidth}, ctx) => {

                const octree = buildOctree(points, octantWidth);

                const list = [];
                traverse(octree, p => list.push(p));

                ctx.log(octree_format(octree))
                ctx.log(list.map(p => octree_format(['leaf', p])).join(", "))

                expect(list.length).toBe(points.length);
                expect(new Set(list)).toEqual(new Set(points));
                expect(true).toBe(false)
                // expect(list).toEqual(points);
            }
        ),
        { seed: -4479887, path: "65:2:0:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:2:16:5:3:4:5:3:4:7:7:6:3:3:6:4:4:3:3:4:6:4:3:6:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:5:8:10:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:9:22:4:10:9:12:9:9:10:9:12:10:11:10:9:9:9:9:9:11:9:9:9:10:11:9:9:10:9:11:9:9:9:11:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:10:11:8", endOnFailure: true }
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
