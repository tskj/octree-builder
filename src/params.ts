import { readFileSync } from "node:fs";

/**
 * this typescript file is needed as long as importing json files directly
 * doesn't work in Bun
 */
const params = JSON.parse(readFileSync("src/parameters.json", { encoding: 'utf8' }));

export const octantWidth = params['octantWidth']
export const leafSize = params['leafSize']

export const pointSizeSq = params['closeEnough'] ** 2
export const pointSize = Math.sqrt(pointSizeSq)
export const stepSize = params['stepSize']
export const maxSteps = params['maxSteps']

export const vertical_resolution = params['vertical_resolution']
export const horizontal_resolution = params['horizontal_resolution']
