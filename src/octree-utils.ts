import { octantDirections, Octants, Octree, Point } from "types";
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

export function traverseOctree(octree: Octree, leafCallback: (point: Point) => void, nodeCallback: (node: Octants) => void, emptyCallback: () => void) {
    if (octree[0] === 'node') {
    nodeCallback(octree[1]);
    for (const octant in octree[1]) {
    traverseOctree(octree[1][octant], leafCallback, nodeCallback, emptyCallback);
    }
    } else if (octree[0] === 'leaf') {
    leafCallback(octree[1]);
    } else {
    emptyCallback();
    }
    }

export const lookupNearest = (tree: Octree, octantSize: number, octantCenter: Point = origin) => {
    
}

export const octree_format__ = (octree: Octree) => {
    let nodeStack = [];
    let currentNode = null;

    traverse(octree, point => {
        const formattedPoint = point_format(point);

        if (currentNode === null) {
            currentNode = (function*() {
                return formattedPoint;
            })();
        } else {
            currentNode.next(formattedPoint);
        }
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
        } else {
            currentNode.next(formatted);
        }
    }, () => {
        const value = currentNode.next().value;

        if (nodeStack.length > 0) {
            currentNode = nodeStack.pop();
        } else {
            currentNode = (function* () {
                const x = yield;
                yield;
                return x;
            })();
            currentNode.next();
        }

        currentNode.next(value);
    });

    return currentNode.next().value;
}

export const octree_format_ = (octree: Octree) => {
    // Initialize an empty stack to store octree nodes
    const nodeStack = [];

    // Initialize the current node to null
    let currentNode = null;

    // Traverse the octree
    traverse(octree, point => {
        // Format the point
        const formattedPoint = point_format(point);

        // If the current node is null, initialize it with the formatted point
        if (currentNode === null) {
            currentNode = {
                value: formattedPoint,
                children: null
            };
        } else {
            // Otherwise, add the formatted point as a child of the current node
            if (currentNode.children === null) {
                currentNode.children = [formattedPoint];
            } else {
                currentNode.children.push(formattedPoint);
            }
        }
    }, () => {
        // If the current node is not null, push it to the stack
        if (currentNode !== null) {
            nodeStack.push(currentNode);
        }

        // Create a new node with no children
        currentNode = {
            value: null,
            children: []
        };
    }, () => {
        // Format the node
        const formatted = '()';

        // If the current node is null, initialize it with the formatted node
        if (currentNode === null) {
            currentNode = {
                value: formatted,
                children: null
            };
        } else {
            // Otherwise, add the formatted node as a child of the current node
            if (currentNode.children === null) {
                currentNode.children = [formatted];
            } else {
                currentNode.children.push(formatted);
            }
        }
    }, () => {
        // Get the value of the current node
        const value = currentNode.value;

        // If the stack is not empty, pop the top node from the stack
        if (nodeStack.length > 0) {
            currentNode = nodeStack.pop();
        } else {
            // Otherwise, create a new node with no children
            currentNode = {
                value: null,
                children: null
            };
        }

        // Add the value of the current node as a child of the new node
        if (currentNode.children === null) {
            currentNode.children = [value];
        } else {
            currentNode.children.push(value);
        }
    });

    // Return the value of the current node
    return currentNode.value;
}

export const octree_format____ = (octree: Octree) => {
    // Initialize an empty stack to store octree nodes
    const nodeStack = [];

    // Initialize the current node to null
    let currentNode = null;

    // Traverse the octree
    traverse(octree, point => {
        // Format the point
        const formattedPoint = point_format(point);

        // If the current node is null, initialize it with the formatted point
        if (currentNode === null) {
            currentNode = {
                value: formattedPoint,
                children: null
            };
        } else {
            // Otherwise, add the formatted point as a child of the current node
            if (currentNode.children === null) {
                currentNode.children = [formattedPoint];
            } else {
                currentNode.children.push(formattedPoint);
            }
        }
    }, () => {
        // If the current node is not null, push it to the stack
        if (currentNode !== null) {
            nodeStack.push(currentNode);
        }

        // Create a new node with no value
        currentNode = {
            value: null,
            children: []
        };
    }, () => {
        // Format the node
        const formatted = '()';

        // If the current node is null, initialize it with the formatted node
        if (currentNode === null) {
            currentNode = {
                value: formatted,
                children: null
            };
        } else {
            // Otherwise, add the formatted node as a child of the current node
            if (currentNode.children === null) {
                currentNode.children = [formatted];
            } else {
                currentNode.children.push(formatted);
            }
        }
    }, () => {
        // Get the value of the current node
        const value = currentNode.value;

        // If the stack is not empty, pop the top node from the stack
        if (nodeStack.length > 0) {
            currentNode = nodeStack.pop();
        } else {
            // Otherwise, create a new node with no children
            currentNode = {
                value: null,
                children: null
            };
        }

        // Add the value of the current node as a child of the new node
        if (currentNode.children === null) {
            currentNode.children = [value];
        } else {
            currentNode.children.push(value);
        }
    });

    // Format the node's children
    let nodeString = "Node{ ";
    if (currentNode.children !== null) {
        for (let i = 0; i < currentNode.children.length; i++) {
            nodeString += `${octantDirections[i]}: ${currentNode.children[i]}, `;
        }
    }
    nodeString += " }";

    // Return the formatted node
    return nodeString;
}

export const octree_format_____ = (octree: Octree) => {
    // Helper function to format a node
    const formatNode = (node: {value: any, children: any[]}) => {
        // Format the node's children
        let nodeString = "Node{ ";
        if (node.children !== null) {
            for (let i = 0; i < node.children.length; i++) {
                if (node.children[i].children === null) {
                    // Leaf node
                    nodeString += `${octantDirections[i]}: ${node.children[i].value}, `;
                } else {
                    // Internal node
                    nodeString += `${octantDirections[i]}: ${formatNode(node.children[i])}, `;
                }
            }
        }
        nodeString += " }";

        // Return the formatted node
        return nodeString;
    }

    // Initialize an empty stack to store octree nodes
    const nodeStack = [];

    // Initialize the current node to null
    let currentNode = null;

    // Traverse the octree
    traverse(octree, point => {
        // Format the point
        const formattedPoint = point_format(point);

        // If the current node is null, initialize it with the formatted point
        if (currentNode === null) {
            currentNode = {
                value: formattedPoint,
                children: null
            };
        } else {
            // Otherwise, add the formatted point as a child of the current node
            if (currentNode.children === null) {
                currentNode.children = [formattedPoint];
            } else {
                currentNode.children.push(formattedPoint);
            }
        }
    }, () => {
        // If the current node is not null, push it to the stack
        if (currentNode !== null) {
            nodeStack.push(currentNode);
        }

        // Create a new node with no value
        currentNode = {
            value: null,
            children: []
        };
    }, () => {
        // Format the node
        const formatted = '()';

        // If the current node is null, initialize it with the formatted node
        if (currentNode === null) {
            currentNode = {
                value: formatted,
                children: null
            };
        } else {
            // Otherwise, add the formatted node as a child of the current node
            if (currentNode.children === null) {
                currentNode.children = [formatted];
            } else {
                currentNode.children.push(formatted);
            }
        }
    }, () => {
        // Get the value of the current node
        const value = currentNode.value;

        // If the stack is not empty, pop the top node from the stack
        if (nodeStack.length > 0) {
            currentNode = nodeStack.pop();
        } else {
            // Otherwise, create a new node with no children
            currentNode = {
                value: null,
                children: null
            };
        }

        // Add the value of the current node as a child of the new node
        if (currentNode.children === null) {
            currentNode.children = [value];
        } else {
            currentNode.children.push(value);
        }
    });
    
    // Format the root node of the octree
    const formattedOctree = formatNode(currentNode);
    
    // Return the formatted octree
    return formattedOctree;
}

export const octree_format = (octree: Octree) => {
    // Helper function to format a node
    const formatNode = (node: {value: any, children: any[]}) => {
        // Format the node's children
        let nodeString = "Node{ ";
        if (node.children !== null) {
            for (let i = 0; i < node.children.length; i++) {
                if (node.children[i].children === null) {
                    // Leaf node
                    nodeString += `${octantDirections[i]}: ${node.children[i].value}, `;
                } else {
                    // Internal node
                    nodeString += `${octantDirections[i]}: ${formatNode(node.children[i])}, `;
                }
            }
        }
        nodeString += " }";

        // Return the formatted node
        return nodeString;
    }

    // Initialize an empty stack to store octree nodes
    const nodeStack = [];

    // Initialize the current node to null
    let currentNode = null;

    // Traverse the octree
    traverse(octree, point => {
        // Format the point
        const formattedPoint = point_format(point);

        // If the current node is null, initialize it with the formatted point
        if (currentNode === null) {
            currentNode = {
                value: formattedPoint,
                children: null
            };
        } else {
            // Otherwise, add the formatted point as a child of the current node
            if (currentNode.children === null) {
                currentNode.children = [formattedPoint];
            } else {
                currentNode.children.push(formattedPoint);
            }
        }
    }, () => {
        // If the current node is not null, push it to the stack
        if (currentNode !== null) {
            nodeStack.push(currentNode);
        }

        // Create a new node with no value
        currentNode = {
            value: null,
            children: []
        };
    }, () => {
        // Format the node
        const formatted = '()';

        // If the current node is null, initialize it with the formatted node
        if (currentNode === null) {
            currentNode = {
                value: formatted,
                children: null
            };
        } else {
            // Otherwise, add the formatted node as a child of the current node
            if (currentNode.children === null) {
                currentNode.children = [formatted];
            } else {
                currentNode.children.push(formatted);
            }
        }
    }, () => {
        // Get the value of the current node
        const value = currentNode.value;

        // If the stack is not empty, pop the top node from the stack
        if (nodeStack.length > 0) {
            currentNode = nodeStack.pop();
        } else {
            // Otherwise, create a new node with no children
            currentNode = {
                value: null,
                children: null
            };
        }

        // Add the value of the current node as a child of the new node
        if (currentNode.children === null) {
            currentNode.children = [value];
        } else {
            currentNode.children.push(value);
        }
    });

    // Format the root node of the octree
    const formattedOctree = formatNode(currentNode);

    // Return the formatted octree
    return formattedOctree;
}

