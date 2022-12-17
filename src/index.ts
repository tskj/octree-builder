import { buildOctree, lookupNearest } from "builder";
import { readFile, writeFile } from "node:fs/promises"
import { getAll, treeSize } from "octree-utils";
import { parse } from "binary-format-parser";
import { distSq, length, mat_m_mat, mat_m_v, origin, rotX, rotY } from "vector-utils";
import { closeEnoughSq, horizontal_resolution, leafSize, maxSteps, octantWidth, stepSize, vertical_resolution } from "params";

console.time("file read, parsing...")

const file = await readFile("./data/pointcloud.bin");
const meta = readFile("./data/metadata.json", {encoding: 'utf8'});

console.timeEnd("file read, parsing...")
console.time("everything parsed, fixing tilt...")

const points = parse(file.buffer);

const metadata = await meta.then(x => JSON.parse(x));
let tiltMatrix = [
    [metadata.tiltMatrix[0], metadata.tiltMatrix[4], metadata.tiltMatrix[8], metadata.tiltMatrix[12]],
    [metadata.tiltMatrix[1], metadata.tiltMatrix[5], metadata.tiltMatrix[9], metadata.tiltMatrix[13]],
    [metadata.tiltMatrix[2], metadata.tiltMatrix[6], metadata.tiltMatrix[10], metadata.tiltMatrix[14]],
    [metadata.tiltMatrix[3], metadata.tiltMatrix[7], metadata.tiltMatrix[11], metadata.tiltMatrix[15]],
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

const image: number[][] = [];

let misses = 0;
let closest = Infinity;
let farthest = 0;

for (let v = 0; v < vertical_resolution; v++) {
    const phi = Math.PI / 4 - (Math.PI / 2) * (v / vertical_resolution);

    const scanline = [];
    for (let h = 0; h < horizontal_resolution; h++) {
        const theta = 2 * Math.PI - (2 * Math.PI) * (h / horizontal_resolution);

        const negativeZ = [0, 0, -1];
        const rotation = mat_m_mat(rotY(theta), rotX(phi));
        let [x, y, z] = mat_m_v(rotation, negativeZ);

        const dx = x * stepSize;
        const dy = y * stepSize;
        const dz = z * stepSize;

        let k: number;
        for (k = 0; k < maxSteps; k++) {
            const sample = { x, y, z };
            const points = lookupNearest(sample, octree, octantWidth);
            if (points.some(p => distSq(p, sample) < closeEnoughSq)) {
                const depth = length(sample)
                scanline.push(depth)
                if (depth < closest) closest = depth;
                if (depth > farthest) farthest = depth;
                break;
            } else {
                x += dx;
                y += dy;
                z += dz;
            }
        }
        if (k >= maxSteps) {
            const depth = stepSize * maxSteps + .1
            scanline.push(depth);
            misses++;
        }
    }
    image.push(scanline);
}

const range = farthest - closest;

console.timeEnd("done sampling, building file")
console.time("file buffer built, writing to disk")
console.log("vertical res", vertical_resolution, image.length)
console.log("horizontal res", horizontal_resolution, image[0].length)
console.log("misses", misses)
console.log("closest", closest)
console.log("farthest", farthest)

const output = new ArrayBuffer(vertical_resolution * horizontal_resolution * 3);
const outputView = new DataView(output)

for (let v = 0; v < vertical_resolution; v++) {
    for (let h = 0; h < horizontal_resolution; h++) {
        const depth = image[v][h];
        let pixel = Math.floor(255 * (1 - (depth - closest) / range));

        if (pixel < 0) pixel = 0;
        if (pixel > 255) pixel = 255;

        if (pixel === 0 && depth > stepSize * maxSteps) {
            outputView.setUint8(v * horizontal_resolution * 3 + (h * 3) + 0, 0);
            outputView.setUint8(v * horizontal_resolution * 3 + (h * 3) + 1, 255);
            outputView.setUint8(v * horizontal_resolution * 3 + (h * 3) + 2, 0);
        } else {
            outputView.setUint8(v * horizontal_resolution * 3 + (h * 3) + 0, pixel);
            outputView.setUint8(v * horizontal_resolution * 3 + (h * 3) + 1, pixel);
            outputView.setUint8(v * horizontal_resolution * 3 + (h * 3) + 2, pixel);
        }
    }
}

console.timeEnd("file buffer built, writing to disk")
console.time("timer")

await writeFile("./data/depthmap.bin", output);

console.timeEnd("timer")
