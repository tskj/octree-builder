
/**
 * checks if the lists contain the same elements regardless of ordering - i.e. they
 * are permutations of each other (or the same)
 */
export const expectToBePermutation = <T extends string | number>(xs: T[], ys: T[]) => {
    expect(xs.length).toBe(ys.length);

    const xsCount = xs.reduce((acc, e) => ({...acc, [e]: (acc[e] ?? 0) + 1}), {} as any);
    const ysCount = ys.reduce((acc, e) => ({...acc, [e]: (acc[e] ?? 0) + 1}), {} as any);

    expect(xsCount).toEqual(ysCount);
};