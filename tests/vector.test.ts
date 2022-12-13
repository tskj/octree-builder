import fc  from 'fast-check';
import { identity_matrix, mat_m_mat, mat_m_v, m_dimensions } from 'vector-utils';
import { fc_matrix, fc_vector } from './arbitraries';
import { expectEqualMatrices } from './utils';

test('multiplying by identity matrix does nothing', () => {
    fc.assert(
        fc.property(
            fc.integer({min: 1, max: 4})
                .chain(dimensions => fc.tuple(
                    fc.constant(dimensions),
                    fc_matrix(dimensions, dimensions))),
            fc.context(),
            ([d, m], ctx) => {
                const id = identity_matrix(d);

                const result1 = mat_m_mat(id, m);
                const result2 = mat_m_mat(m, id);
                
                expectEqualMatrices(result1, m);
                expectEqualMatrices(result2, m);
            }
        ),
    )
})

test('matrix multiplication is defined', () => {
    fc.assert(
        fc.property(
            fc.tuple(
                fc.integer({min: 1, max: 4}),
                fc.integer({min: 1, max: 4}),
                fc.integer({min: 1, max: 4}),
            ).chain(([k, otherWidth, otherHeight]) =>
                fc.tuple(
                    fc_matrix(k, otherHeight),
                    fc_matrix(otherWidth, k))),
            fc.context(),
            ([m1, m2], ctx) => {
                const dim1 = m_dimensions(m1);
                const dim2 = m_dimensions(m2);

                const result = mat_m_mat(m1, m2);

                const dim3 = m_dimensions(result);

                expect(dim3.height).toEqual(dim1.height);
                expect(dim3.width).toEqual(dim2.width);

                if (dim2.width !== dim1.height) {
                    expect(() => mat_m_mat(m2, m1)).toThrow();
                }
            }
        ),
    )
})

test('matrix x vector multiplication works', () => {
    fc.assert(
        fc.property(
            fc.tuple(
                fc.integer({min: 1, max: 4}),
                fc.integer({min: 1, max: 4}),
            ).chain(([k, otherHeight]) =>
                fc.tuple(
                    fc_matrix(k, otherHeight),
                    fc_vector(k))),
            fc.context(),
            ([m, v], ctx) => {
                const dim = m_dimensions(m);

                const result = mat_m_v(m, v);
                expect(result.length).toEqual(dim.height);

                const matrix_result = mat_m_mat(m, v.map(x => [x]));
                expectEqualMatrices(matrix_result, result.map(x => [x]));
            }
        ),
    )
})
