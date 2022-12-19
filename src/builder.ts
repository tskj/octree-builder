import { Point, Octree, } from "types";
import { recordMap } from "utils";
import { normalize, origin, scalar_m, sub } from "vector-utils";
import { isWithinOctant, newOctants, octantDirectionOfPoint, octantDirectionToPoint, pointBoundingBoxIntersectsOctant } from "octree-utils";
import { octantWidth, pointSize } from "params";

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

    if (points.length <= leafSize || !points.some(isWithinOctant(octantSize, octantCenter))) return ['leaf', points];

    const octantsWithPoints = newOctants();

    for (const point of points.filter(pointBoundingBoxIntersectsOctant(octantSize, octantCenter))) {
        const direction = octantDirectionOfPoint(point, octantSize, octantCenter);
        octantsWithPoints[direction].push(point);

        const dirs = new Set([direction]);

        if (
            isWithinOctant(octantSize, octantCenter)(point)
        ) {
            /**
             * the rest of this for loop is to account for the volume of points, so that the point is added to every
             * octant it intersects
             */

            const virtualPlanesAndAxis = [
                { ...point, x: octantCenter.x },
                { ...point, y: octantCenter.y },
                { ...point, z: octantCenter.z },
                { ...point, x: octantCenter.x, y: octantCenter.y },
                { ...point, x: octantCenter.x, z: octantCenter.z },
                { ...point, y: octantCenter.y, z: octantCenter.z },
                { x: octantCenter.x, y: octantCenter.y, z: octantCenter.z },
            ];
            const virtualPoints = virtualPlanesAndAxis.map(vp => scalar_m(pointSize, normalize(sub(vp, point))));
            for (const virtualPoint of virtualPoints) {
                const direction = octantDirectionOfPoint(virtualPoint, octantSize, octantCenter);
                if (!dirs.has(direction)) {
                    octantsWithPoints[direction].push(point);
                    dirs.add(direction);
                }
            }
        }
    }
    
    console.log("reeeeecursing with points divided", octantsWithPoints['negX_negY_negZ'].length, octantsWithPoints['negX_negY_posZ'].length, octantsWithPoints['posX_negY_negZ'].length)

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
export const lookupNearest = (point: Point, tree: Octree, octantSize: number, octantCenter: Point = origin): Point[] => {
    switch (tree[0]) {
        case 'leaf': {
            return tree[1];
        }
        case 'node': {
            const octant = octantDirectionOfPoint(point, octantSize, octantCenter);
            const newCenter = octantDirectionToPoint(octant, octantSize, octantCenter)
            const newSize = octantSize / 2;
            return lookupNearest(point, tree[1][octant], newSize, newCenter);
        }
    }
}