import { Point } from "types";

export const add = (a: Point, b: Point): Point => ({
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
});

export const point_format = ({x, y, z}: Point) => `Point{${x}, ${y}, ${z}}`;
