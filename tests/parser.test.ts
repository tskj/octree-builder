import fc  from 'fast-check';
import { parse } from 'binary-format-parser';
import { distSq, dot, length, lengthSq, yAxis } from 'vector-utils';
import { fc_examples, fc_listOfUniquePoints, } from "./arbitraries";

test('parse binary format', () => {
    fc.assert(
        fc.property(
            fc_listOfUniquePoints(),
            fc.context(),
            ({points: points_, octantWidth}, ctx) => {
                const points = points_.filter(p => 0.10 ** 2 < lengthSq(p) && lengthSq(p) < 1000 ** 2);
                fc.pre(points.length > 0);
                octantWidth = octantWidth + 1e-1;

                const bytes = new ArrayBuffer(points.length * 4 * 4);
                const view = new DataView(bytes);

                for (let i = 0; i < points.length; i++) {
                    const { x, y, z } = points[i];

                    const dist = length({ x, y, z });
                    const theta = Math.atan2(-z, x) - Math.PI/2;
                    const phi = Math.PI - Math.acos(dot({ x, y, z }, yAxis) / dist);
                    const intensity = 0;

                    view.setFloat32(i * 16 + 0, theta, true);
                    view.setFloat32(i * 16 + 4, phi, true);
                    view.setFloat32(i * 16 + 8, dist, true);
                    view.setFloat32(i * 16 + 12, intensity, true);
                }

                const parsedPoints = parse(bytes);

                expect(parsedPoints.length).toBe(points.length);
                for (const p of points) {
                    expect(parsedPoints.some(pp => distSq(pp, p) <= 0.001 ** 2)).toBe(true);
                }
            }
        ),
        { examples: [
            [fc_examples.twoPointsFailure, fc_examples.context()],
            ...(fc_examples.realData ? [[{ points: fc_examples.realData, octantWidth: 500 }, fc_examples.context()]] : []),
        ] }
    )
})