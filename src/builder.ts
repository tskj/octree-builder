import { Point, Octree, OctantDirections, } from "types";
import { recordMap } from "utils";
import { origin } from "vector-utils";
import { newOctants, octantDirectionOfPoint, octantDirectionToPoint } from "octree-utils";

/**
 * shuffles all points into their respective octants recursively, where octantSize is the
 * width of each octant (the entire cube is 2 * octantSize wide in all directions)
 * 
 * if any point is outside the cube, the function throws - make sure to call it with large
 * enough octantSize for the dataset, and with a octantCenter set accordingly!
 *
 * precondition: all points need to be unique! duplicate points lead to stack overflow
 */
export const buildOctree = (points: Point[], octantSize: number, octantCenter: Point = origin, leafSize = 1e5): Octree => {

    if (points.length <= leafSize) return ['leaf', points];

    const octantsWithPoints = newOctants();

    for (const point of points) {
        const direction = octantDirectionOfPoint(point, octantSize, octantCenter);
        octantsWithPoints[direction].push(point);
    }

    const octants = recordMap(octantsWithPoints, (direction, points) =>
        buildOctree(points, octantSize / 2, octantDirectionToPoint(direction, octantSize, octantCenter), leafSize))

    return ['node', octants]
};

/**
 * looks up the points in the octree in the same octant as the `point`
 * 
 * this could technically be not the nearest point in space, because
 * it could actually lie in a different octant
 */
export const lookupNearest = (point: Point, tree: Octree, octantSize: number, octantCenter: Point = origin, path: OctantDirections[] = []): [Point[], OctantDirections[]] => {
    switch (tree[0]) {
        case 'leaf': {
            return [tree[1], path];
        }
        case 'node': {
            const octant = octantDirectionOfPoint(point, octantSize, octantCenter);
            const newCenter = octantDirectionToPoint(octant, octantSize, octantCenter)
            const newSize = octantSize / 2;
            const newPath = [...path, octant];
            return lookupNearest(point, tree[1][octant], newSize, newCenter, newPath);
        }
    }
}