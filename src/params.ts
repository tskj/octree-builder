import { readFile } from "node:fs/promises";

/**
 * this typescript file is needed as long as importing json files directly
 * doesn't work in Bun
 */
const params = await readFile("src/parameters.json", { encoding: 'utf8' }).then(JSON.parse);

export const octantWidth = params['octantWidth']
export const leafSize = params['leafSize']

export const closeEnoughSq = params['closeEnough'] ** 2
export const stepSize = params['stepSize']
export const maxSteps = params['maxSteps']

export const vertical_resolution = params['vertical_resolution']
export const horizontal_resolution = params['horizontal_resolution']
