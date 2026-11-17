/**
 * Minimal gettext-style UI translation.
 *
 * Catalogs are the `.po` files in `./locales`, bundled as text (esbuild `text`
 * loader) so no file access is needed at runtime, which keeps mobile working.
 * Message IDs are the English source strings, so English needs no catalog and
 * any missing translation falls back to English.
 */

import de from './locales/de.po';
import es from './locales/es.po';
import fr from './locales/fr.po';
import it from './locales/it.po';
import ja from './locales/ja.po';
import ko from './locales/ko.po';
import ptBR from './locales/pt_BR.po';
import ru from './locales/ru.po';
import zhCN from './locales/zh_CN.po';
import zhTW from './locales/zh_TW.po';

export type Catalog = Record<string, string>;

/**
 * Bundled catalog sources keyed by Joplin locale code. When only the language
 * part of a locale matches, the first entry for that language wins, so order
 * matters (e.g. `zh_SG` falls back to `zh_CN`).
 */
export const CATALOG_SOURCES: Readonly<Record<string, string>> = {
    ja,
    ko,
    zh_CN: zhCN,
    zh_TW: zhTW,
    de,
    es,
    fr,
    it,
    pt_BR: ptBR,
    ru,
};

/** Locales whose language part alone should map to a specific catalog, e.g. `zh_HK` to Traditional Chinese. */
const REGION_FALLBACKS: Readonly<Record<string, string>> = {
    zh_HK: 'zh_TW',
    zh_MO: 'zh_TW',
};

let activeCatalog: Catalog = {};

/**
 * Matches one quoted PO string with its escapes, e.g. `"say \"hi\"\n"`.
 */
const PO_STRING_PATTERN = /^"((?:[^"\\]|\\.)*)"$/;

/**
 * Matches a PO escape sequence, e.g. `\n`, `\t`, `\"`, `\\`.
 */
const PO_ESCAPE_PATTERN = /\\(.)/g;

const PO_ESCAPES: Record<string, string> = { n: '\n', t: '\t', r: '\r' };

function unquote(value: string): string {
    const match = PO_STRING_PATTERN.exec(value.trim());
    if (!match) throw new Error(`Invalid PO string: ${value}`);
    return (match[1] ?? '').replace(PO_ESCAPE_PATTERN, (_whole, char: string) => PO_ESCAPES[char] ?? char);
}

interface PoEntry {
    msgid: string;
    msgstr: string;
    fuzzy: boolean;
}

type PoField = 'msgid' | 'msgstr';

/** Reads the `msgid`/`msgstr` entries of a PO file; other keywords and comments are ignored. */
function readPoEntries(source: string): PoEntry[] {
    const entries: PoEntry[] = [];
    let entry: PoEntry = { msgid: '', msgstr: '', fuzzy: false };
    let field: PoField | null = null;

    const flush = (): void => {
        if (field !== null) entries.push(entry);
        entry = { msgid: '', msgstr: '', fuzzy: false };
        field = null;
    };

    for (const rawLine of source.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (line.startsWith('#,') && line.includes('fuzzy')) {
            if (field === 'msgstr') flush();
            entry.fuzzy = true;
        } else if (line.startsWith('msgid ')) {
            if (field === 'msgstr') flush();
            field = 'msgid';
            entry.msgid = unquote(line.slice('msgid '.length));
        } else if (line.startsWith('msgstr ')) {
            field = 'msgstr';
            entry.msgstr = unquote(line.slice('msgstr '.length));
        } else if (line.startsWith('"') && field !== null) {
            entry[field] += unquote(line);
        }
    }
    flush();
    return entries;
}

/**
 * Parses a PO file into a msgid-to-msgstr map. The header entry, fuzzy entries,
 * and untranslated entries are left out so they fall back to English.
 */
export function parsePo(source: string): Catalog {
    const catalog: Catalog = {};
    for (const { msgid, msgstr, fuzzy } of readPoEntries(source)) {
        if (msgid !== '' && msgstr !== '' && !fuzzy) catalog[msgid] = msgstr;
    }
    return catalog;
}

/** Normalizes Joplin and BCP 47 locale spellings, e.g. `zh-tw` to `zh_TW`. */
function normalizeLocale(locale: string): string {
    const [language = '', region] = locale.trim().replace('-', '_').split('_');
    return region ? `${language.toLowerCase()}_${region.toUpperCase()}` : language.toLowerCase();
}

/**
 * Picks the catalog key for a locale: an exact match, then a regional
 * fallback, then the first catalog with the same language. Returns `null`
 * for English and unsupported locales.
 *
 * @example resolveLocale('ja_JP', ['ja', 'zh_CN']) // 'ja'
 * @example resolveLocale('zh_TW', ['zh_CN', 'zh_TW']) // 'zh_TW'
 */
export function resolveLocale(locale: string, available: readonly string[]): string | null {
    const normalized = normalizeLocale(locale);
    if (available.includes(normalized)) return normalized;
    const regional = REGION_FALLBACKS[normalized];
    if (regional && available.includes(regional)) return regional;
    const language = normalized.split('_')[0];
    return available.find((key) => key.split('_')[0] === language) ?? null;
}

/** Selects the UI language. Call once at plugin start, before registering any UI. */
export function initI18n(locale: string | null | undefined): void {
    const key = locale ? resolveLocale(locale, Object.keys(CATALOG_SOURCES)) : null;
    const source = key ? CATALOG_SOURCES[key] : undefined;
    activeCatalog = source ? parsePo(source) : {};
}

/** Matches a named placeholder, e.g. `{count}`. */
const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

/**
 * Translates an English UI string, then fills `{name}` placeholders.
 *
 * @example _('Characters added: {added}, removed: {removed}', { added: 2, removed: 0 })
 */
export function _(msgid: string, values: Record<string, string | number> = {}): string {
    const text = activeCatalog[msgid] ?? msgid;
    return text.replace(PLACEHOLDER_PATTERN, (whole, name: string) => (name in values ? String(values[name]) : whole));
}
