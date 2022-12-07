import { octantDirections, Octree, Point } from "types";
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
    let currentNode = null;
    traverse(octree, p => {
        const formatted = point_format(p);
        if (currentNode === null) {
            currentNode = (function*() {
                return formatted;
            })();
        }
        else currentNode.next(formatted)
    }, () => {
        if (currentNode !== null) {
            nodeStack.push(currentNode);
        }
        currentNode = (function*() {
            let s = [];
            for (const direction of octantDirections) {
                const n = yield;
                s.push(`${direction}: ${n}`);
            }
            yield;
            return "Node{ " + s.join(', ') + " }";
        })();
        currentNode.next();
    }, () => {
        const formatted = '()';
        if (currentNode === null) {
            currentNode = (function* () {
                return formatted;
            })();
        }
        else currentNode.next(formatted)
    }, () => {
        const v = currentNode.next().value;
        if (nodeStack.length > 0) currentNode = nodeStack.pop();
        else {
            currentNode = (function* () { const x = yield; yield; return x })()
            currentNode.next();
        }
        currentNode.next(v);
    });

    return currentNode.next().value;
}
