import { readFileSync } from 'node:fs';
import path from 'node:path';

import { extractMessages, renderPot } from '../scripts/extractMessages.mjs';
import { _, CATALOG_SOURCES, initI18n, parsePo, resolveLocale } from './i18n';

const ROOT = path.resolve(__dirname, '..');

/** Lists `{name}` placeholders in a message, sorted, e.g. `{b} {a}` as `a,b`. */
function placeholders(message: string): string {
    return [...message.matchAll(/\{(\w+)\}/g)]
        .map((match) => match[1] ?? '')
        .sort((a, b) => a.localeCompare(b))
        .join(',');
}

afterEach(() => initI18n(null));

describe('parsePo', () => {
    test('reads entries, multi-line strings, and escapes', () => {
        const catalog = parsePo(
            [
                'msgid ""',
                'msgstr ""',
                '"Language: ja\\n"',
                '',
                '# comment',
                'msgid "Apply"',
                'msgstr "適用"',
                '',
                'msgid ""',
                '"Say \\"hi\\""',
                'msgstr "line1\\n"',
                '"line2"',
            ].join('\n')
        );
        expect(catalog).toEqual({ Apply: '適用', 'Say "hi"': 'line1\nline2' });
    });

    test('skips fuzzy and untranslated entries', () => {
        const catalog = parsePo(['#, fuzzy', 'msgid "A"', 'msgstr "a"', '', 'msgid "B"', 'msgstr ""'].join('\n'));
        expect(catalog).toEqual({});
    });
});

describe('resolveLocale', () => {
    const available = ['ja', 'zh_CN', 'zh_TW', 'pt_BR'];

    test.each([
        ['ja_JP', 'ja'],
        ['zh_TW', 'zh_TW'],
        ['zh-tw', 'zh_TW'],
        ['zh_HK', 'zh_TW'],
        ['zh_SG', 'zh_CN'],
        ['pt_PT', 'pt_BR'],
        ['en_GB', null],
        ['', null],
    ])('%s resolves to %s', (locale, expected) => {
        expect(resolveLocale(locale, available)).toBe(expected);
    });
});

describe('_', () => {
    test('falls back to English and fills placeholders', () => {
        initI18n('en_US');
        expect(_('Markdown formatted. {stats}.', { stats: 'x' })).toBe('Markdown formatted. x.');
    });

    test('uses the catalog for the Joplin locale', () => {
        initI18n('ja_JP');
        expect(_('Apply')).toBe('適用');
        expect(_('Characters added: {added}, removed: {removed}', { added: 1, removed: 2 })).toBe(
            '追加した文字数: 1、削除した文字数: 2'
        );
    });

    test('leaves unknown placeholders and messages untouched', () => {
        initI18n('ja');
        expect(_('Not in any catalog {x}')).toBe('Not in any catalog {x}');
    });
});

describe('catalogs', () => {
    const messages = extractMessages(ROOT);

    test('messages.pot is up to date (run `npm run i18n:extract`)', () => {
        const pot = readFileSync(path.join(ROOT, 'src/locales/messages.pot'), 'utf8');
        expect(pot).toBe(renderPot(messages));
    });

    test.each(Object.keys(CATALOG_SOURCES))('%s translates every message with matching placeholders', (locale) => {
        const catalog = parsePo(CATALOG_SOURCES[locale] ?? '');
        expect(new Set(Object.keys(catalog))).toEqual(new Set(messages));
        const mismatched = messages.filter((message) => placeholders(catalog[message] ?? '') !== placeholders(message));
        expect(mismatched).toEqual([]);
    });
});
