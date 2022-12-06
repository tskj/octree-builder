import { Point, Octree, OctantDirections, octantDirections } from "types";
import { assert, recordMap } from "utils";
import { add } from "vectors";

/**
 * new Octants with a list of points each, meant to be mutated
 */
const newOctants = (): Record<OctantDirections, Point[]> => 
    octantDirections
        .map(dir => ({[dir]: []}))
        .reduce((acc, x) => ({...acc, ...x}), {}) as any
        ;

/**
 * tells you in which direction the point lies relative to octantCenter, 
 * in other words which octant it needs to be placed in
 */
const octantDirectionOfPoint = (point: Point, octantSize: number, octantCenter: Point): OctantDirections => {
    assert("point is within octants along X axis", octantCenter.x - octantSize <= point.x && point.x <= octantCenter.x + octantSize);
    assert("point is within octants along Y axis", octantCenter.y - octantSize <= point.y && point.y <= octantCenter.y + octantSize);
    assert("point is within octants along Z axis", octantCenter.z - octantSize <= point.z && point.z <= octantCenter.z + octantSize);
    if (point.x < octantCenter.x) {
        if (point.y < octantCenter.y) {
            if (point.z < octantCenter.z) {
                return 'negX_negY_negZ';
            } else {
                return 'negX_negY_posZ';
            }
        } else {
            if (point.z < octantCenter.z) {
                return 'negX_posY_negZ';
            } else {
                return 'negX_posY_posZ';
            }
        }
    } else {
        if (point.y < octantCenter.y) {
            if (point.z < octantCenter.z) {
                return 'posX_negY_negZ';
            } else {
                return 'posX_negY_posZ';
            }
        } else {
            if (point.z < octantCenter.z) {
                return 'posX_posY_negZ';
            } else {
                return 'posX_posY_posZ';
            }

        }
    }
};

/**
 * tells you the new center of the octant according to which direction we're considering
 * (half a step along that direction)
 */
const octantDirectionToPoint = (dir: OctantDirections, octantSize: number, octantCenter: Point): Point => {
    const step = octantSize / 2;
    switch (dir) {
        case 'negX_negY_negZ': return add(octantCenter, {x: -step, y: -step, z: -step});
        case 'negX_negY_posZ': return add(octantCenter, {x: -step, y: -step, z:  step});
        case 'negX_posY_negZ': return add(octantCenter, {x: -step, y:  step, z: -step});
        case 'negX_posY_posZ': return add(octantCenter, {x: -step, y:  step, z:  step});
        case 'posX_negY_negZ': return add(octantCenter, {x:  step, y: -step, z: -step});
        case 'posX_negY_posZ': return add(octantCenter, {x:  step, y: -step, z:  step});
        case 'posX_posY_negZ': return add(octantCenter, {x:  step, y:  step, z: -step});
        case 'posX_posY_posZ': return add(octantCenter, {x:  step, y:  step, z:  step});
    }
};

/**
 * shuffles all points into their respective octants recursively, where octantSize is the
 * width of each octant (the entire cube is 2 * octantSize wide in all directions)
 * 
 * if any point is outside the cube, the function throws - make sure to call it with large
 * enough octantSize for the dataset, and with a octantCenter set accordingly!
 */
export const buildOctree = (points: Point[], octantSize: number, octantCenter: Point = {x: 0, y: 0, z: 0}): Octree => {
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