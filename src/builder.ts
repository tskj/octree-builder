import { Point, Octree, OctantDirections, octantDirections } from "types";
import { recordMap } from "utils";
import { origin } from "point-utils";
import { octantDirectionOfPoint, octantDirectionToPoint } from "octree-utils";

/**
 * shuffles all points into their respective octants recursively, where octantSize is the
 * width of each octant (the entire cube is 2 * octantSize wide in all directions)
 * 
 * if any point is outside the cube, the function throws - make sure to call it with large
 * enough octantSize for the dataset, and with a octantCenter set accordingly!
 *
 * precondition: all points need to be unique! duplicate points lead to stack overflow
 */
export const buildOctree = (points: Point[], octantSize: number, octantCenter: Point = origin): Octree => {
    /**
     * new Octants with a list of points each, meant to be mutated
     */
    const newOctants = (): Record<OctantDirections, Point[]> => 
        octantDirections
            .map(dir => ({[dir]: []}))
            .reduce((acc, x) => ({...acc, ...x}), {}) as any
            ;

    if (points.length === 0) return ['empty']
    if (points.length === 1) return ['leaf', points[0]]

    const octantsWithPoints = newOctants();

    for (const point of points) {
        const direction = octantDirectionOfPoint(point, octantSize, octantCenter);
        octantsWithPoints[direction].push(point);
    }

    const octants = recordMap(octantsWithPoints, (direction, points) =>
        buildOctree(points, octantSize / 2, octantDirectionToPoint(direction, octantSize, octantCenter)))

    return ['node', octants]
};

/**
 * looks up the point in the octree in the same octant as the `point`
 * 
 * this could technically be not the nearest point in space, because
 * it could actually lie in a different octant
 * 
 * returns undefined if that octant is empty
 */
export const lookupNearest = (point: Point, tree: Octree, octantSize: number, octantCenter: Point = origin) => {
    switch (tree[0]) {
        case 'empty': {
            return undefined;
        }
        case 'leaf': {
            return tree[1];
        }
        case 'node': {
            const octant = octantDirectionOfPoint(point, octantSize, octantCenter);
            const newSize = octantSize / 2;
            const newCenter = octantDirectionToPoint(octant, octantSize, octantCenter)
            return lookupNearest(point, tree[1][octant], newSize, newCenter);
        }
    }
}