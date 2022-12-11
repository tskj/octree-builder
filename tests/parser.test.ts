import fc  from 'fast-check';
import { fc_examples, fc_listOfUniquePoints, } from "./arbitraries";

test('', () => {
    fc.assert(
        fc.property(
            fc_listOfUniquePoints(),
            fc.context(),
            ({points}, ctx) => {
                const length = points.length;

                const bytes = new ArrayBuffer(length * 4);
                const view = new DataView(bytes);

                view.setFloat32(0, 3.14, true);


                console.log(view.buffer);

                console.log(new DataView(view.buffer).getFloat32(0, true));
            }
        ),
        { examples: [
            [fc_examples.twoPointsFailure, fc_examples.context()],
            ...fc_examples.realData,
        ] }
    )
})