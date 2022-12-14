import { lookupNearest } from "builder";
import { horizontal_resolution, maxSteps, octantWidth, pointSizeSq, stepSize, vertical_resolution } from "params";
import { Octree } from "types";
import { distSq, length, mat_m_mat, mat_m_v, rotX, rotY } from "vector-utils";

/**
 * raycasts the octree to build a depth buffer, sampling is done
 * from the origin outwards in a sphere with uniform distance
 * between azimuth angles and altitude angles
 * 
 * returns `image` which is a row major 2D list of depth values as
 * seen from the origin, and also some metadata about the raycasting
 * process, namely number of misses and closest and farthest hits
 */
export const raycast = (octree: Octree) => {
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
                if (points.some(p => distSq(p, sample) < pointSizeSq)) {
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

    return {
        image,
        misses,
        closest,
        farthest,
    }
}
