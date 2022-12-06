
export type Point = {
    x: number;
    y: number;
    z: number;
}

type Octants = {
    posX_posY_posZ: Octree;
    posX_posY_negZ: Octree;
    posX_negY_posZ: Octree;
    posX_negY_negZ: Octree;
    negX_posY_posZ: Octree;
    negX_posY_negZ: Octree;
    negX_negY_posZ: Octree;
    negX_negY_negZ: Octree;
}

export type Octree =
    | ['node', Octants]
    | ['leaf', Point]
    | ['empty']
