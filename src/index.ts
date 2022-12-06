import { buildOctree } from "builder";
import { readFile } from "node:fs/promises"
import { Octree, Point } from "types";
import { assert, distSq, isFiniteNumber, recordMap } from "utils";

const file = await Bun.file("./data/pointcloud.bin").arrayBuffer()

const fileLength = file.byteLength;
const view = new DataView(file, 0, fileLength);

const points: Point[] = [];

let numberOfPointsRead = 0;
for (let i = 0; i < fileLength; i += 16) {
    const h_angle = view.getFloat32(i, true);
    const v_angle = view.getFloat32(i + 4, true);
    const distance = view.getFloat32(i + 8, true);

    // commented out since it's not needed:
    // (but it's there if you want it)
    // const intensity = view.getFloat32(i + 12, true);

    numberOfPointsRead++;

    // a lot of data is garbage, and points inside the
    // scanner makes no sense anyway
    if (distance === 0) {
        continue;
    }

    assert("h_angle is regular float", isFiniteNumber(h_angle))
    assert("v_angle is regular float", isFiniteNumber(v_angle))
    assert("distance is regular float", isFiniteNumber(distance))
    // not really sure why the scanner gives double angles for both axes, but it does
    assert("h_angle makes sense", -2 * Math.PI <= h_angle && h_angle <= 2 * Math.PI);
    assert("v_angle makes sense", 0 <= v_angle && v_angle <= 2 * Math.PI);

    const x = -distance * Math.sin(v_angle) * Math.sin(h_angle);
    const y = -distance * Math.cos(v_angle);
    const z = -distance * Math.sin(v_angle) * Math.cos(h_angle);

    const point = {
        x, y, z
    };


    const dist2 = distSq(point);
    assert("calculated point is not at origin", dist2 > 0.10 ** 2)
    assert("calculated point is not too far away", dist2 < 1000 ** 2)

    points.push(point)
}

assert("entire file is read", numberOfPointsRead === fileLength / 16)

const octree = buildOctree(points, 500)

const list = []
const traverse = (tree: Octree) => {
    const [x, y] = tree;
    if (x === 'empty') return;
    if (x === 'leaf') {
        list.push(y);
        return;
    }
    if (x === 'node') {
        recordMap(y, (_, octree) => traverse(octree))
        return;
    }
}

traverse(octree);
console.log("numbers in tree:", list.length)
console.log("numbers in list:", points.length)

const eqSet = (xs, ys) =>
    xs.size === ys.size &&
    [...xs].every((x) => ys.has(x));

console.log("sets equal?", eqSet(new Set(list), new Set(points)))
