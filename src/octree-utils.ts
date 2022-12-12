import { OctantDirections, octantDirections, Octree, Point } from "types";
import { assert, recordMap } from "utils";
import { add, point_format } from "vector-utils";

export const traverse = (tree: Octree, 
    leaf: (ps: Point[], path: OctantDirections[]) => void,
    nodeStart: (path: OctantDirections[]) => void = () => {},
    nodeDone: (path: OctantDirections[]) => void = () => {},
    path: OctantDirections[] = []
) => {
    switch (tree[0]) {
        case 'leaf': {
            const points = tree[1];
            leaf(points, path);
            return;
        }
        case 'node': {
            const octants = tree[1];
            nodeStart(path);
            recordMap(octants, (direction, octree) =>
                traverse(octree, leaf, nodeStart, nodeDone, [...path, direction]));
            nodeDone(path);
            return;
        }
    }
}

export const octree_format = (octree: Octree) => {
    let nodeStack = [];
    let currentOctants = [];
    let result = null;
    traverse(octree, ps => {
        const formatted = "[" + ps.map(point_format).join(", ") + "]";
        currentOctants.push(formatted);
    }, () => {
        if (currentOctants.length > 0) {
            nodeStack.push(currentOctants);
        }
        currentOctants = [];
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
    const eps = 1e-10;
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

/**
 * new Octants with a list of points each, meant to be mutated
 */
export const newOctants = (): Record<OctantDirections, Point[]> =>
    Object.fromEntries(
        octantDirections.map(dir => [dir, []])) as any;

export const treeSize = (tree: Octree) => {
    let internalNodes = 0;
    let leafNodes = 0;

    let currentDepth = 0;
    let depth = 0;

    const visitNode = () => {
        internalNodes++;
        currentDepth++;
    }

    const visitLeaf = () => {
        leafNodes++;
        currentDepth++;
        depth = Math.max(depth, currentDepth);
        currentDepth--;
    }

    const visitNodeDone = () => {
        depth = Math.max(depth, currentDepth);
        currentDepth--;
    }

    traverse(tree, visitLeaf, visitNode, visitNodeDone);

    assert("depth is zero after traversal", currentDepth === 0);

    return {
        internalNodes,
        leafNodes,
        depth,
    };
}

export const getAll = (octree: Octree): Point[] => {
    let points = [];
    traverse(octree, ps => {
        points = points.concat(ps);
    });
    return points;
}
