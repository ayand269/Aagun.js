import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/types/express.d.ts', 'src/mongoDB.ts'],
    format: ['esm'],
    target: 'es2022',
    dts: true,
    esbuildOptions(options) {
        // prettier-ignore
        // eslint-disable-next-line quotes
        options.banner = {
            js: 'import \'reflect-metadata\';'
        };
    }
});
