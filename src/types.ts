
export type Point = {
    x: number;
    y: number;
    z: number;
}

export const octantDirections = [
    'posX_posY_posZ',
    'posX_posY_negZ',
    'posX_negY_posZ',
    'posX_negY_negZ',
    'negX_posY_posZ',
    'negX_posY_negZ',
    'negX_negY_posZ',
    'negX_negY_negZ',
] as const;

export type OctantDirections = (typeof octantDirections)[number]

type Octants = Record<OctantDirections, Octree>

export type Octree =
    | ['node', Octants]
    | ['leaf', Point]
    | ['empty']
