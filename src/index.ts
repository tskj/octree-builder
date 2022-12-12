import { buildOctree, lookupNearest } from "builder";
import { readFile } from "node:fs/promises"
import { getAll, traverse, treeSize } from "octree-utils";
import { parse } from "binary-format-parser";

const file = await readFile("./data/pointcloud.bin");
const points = parse(file.buffer);
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
