import { horizontal_resolution, maxSteps, stepSize, vertical_resolution } from "params";

/**
 * returns a flat byte array encoding a bitmapped image of `horizontal_resolution`
 * by `veritcal_resolution` pixels (row major), of RGB triplets (one byte per channel)
 */
export const createBitmapImage = ({ image, closest, farthest }: { image: number[][], closest: number, farthest: number}) => {
    const range = farthest - closest;

    const output = new ArrayBuffer(vertical_resolution * horizontal_resolution * 3);
    const outputView = new DataView(output)

    for (let v = 0; v < vertical_resolution; v++) {
        for (let h = 0; h < horizontal_resolution; h++) {
            const depth = image[v][h];
            let pixel = Math.floor(255 * (1 - (depth - closest) / range));

            if (pixel < 0) pixel = 0;
            if (pixel > 255) pixel = 255;

            if (depth > stepSize * maxSteps) {
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

    return output;
}