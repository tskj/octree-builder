import { Point } from "types";
import { assert, isFiniteNumber, } from "utils";
import { lengthSq } from "vector-utils";

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