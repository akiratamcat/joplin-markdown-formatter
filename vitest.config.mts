import { defineConfig, type Plugin } from 'vitest/config';

/** Loads `.po` catalogs as text, mirroring the esbuild `text` loader used for the plugin bundle. */
const poAsText: Plugin = {
    name: 'po-as-text',
    transform(code, id) {
        if (!id.endsWith('.po')) return null;
        return { code: `export default ${JSON.stringify(code)};`, map: null };
    },
};

export default defineConfig({
    plugins: [poAsText],
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        include: ['src/**/*.test.ts'],
        environment: 'node',
        globals: true,
    },
});
