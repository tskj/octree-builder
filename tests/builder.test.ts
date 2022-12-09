import fc from "fast-check";
import { fc_examples, fc_listOfUniquePoints, } from "./arbitraries";

import { buildOctree, lookupNearest } from "../src/builder";
import { newOctants, traverse } from "octree-utils";
import { point_serialize } from "point-utils";
import { expectToBePermutation } from "./utils";
import { OctantDirections, Point } from "types";


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

                for (const point of points) {
                    const nearestPoint = lookupNearest(point, octree, octantWidth);
                    expect(nearestPoint).toEqual(point);
                }
            }
        ),
        { examples: [[fc_examples.twoPointsFailure, fc_examples.context()]] }
    )
})

test('all 8 octants should not be empty', () => {
    fc.assert(
        fc.property(
            fc_listOfUniquePoints(),
            fc.context(),
            ({points, octantWidth}, ctx) => {

                const octree = buildOctree(points, octantWidth);

                let emptyInaRow = 0;

                const visitNode = () => {
                    emptyInaRow = 0;
                }

                const visitLeaf = () => {
                    emptyInaRow = 0;
                }

                const visitEmpty = () => {
                    emptyInaRow += 1;
                }

                const visitNodeDone = () => {
                    expect(emptyInaRow).not.toBe(8);

                    emptyInaRow = 0;
                }

                traverse(octree, visitLeaf, visitNode, visitEmpty, visitNodeDone);
            }
        ),
        { examples: [[fc_examples.twoPointsFailure, fc_examples.context()]] }
    )
})

test('leaves are ordered in space among themselves', () => {
    fc.assert(
        fc.property(
            fc_listOfUniquePoints(),
            fc.context(),
            ({points, octantWidth}, ctx) => {

                const octree = buildOctree(points, octantWidth);

                fc.pre(octree[0] !== 'empty')
                fc.pre(octree[0] !== 'leaf')

                const stack = [];
                let octants: Record<OctantDirections, Point[]> | null = null;

                const visitNode = () => {
                    stack.push(octants);
                    octants = newOctants();
                }

                const visitLeaf = (p: Point, path: OctantDirections[]) => {
                    // has to exist because of precondition
                    const lastStepInPath = path[path.length-1];
                    octants[lastStepInPath].push(p);
                }

                const visitEmpty = () => {
                }

                const visitNodeDone = () => {
                    expect(
                        Object.values(octants).every(list => list.length === 1 || list.length === 0)
                    ).toBe(true);

                    octants = stack.pop();
                }

                traverse(octree, visitLeaf, visitNode, visitEmpty, visitNodeDone);

                expect(stack).toEqual([]);
                expect(octants).toBe(null);
            }
        ),
        { examples: [[fc_examples.twoPointsFailure, fc_examples.context()]] }
    )
})

// ideas for properties:
// - maximum depth is equal to number of points
// - all the leaves in an octant should be ordered among themselves
// - somehow all points should be ordered within the tree
// - lowest value in an right octant should be bigger than highest value in a left octant

// need a function to calculate depth
