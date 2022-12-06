import { Point, Octree, Octants, OctantDirections } from "types";

const newOctants = () => ({
    a: [],
    b: [],
    c: [],
});

const octantDirectionOf = (point: Point, origin: Point): OctantDirections => {
    if (point.x < origin.x) {
        if (point.y < origin.y) {
            if (point.z < origin.z) {
                return 'a';
            } else {
                return 'a';
            }
        } else {
            if (point.z < origin.z) {
                return 'a';
            } else {
                return 'a';
            }
        }
    } else {
        if (point.y < origin.y) {
            if (point.z < origin.z) {
                return 'a';
            } else {
                return 'a';
            }
        } else {
            if (point.z < origin.z) {
                return 'a';
            } else {
                return 'a';
            }

        }
    }
}

export const buildOctree = (points: Point[], octantCenter: Point = {x: 0, y: 0, z: 0}): Octree => {
    const octant = newOctants();

    for (const point of points) {
        const direction = octantDirectionOf(point, octantCenter);
        octant[direction].push(points);
    }

    for (const direction in octant) {
        octant[direction] = buildOctree(octant[direction] /*, needs updated center here! */);
    }

    return octant;
}