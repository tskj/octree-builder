# octree-builder

To install dependencies:

```zsh
$ bun install
```

To run:

```zsh
$ bun run src/index.ts
```

This project was created using `bun init` in bun v0.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Running tests

Run regular property based tests:

```zsh
$ npm run test
```
You can also run the property based tests with real data in addition to synthetic data:

```zsh
$ npm run test -- -use-real-data
```

however this takes longer, so be careful! This also expects a scan file `data/pointcloud.bin` with real data in a specific format.
