
export type Point = {
    x: number;
    y: number;
    z: number;
}

export type Octants = {
    a: Octree;
    b: Octree;
    c: Octree;
}

export type Octree = {};

export type OctantDirections = keyof Octants;

export const octantDirections: OctantDirections[] = [
    'a',
    'b',
    'c',
];
