/** PO catalogs are bundled as plain text (esbuild `text` loader, Vitest `poAsText` plugin). */
declare module '*.po' {
    const source: string;
    export default source;
}
