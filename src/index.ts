import { buildOctree } from "builder";
import { readFile, writeFile } from "node:fs/promises"
import { getAll, treeSize } from "octree-utils";
import { getTiltMatrix, parse } from "binary-format-parser";
import { mat_m_v, origin, } from "vector-utils";
import { depthmapFile, horizontal_resolution, leafSize, metadataFile, octantWidth, pointcloudFile, vertical_resolution } from "params";
import { raycast } from "raycast";
import { createBitmapImage } from "bitmap";

console.time("file read, parsing...")

const file = await readFile(pointcloudFile);
const meta = readFile(metadataFile, { encoding: 'utf8' });

console.timeEnd("file read, parsing...")
console.time("everything parsed, fixing tilt...")

const points = parse(file.buffer);

const metadata = await meta.then(JSON.parse);
const tiltMatrix = getTiltMatrix(metadata);

console.timeEnd("everything parsed, fixing tilt...")
console.time("fixed, building octree...")

for (const i in points) {
    const p = points[i];
    const [x, y, z] = mat_m_v(tiltMatrix, [p.x, p.y, p.z, 1]);
    points[i] = { x, y, z };
}

console.timeEnd("fixed, building octree...")
console.time("built, getting all...")

const octree = buildOctree(points, octantWidth, origin, leafSize);

console.timeEnd("built, getting all...")
console.time("got it")

const list = getAll(octree);

console.timeEnd("got it")
console.time("sampling...")
console.log("numbers in tree:", list.length);
console.log("numbers in list:", points.length);

const eqSet = (xs, ys) =>
    xs.size === ys.size &&
    [...xs].every((x) => ys.has(x));

console.log("sets equal?", eqSet(new Set(list), new Set(points)));
console.log("point", points[123]);
console.log("size", treeSize(octree));

console.timeEnd("sampling...")
console.time("done sampling, building file")

const { image, misses, closest, farthest, octantHash } = raycast(octree);

console.timeEnd("done sampling, building file")
console.time("file buffer built, writing to disk")
console.log("vertical res", vertical_resolution, image.length)
console.log("horizontal res", horizontal_resolution, image[0].length)
console.log("misses", misses)
console.log("closest", closest)
console.log("farthest", farthest)

const output = createBitmapImage({ image, closest, farthest, octantHash });

console.timeEnd("file buffer built, writing to disk")
console.time("timer")

await writeFile(depthmapFile, output);

console.timeEnd("timer")
