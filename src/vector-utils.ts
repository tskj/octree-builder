import { Point } from "types";

export const origin: Point = { x: 0, y: 0, z: 0 };

export const yAxis = { x: 0, y: 1, z: 0 };

export const add = (a: Point, b: Point): Point => ({
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
});

export const sub = (a: Point, b: Point): Point => ({
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
});

export const dot = (p1: Point, p2: Point): number => {
    return p1.x * p2.x + p1.y * p2.y + p1.z * p2.z;
}

export const lengthSq = ({x, y, z}: Point) => {
    return x ** 2 + y ** 2 + z ** 2;
}

export const length = ({ x, y, z }: Point): number => {
    return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
}

export const distSq = (p1: Point, p2: Point): number => {
    return lengthSq(sub(p1, p2));
}

export const point_format = ({x, y, z}: Point) => `Point{${x}, ${y}, ${z}}`;

export const point_serialize = ({x, y, z}: Point) => `${x}:${y}:${z}`
export const point_parse = (point: string): Point => {
    const [x, y, z] = point.split(':').map(parseFloat)
    return {x, y, z}
}
