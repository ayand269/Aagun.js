import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    bundle: true,
    target: 'node18',
    clean: true,
    noExternal: ['chalk'] // keep prompts external
});
