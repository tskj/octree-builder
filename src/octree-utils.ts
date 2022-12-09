import { OctantDirections, octantDirections, Octants, Octree, Point } from "types";
import { assert, recordMap } from "utils";
import { add, point_format } from "point-utils";

export const traverse = (tree: Octree, 
    leaf: (p: Point) => void, 
    nodeStart: () => void = () => {}, 
    empty: () => void = () => {},
    nodeDone: () => void = () => {},
    ) => {

    switch (tree[0]) {
        case 'empty': {
            empty();
            return;
        }
        case 'leaf': {
            const point = tree[1];
            leaf(point);
            return;
        }
        case 'node': {
            const octants = tree[1];
            nodeStart();
            recordMap(octants, (_, octree) => traverse(octree, leaf, nodeStart, empty, nodeDone));
            nodeDone();
            return;
        }
    }
}

export const octree_format = (octree: Octree) => {
    let nodeStack = [];
    let currentOctants = [];
    let result = null;
    traverse(octree, p => {
        const formatted = point_format(p);
        currentOctants.push(formatted);
    }, () => {
        if (currentOctants.length > 0) {
            nodeStack.push(currentOctants);
        }
        currentOctants = [];
    }, () => {
        currentOctants.push('()');
    }, () => {
        if (nodeStack.length === 0) {
            result = `Node{ ${currentOctants.join(', ')} }`;
        } else {
            const parentNode = nodeStack.pop();
            parentNode.push(`Node{ ${currentOctants.join(', ')} }`);
            currentOctants = parentNode;
        }
    });

    return result;
}

/**
 * tells you in which direction the point lies relative to octantCenter, 
 * in other words which octant it needs to be placed in
 */
export const octantDirectionOfPoint = (point: Point, octantSize: number, octantCenter: Point): OctantDirections => {
    const eps = 1e-10
    assert("point is within octants along X axis", octantCenter.x - octantSize - eps <= point.x && point.x <= octantCenter.x + octantSize + eps);
    assert("point is within octants along Y axis", octantCenter.y - octantSize - eps <= point.y && point.y <= octantCenter.y + octantSize + eps);
    assert("point is within octants along Z axis", octantCenter.z - octantSize - eps <= point.z && point.z <= octantCenter.z + octantSize + eps);
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
export const octantDirectionToPoint = (dir: OctantDirections, octantSize: number, octantCenter: Point): Point => {
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