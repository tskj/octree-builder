import { Point } from "types";

export const origin: Point = { x: 0, y: 0, z: 0 };

export const add = (a: Point, b: Point): Point => ({
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
});

export const point_format = ({x, y, z}: Point) => `Point{${x}, ${y}, ${z}}`;

export const point_serialize = ({x, y, z}: Point) => `${x}:${y}:${z}`
export const point_parse = (point: string): Point => {
    const [x, y, z] = point.split(':').map(parseFloat)
    return {x, y, z}
}
