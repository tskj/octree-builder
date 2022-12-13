import { buildOctree } from "builder";
import { readFile } from "node:fs/promises"
import { getAll, treeSize } from "octree-utils";
import { parse } from "binary-format-parser";
import { mat_m_mat, mat_m_v } from "vector-utils";

const file = await readFile("./data/pointcloud.bin");
const meta = readFile("./data/metadata.json", {encoding: 'utf8'});

const points = parse(file.buffer);

const metadata = await meta.then(x => JSON.parse(x));
let tiltMatrix = [
    [metadata.tiltMatrix[0], metadata.tiltMatrix[1], metadata.tiltMatrix[2], metadata.tiltMatrix[3]],
    [metadata.tiltMatrix[4], metadata.tiltMatrix[5], metadata.tiltMatrix[6], metadata.tiltMatrix[7]],
    [metadata.tiltMatrix[8], metadata.tiltMatrix[9], metadata.tiltMatrix[10], metadata.tiltMatrix[11]],
    [metadata.tiltMatrix[12], metadata.tiltMatrix[13], metadata.tiltMatrix[14], metadata.tiltMatrix[15]],
];

tiltMatrix = mat_m_mat([
        [1, 0, 0, 0],
        [0, 0, 1, 0],
        [0, -1, 0, 0],
        [0, 0, 0, 1],
    ],
    mat_m_mat(tiltMatrix, [
        [1, 0, 0, 0],
        [0, 0, -1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 1],
    ]))

for (const i in points) {
    const p = points[i];
    const [x, y, z] = mat_m_v(tiltMatrix, [p.x, p.y, p.z, 1]);
    points[i] = { x, y, z };
}

const octree = buildOctree(points, 500);

const list = getAll(octree);

console.log("numbers in tree:", list.length);
console.log("numbers in list:", points.length);

const eqSet = (xs, ys) =>
    xs.size === ys.size &&
    [...xs].every((x) => ys.has(x));

console.log("sets equal?", eqSet(new Set(list), new Set(points)));

console.log("point", points[123]);
// console.log("octree point", lookupNearest(points[123], octree, 500));

console.log("size", treeSize(octree));
