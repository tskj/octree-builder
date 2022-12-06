import fc from "fast-check";
import { fc_point } from "./arbitraries";

import { buildOctree } from "../src/builder";
import { octree_format, traverse } from "octree-utils";


test('all points exist in octree', () => {
    fc.assert(
        fc.property(
            fc.array(fc_point(), {maxLength: 2}),
            fc.double({min: 0, max: 100, noNaN: true}),
            fc.context(),
            (points, padding, ctx) => {
                const max = Math.max(...points.map(({x,y,z}) => 
                    Math.max(
                        Math.abs(x), Math.abs(y), Math.abs(z))))

                const octree = buildOctree(points, max + padding);

                const list = [];
                traverse(octree, p => list.push(p));

                ctx.log(octree_format(octree))
                ctx.log(list.map(p => octree_format(['leaf', p])).join(", "))

                expect(list.length).toBe(points.length);
                expect(new Set(list)).toEqual(new Set(points));
                // expect(list).toEqual(points);
            }
        ),
        { seed: -731411284, path: "2:2:2:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:2:3:3:3:1:1:2", endOnFailure: true }
    )
})

// ideas for properties:
// - maximum depth is equal to number of points
// - there should be no octants which are only empty
// - all the leaves in an octant should be ordered among themselves
// - somehow all points should be ordered within the tree
// - lowest value in an right octant should be bigger than highest value in a left octant

// need a function to calculate depth
// maybe a function to extract all values

// points need to be unique I now realize!
