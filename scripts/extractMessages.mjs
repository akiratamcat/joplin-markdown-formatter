/**
 * Extracts translatable UI strings (`_('...')` calls) from `src/` into
 * `src/locales/messages.pot`, the template the `.po` catalogs are based on.
 *
 * Usage: `npm run i18n:extract`
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Matches the first argument of a translation call when it is a plain string
 * literal, e.g. `_('Apply')` or `_("Straight ('quote')")`, across line breaks.
 */
const MESSAGE_CALL_PATTERN = /(?<![\w$.])_\(\s*('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")/g;

/** Matches source files that may contain UI strings, excluding tests and declarations. */
const SOURCE_FILE_PATTERN = /^(?!.*\.(?:test|d)\.ts$).*\.ts$/;

/**
 * Turns a JavaScript string literal into its value, e.g. `'don\'t'` into `don't`.
 * @param {string} literal
 * @returns {string}
 */
function literalValue(literal) {
    const body = literal.slice(1, -1);
    return body.replace(/\\(.)/g, (_whole, char) => ({ n: '\n', t: '\t' })[char] ?? char);
}

/**
 * Lists `.ts` sources under a directory, sorted for a stable template order.
 * @param {string} dir
 * @returns {string[]}
 */
function listSources(dir) {
    return readdirSync(dir, { withFileTypes: true, recursive: true })
        .filter((entry) => entry.isFile() && SOURCE_FILE_PATTERN.test(entry.name))
        .map((entry) => path.join(entry.parentPath, entry.name))
        .filter((file) => !file.split(path.sep).includes('fixtures'))
        .sort();
}

/**
 * Collects unique message IDs from `<root>/src` in source order.
 * @param {string} root Project root.
 * @returns {string[]}
 */
export function extractMessages(root) {
    const messages = new Set();
    for (const file of listSources(path.join(root, 'src'))) {
        for (const match of readFileSync(file, 'utf8').matchAll(MESSAGE_CALL_PATTERN)) {
            messages.add(literalValue(match[1]));
        }
    }
    return [...messages];
}

/**
 * Quotes a value as a PO string, e.g. `say "hi"` as `"say \"hi\""`.
 * @param {string} value
 * @returns {string}
 */
function poQuote(value) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t')}"`;
}

/**
 * Renders a gettext template for the given message IDs.
 * @param {string[]} messages
 * @returns {string}
 */
export function renderPot(messages) {
    const header = [
        'msgid ""',
        'msgstr ""',
        '"Content-Type: text/plain; charset=UTF-8\\n"',
        '"Content-Transfer-Encoding: 8bit\\n"',
        '',
    ];
    const entries = messages.flatMap((message) => [`msgid ${poQuote(message)}`, 'msgstr ""', '']);
    return [...header, ...entries].join('\n');
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    const messages = extractMessages(root);
    writeFileSync(path.join(root, 'src', 'locales', 'messages.pot'), renderPot(messages));
    console.log(`Extracted ${messages.length} messages to src/locales/messages.pot`);
}
