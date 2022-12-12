import fc from "fast-check";
import { fc_examples, fc_listOfUniquePoints, } from "./arbitraries";

import { buildOctree, lookupNearest } from "../src/builder";
import { newOctants, traverse, treeSize } from "octree-utils";
import { origin, point_serialize } from "vector-utils";
import { expectOrderingOfPoints, expectToBePermutation } from "./utils";
import { OctantDirections, Point } from "types";

test('retrieved points match input points', () => {
    fc.assert(
        fc.property(
            fc_listOfUniquePoints(),
            fc.context(),
            ({points, octantWidth}, ctx) => {

                const octree = buildOctree(points, octantWidth);

                const list = [];
                traverse(octree, ps => list.push(...ps));

                expectToBePermutation(points.map(point_serialize), list.map(point_serialize))
            }
        ),
        { examples: [
            [fc_examples.twoPointsFailure, fc_examples.context()],
            ...fc_examples.realData,
        ] }
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
                    const nearestPoints = lookupNearest(point, octree, octantWidth);
                    expect(nearestPoints).toContainEqual(point);
                }
            }
        ),
        { examples: [
            [fc_examples.twoPointsFailure, fc_examples.context()],
            ...fc_examples.realData,
        ] }
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

                const visitLeaf = (ps: Point[]) => {
                    if (ps.length === 0) {
                        emptyInaRow++;
                    } else {
                        emptyInaRow = 0;
                    }
                }

                const visitNodeDone = () => {
                    expect(emptyInaRow).not.toBe(8);

                    emptyInaRow = 0;
                }

                traverse(octree, visitLeaf, visitNode, visitNodeDone);
            }
        ),
        { examples: [
            [fc_examples.twoPointsFailure, fc_examples.context()],
            ...fc_examples.realData,
        ] }
    )
})

test('points are ordered in space correctly', () => {
    fc.assert(
        fc.property(
            fc_listOfUniquePoints(),
            fc.integer({min: 1, max: 10}),
            fc.context(),
            ({points, octantWidth}, leafSize, ctx) => {

                const octree = buildOctree(points, octantWidth, origin, leafSize);

                if (octree[0] === 'leaf') return;

                const stack = [];
                let octants: Record<OctantDirections, Point[]> | null = null;

                const visitNode = () => {
                    stack.push(octants);
                    octants = newOctants();
                }

                const visitLeaf = (ps: Point[], path: OctantDirections[]) => {
                    // has to exist because of precondition
                    const lastStepInPath = path[path.length-1];
                    octants[lastStepInPath].push(...ps);
                }

                const visitNodeDone = (path: OctantDirections[]) => {
                    expectOrderingOfPoints(octants, p => p.x,
                        { smaller: [
                            'negX_negY_negZ',
                            'negX_negY_posZ',
                            'negX_posY_negZ',
                            'negX_posY_posZ',
                        ], bigger: [
                            'posX_negY_negZ',
                            'posX_negY_posZ',
                            'posX_posY_negZ',
                            'posX_posY_posZ',
                        ]})
                    expectOrderingOfPoints(octants, p => p.y,
                        { smaller: [
                            'negX_negY_negZ',
                            'negX_negY_posZ',
                            'posX_negY_negZ',
                            'posX_negY_posZ',
                        ], bigger: [
                            'negX_posY_negZ',
                            'negX_posY_posZ',
                            'posX_posY_negZ',
                            'posX_posY_posZ',
                        ]})
                    expectOrderingOfPoints(octants, p => p.z,
                        { smaller: [
                            'negX_negY_negZ',
                            'negX_posY_negZ',
                            'posX_negY_negZ',
                            'posX_posY_negZ',
                        ], bigger: [
                            'negX_negY_posZ',
                            'negX_posY_posZ',
                            'posX_negY_posZ',
                            'posX_posY_posZ',
                        ]})

                    // push these points up the call stack so that we can check
                    // all points recursively within every octant
                    const newPoints = Object.values(octants).flatMap(p => p);

                    octants = stack.pop();

                    if (path.length > 0) {
                        const lastStepInPath = path[path.length-1];
                        octants[lastStepInPath].push(...newPoints);
                    }
                }

                traverse(octree, visitLeaf, visitNode, visitNodeDone);

                expect(stack).toEqual([]);
                expect(octants).toBe(null);
            }
        ),
        { examples: [
            [fc_examples.twoPointsFailure, 1, fc_examples.context()],
            // ...fc_examples.realData,
        ] }
    )
})

test('depth of tree', () => {
    fc.assert(
        fc.property(
            fc_listOfUniquePoints(),
            fc.context(),
            ({points, octantWidth}, ctx) => {

                const octree = buildOctree(points, octantWidth);
                const {internalNodes, leafNodes, depth} = treeSize(octree);

                const maxNumberOfNodes = (Math.pow(8, depth) - 1) / 7;
                expect(internalNodes + leafNodes).toBeLessThanOrEqual(maxNumberOfNodes);

                expect(leafNodes).toBe(internalNodes * 7 + 1);

            }
        ),
        { examples: [
            [fc_examples.twoPointsFailure, fc_examples.context()],
            ...fc_examples.realData,
        ] }
    )
})
