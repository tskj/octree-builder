import { Point } from "types";
import { assert, isFiniteNumber, } from "utils";
import { lengthSq, mat_m_mat } from "vector-utils";

/**
 * parses binary format and converts from polar coordinates to
 * cartesian coordinates
 * 
 * ignores zeroes and other bad data, but failes if the angles
 * don't make sense in the input data
 */
export const parse = (buffer: ArrayBufferLike): Point[] => {
    const view = new DataView(buffer);

    const points: Point[] = [];

    let numberOfPointsRead = 0;
    for (let i = 0; i < view.byteLength; i += 16) {
        const h_angle = view.getFloat32(i, true);
        const v_angle = view.getFloat32(i + 4, true);
        const distance = view.getFloat32(i + 8, true);

        // commented out since it's not needed:
        // (but it's there if you want it)
        // const intensity = view.getFloat32(i + 12, true);

        numberOfPointsRead++;

        // a lot of data is garbage, and points inside the
        // scanner makes no sense anyway
        if (distance === 0) {
            continue;
        }

        assert("h_angle is regular float", isFiniteNumber(h_angle))
        assert("v_angle is regular float", isFiniteNumber(v_angle))
        assert("distance is regular float", isFiniteNumber(distance))
        // not really sure why the scanner gives double angles for both axes, but it does
        assert("h_angle makes sense", -2 * Math.PI <= h_angle && h_angle <= 2 * Math.PI);
        assert("v_angle makes sense", 0 <= v_angle && v_angle <= 2 * Math.PI);
        assert("distance makes sense", distance > 0);

        const x = -distance * Math.sin(v_angle) * Math.sin(h_angle);
        const y = -distance * Math.cos(v_angle);
        const z = -distance * Math.sin(v_angle) * Math.cos(h_angle);

        const point = {
            x, y, z
        };


        const len2 = lengthSq(point);
        assert("calculated point is not at origin", len2 >= 0.10 ** 2);
        assert("calculated point is not too far away", len2 <= 10000 ** 2);

        points.push(point);
    }

    assert("entire file is read", numberOfPointsRead === view.byteLength / 16);

    return points;
}

export const getTiltMatrix = (metadata: any) => {
    // tiltMatrix is provided column major in a flat list
    let tiltMatrix = [
        [metadata.tiltMatrix[0], metadata.tiltMatrix[4], metadata.tiltMatrix[8], metadata.tiltMatrix[12]],
        [metadata.tiltMatrix[1], metadata.tiltMatrix[5], metadata.tiltMatrix[9], metadata.tiltMatrix[13]],
        [metadata.tiltMatrix[2], metadata.tiltMatrix[6], metadata.tiltMatrix[10], metadata.tiltMatrix[14]],
        [metadata.tiltMatrix[3], metadata.tiltMatrix[7], metadata.tiltMatrix[11], metadata.tiltMatrix[15]],
    ];

    // weirdly, the tilt matrix is specified in a coordinate system
    // where Z is up, even though Y is up for the rest of the data
    // provided by the system; this rotates back and forth to fix this
    tiltMatrix = mat_m_mat([
            [1, 0, 0, 0],
            [0, 0, 1, 0],
            [0, -1, 0, 0],
            [0, 0, 0, 1],
        ],
        mat_m_mat(tiltMatrix, [
            [1, 0, 0, 0],
            [0, 0, -1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 1],
        ]));

    return tiltMatrix;
}
