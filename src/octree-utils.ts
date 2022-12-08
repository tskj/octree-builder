import { Octants, Octree, Point } from "types";
import { recordMap } from "utils";
import { origin, point_format } from "point-utils";

export const traverse = (tree: Octree, 
    leaf: (p: Point) => void, 
    nodeStart: () => void = () => {}, 
    empty: () => void = () => {},
    nodeDone: () => void = () => {},
    ) => {

    switch(tree[0]) {
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

export const lookupNearest = (tree: Octree, octantSize: number, octantCenter: Point = origin) => {
    
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
