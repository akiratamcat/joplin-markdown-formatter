/**
 * Joplin settings registration and typed access.
 *
 * Formatter setting keys are identical to the FormatterOptions property names
 * so loading is a straight copy with no mapping table to keep in sync.
 */

import joplin from 'api';
import { SettingItemType } from 'api/types';
import { DEFAULT_OPTIONS, type FormatterOptions } from './formatter';
import { _ } from './i18n';

const SECTION = 'markdownFormatter';
const DISPLAY_TOAST_MESSAGES_KEY = 'displayToastMessages';
const SHOW_DIFF_PREVIEW_KEY = 'showDiffPreview';
const LEGACY_ALIGN_TABLES_KEY = 'alignTables';
const LEGACY_NORMALIZE_LINK_TEXT_SPACING_KEY = 'normalizeLinkTextSpacing';

const OPTION_KEYS: Array<keyof FormatterOptions> = [
    'collapseBlankLines',
    'trimTrailingWhitespace',
    'ensureHeadingBlankLines',
    'normalizeHeadingMarkerSpacing',
    'removeHeadingIndentation',
    'ensureParagraphBlankLines',
    'ensureCodeBlockBlankLines',
    'setDefaultCodeBlockLanguage',
    'defaultCodeBlockLanguage',
    'ensureMathBlockBlankLines',
    'ensureTableBlankLines',
    'ensureBlockquoteBlankLines',
    'normalizeBlockquoteMarkerSpacing',
    'ensureListBlankLines',
    'ensureFrontmatterBlankLine',
    'normalizeHeadingLevels',
    'minimumHeadingLevel',
    'listSpacing',
    'indentation',
    'tableStyle',
    'emphasisMarker',
    'strongMarker',
    'doubleQuoteStyle',
    'singleQuoteStyle',
    'unorderedListMarker',
    'thematicBreakMarker',
    'normalizeOrderedListNumbering',
    'linkTextSpacing',
    'removeLeadingBlankLines',
    'ensureFinalNewline',
];

export async function registerSettings(): Promise<void> {
    await joplin.settings.registerSection(SECTION, {
        label: 'Markdown Formatter',
        iconName: 'fas fa-align-left',
        description: _('Formatting applied by the "Format Markdown" command.'),
    });

    await joplin.settings.registerSettings({
        unorderedListMarker: {
            value: DEFAULT_OPTIONS.unorderedListMarker,
            type: SettingItemType.String,
            section: SECTION,
            public: true,
            isEnum: true,
            options: { '-': _('- (dash)'), '*': _('* (asterisk)'), preserve: _('Preserve (leave markers unchanged)') },
            label: _('Unordered list marker'),
            description: _(
                'Note: CommonMark treats adjacent lists with different bullets as separate lists; normalizing their markers merges them.'
            ),
        },
        normalizeOrderedListNumbering: {
            value: DEFAULT_OPTIONS.normalizeOrderedListNumbering,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Normalize ordered list numbering'),
            description: _('Renumber ordered lists sequentially, keeping the first item’s number.'),
        },
        thematicBreakMarker: {
            value: DEFAULT_OPTIONS.thematicBreakMarker,
            type: SettingItemType.String,
            section: SECTION,
            public: true,
            isEnum: true,
            options: {
                '---': '---',
                '- - -': '- - -',
                '***': '***',
                '* * *': '* * *',
            },
            label: _('Horizontal rule marker'),
        },
        emphasisMarker: {
            value: DEFAULT_OPTIONS.emphasisMarker,
            type: SettingItemType.String,
            section: SECTION,
            public: true,
            isEnum: true,
            options: { '*': '*emphasis*', _: '_emphasis_' },
            label: _('Emphasis (italic) marker'),
        },
        strongMarker: {
            value: DEFAULT_OPTIONS.strongMarker,
            type: SettingItemType.String,
            section: SECTION,
            public: true,
            isEnum: true,
            options: { '**': '**bold**', __: '__bold__' },
            label: _('Bold marker'),
        },
        doubleQuoteStyle: {
            value: DEFAULT_OPTIONS.doubleQuoteStyle,
            type: SettingItemType.String,
            section: SECTION,
            public: true,
            isEnum: true,
            options: {
                preserve: _('Preserve (leave quotes unchanged)'),
                straight: _('Straight ("quote")'),
                smart: _('Smart (“quote”)'),
            },
            label: _('Double quote style'),
            description: _(
                'Convert double quotes in prose text. Code, math, HTML, front matter, and link titles are never changed.'
            ),
        },
        singleQuoteStyle: {
            value: DEFAULT_OPTIONS.singleQuoteStyle,
            type: SettingItemType.String,
            section: SECTION,
            public: true,
            isEnum: true,
            options: {
                preserve: _('Preserve (leave quotes unchanged)'),
                straight: _("Straight ('quote', don't)"),
                smart: _('Smart (‘quote’, don’t)'),
            },
            label: _('Single quote style'),
            description: _(
                'Convert single quotes and apostrophes in prose text. Code, math, HTML, front matter, and link titles are never changed.'
            ),
        },
        linkTextSpacing: {
            value: DEFAULT_OPTIONS.linkTextSpacing,
            type: SettingItemType.String,
            section: SECTION,
            public: true,
            isEnum: true,
            options: {
                all: _('All (also collapse line breaks, keeping labels on one line)'),
                spaces: _('Spaces only (preserve line breaks inside labels)'),
                preserve: _('Preserve (leave link text unchanged)'),
            },
            label: _('Link text spacing'),
            description: _(
                'Collapse excess internal whitespace and trim leading/trailing spaces inside link text, including reference links. All also turns line breaks (soft and hard) into a space; spaces only preserves line breaks and their surrounding whitespace while normalizing other whitespace on each line. Inline code inside link text and image alt text are never changed.'
            ),
        },
        // Deprecated: replaced by linkTextSpacing. Kept hidden so an existing
        // "off" choice can be migrated once, then reset.
        [LEGACY_NORMALIZE_LINK_TEXT_SPACING_KEY]: {
            value: true,
            type: SettingItemType.Bool,
            section: SECTION,
            public: false,
            label: 'Normalize link text spacing (deprecated)',
        },
        listSpacing: {
            value: DEFAULT_OPTIONS.listSpacing,
            type: SettingItemType.String,
            section: SECTION,
            public: true,
            isEnum: true,
            options: {
                semantic: _('Semantic (keep tight/loose as authored, fix mixed spacing)'),
                preserve: _('Preserve as written'),
                tight: _('Tight (no blank lines between items)'),
                loose: _('Loose (blank line between items)'),
            },
            label: _('List spacing'),
            description: _(
                'Semantic keeps each list tight or loose as authored and only makes mixed spacing consistent, so rendering never changes. This setting also controls spacing between blocks inside list items; the individual block-spacing settings only affect root-level blocks. Note: Tightening is skipped for a whole list when any item holds multi-block content (e.g. a second paragraph)'
            ),
        },
        indentation: {
            value: DEFAULT_OPTIONS.indentation,
            type: SettingItemType.String,
            section: SECTION,
            public: true,
            isEnum: true,
            options: { tabs: _('Tabs'), spaces2: _('2 spaces'), spaces4: _('4 spaces') },
            label: _('List indentation'),
            description: _(
                'Preferred indentation before nested list markers. It may be widened to preserve CommonMark nesting; for example, 2 spaces becomes 3 beneath `1.` and 4 beneath `10.`.'
            ),
        },
        tableStyle: {
            value: DEFAULT_OPTIONS.tableStyle,
            type: SettingItemType.String,
            section: SECTION,
            public: true,
            isEnum: true,
            options: {
                preserve: _('Preserve (leave tables unchanged)'),
                compact: _('Compact (one space of cell padding)'),
                aligned: _('Aligned (pad cells so pipes line up)'),
            },
            label: _('Table style'),
            description: _('How to lay out table cells and delimiter rows.'),
        },
        // Deprecated: replaced by tableStyle. Kept hidden so an existing
        // "align tables" choice can be migrated once, then reset.
        [LEGACY_ALIGN_TABLES_KEY]: {
            value: false,
            type: SettingItemType.Bool,
            section: SECTION,
            public: false,
            label: 'Align table columns (deprecated)',
        },
        ensureHeadingBlankLines: {
            value: DEFAULT_OPTIONS.ensureHeadingBlankLines,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Ensure blank lines around headings'),
            description: _('Add one blank line before and after root-level headings when neighboring content exists.'),
        },
        normalizeHeadingMarkerSpacing: {
            value: DEFAULT_OPTIONS.normalizeHeadingMarkerSpacing,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Normalize heading marker spacing'),
            description: _(
                'Use one space between ATX heading markers and heading text, including optional closing markers.'
            ),
        },
        removeHeadingIndentation: {
            value: DEFAULT_OPTIONS.removeHeadingIndentation,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Remove heading indentation'),
            description: _(
                'Move root-level ATX headings to the start of the line. Indented code and headings inside lists or blockquotes are unchanged.'
            ),
        },
        ensureParagraphBlankLines: {
            value: DEFAULT_OPTIONS.ensureParagraphBlankLines,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Ensure blank lines around paragraphs'),
            description: _(
                'Add one blank line before and after root-level paragraphs when neighboring content exists.'
            ),
        },
        ensureCodeBlockBlankLines: {
            value: DEFAULT_OPTIONS.ensureCodeBlockBlankLines,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Ensure blank lines around code blocks'),
            description: _(
                'Add one blank line before and after root-level code blocks when neighboring content exists.'
            ),
        },
        setDefaultCodeBlockLanguage: {
            value: DEFAULT_OPTIONS.setDefaultCodeBlockLanguage,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Set default language on unlabeled code blocks'),
            description: _(
                'Add the configured language to fenced code blocks that do not specify one. Indented code blocks are left unchanged.'
            ),
        },
        defaultCodeBlockLanguage: {
            value: DEFAULT_OPTIONS.defaultCodeBlockLanguage,
            type: SettingItemType.String,
            section: SECTION,
            public: true,
            label: _('Default code block language'),
            description: _(
                'Language identifier to add when the default code block language rule is enabled, for example text, javascript, or bash.'
            ),
        },
        ensureMathBlockBlankLines: {
            value: DEFAULT_OPTIONS.ensureMathBlockBlankLines,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Ensure blank lines around math blocks'),
            description: _(
                'Add one blank line before and after root-level math blocks when neighboring content exists.'
            ),
        },
        ensureTableBlankLines: {
            value: DEFAULT_OPTIONS.ensureTableBlankLines,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Ensure blank lines around tables'),
            description: _('Add one blank line before and after root-level tables when neighboring content exists.'),
        },
        ensureBlockquoteBlankLines: {
            value: DEFAULT_OPTIONS.ensureBlockquoteBlankLines,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Ensure blank lines around blockquotes'),
            description: _(
                'Add one blank line before and after root-level blockquotes when neighboring content exists.'
            ),
        },
        normalizeBlockquoteMarkerSpacing: {
            value: DEFAULT_OPTIONS.normalizeBlockquoteMarkerSpacing,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Normalize blockquote marker spacing'),
            description: _(
                'Use one space between blockquote `>` markers and quoted content, and between markers in nested quotes (`>>` becomes `> >`). Content requiring exact indentation (e.g. code inside the quote) and lists inside blockquotes are left unchanged.'
            ),
        },
        ensureListBlankLines: {
            value: DEFAULT_OPTIONS.ensureListBlankLines,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Ensure blank lines around lists'),
            description: _('Add one blank line before and after root-level lists when neighboring content exists.'),
        },
        ensureFrontmatterBlankLine: {
            value: DEFAULT_OPTIONS.ensureFrontmatterBlankLine,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Ensure blank line after front matter'),
            description: _('Add one blank line between YAML front matter and following content.'),
        },
        normalizeHeadingLevels: {
            value: DEFAULT_OPTIONS.normalizeHeadingLevels,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Normalize heading level increments'),
            description: _('Lower skipped heading levels so headings increase by at most one level at a time.'),
        },
        minimumHeadingLevel: {
            value: DEFAULT_OPTIONS.minimumHeadingLevel,
            type: SettingItemType.String,
            section: SECTION,
            public: true,
            isEnum: true,
            options: {
                none: _('None (no minimum heading level)'),
                h2: _('H2 (start the note at level 2)'),
                firstHeading: _('First heading (start at the first heading’s own level)'),
            },
            label: _('Minimum heading level'),
            description: _(
                'Shallowest heading level the note may use, applied by the heading level increment rule. H2 moves every heading by the same amount so the first one becomes level 2, keeping the note’s relative hierarchy. First heading keeps the first heading as written and raises any later heading that goes above it. Setext (underlined) headings are left as written.'
            ),
        },
        collapseBlankLines: {
            value: DEFAULT_OPTIONS.collapseBlankLines,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Collapse consecutive blank lines'),
            description: _('Reduce runs of blank lines to a single blank line (outside code blocks).'),
        },
        trimTrailingWhitespace: {
            value: DEFAULT_OPTIONS.trimTrailingWhitespace,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Trim trailing whitespace'),
            description: _(
                'Remove trailing spaces and tabs outside protected content, preserving two-space hard line breaks.'
            ),
        },
        removeLeadingBlankLines: {
            value: DEFAULT_OPTIONS.removeLeadingBlankLines,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Remove leading blank lines'),
            description: _('Start the note with its first content or front matter, without blank lines before it.'),
        },
        ensureFinalNewline: {
            value: DEFAULT_OPTIONS.ensureFinalNewline,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Ensure trailing newline'),
            description: _('End the note with exactly one newline.'),
        },
        [SHOW_DIFF_PREVIEW_KEY]: {
            value: false,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Preview changes before applying'),
            description: _('Show the formatting changes as a diff, with buttons to apply or cancel them.'),
        },
        [DISPLAY_TOAST_MESSAGES_KEY]: {
            value: true,
            type: SettingItemType.Bool,
            section: SECTION,
            public: true,
            label: _('Display toast messages'),
            description: _('Show a toast after formatting with the number of characters added and removed.'),
        },
    });

    await migrateLegacyAlignTables();
    await migrateLegacyLinkTextSpacing();
}

/** One-time migration: alignTables=true becomes tableStyle='aligned'. */
async function migrateLegacyAlignTables(): Promise<void> {
    if (await joplin.settings.value(LEGACY_ALIGN_TABLES_KEY)) {
        await joplin.settings.setValue('tableStyle', 'aligned');
        await joplin.settings.setValue(LEGACY_ALIGN_TABLES_KEY, false);
    }
}

/**
 * One-time migration: normalizeLinkTextSpacing=false becomes
 * linkTextSpacing='preserve'. The old setting was on by default, and its `true`
 * state matches the new default, so only an explicit opt-out needs carrying
 * over. The legacy key is reset to its default afterwards so this runs once.
 */
async function migrateLegacyLinkTextSpacing(): Promise<void> {
    if ((await joplin.settings.value(LEGACY_NORMALIZE_LINK_TEXT_SPACING_KEY)) === false) {
        await joplin.settings.setValue('linkTextSpacing', 'preserve');
        await joplin.settings.setValue(LEGACY_NORMALIZE_LINK_TEXT_SPACING_KEY, true);
    }
}

export async function loadFormatterOptions(): Promise<FormatterOptions> {
    const values = await joplin.settings.values(OPTION_KEYS);
    return { ...DEFAULT_OPTIONS, ...(values as Partial<FormatterOptions>) };
}

export async function loadDisplayToastMessages(): Promise<boolean> {
    return Boolean(await joplin.settings.value(DISPLAY_TOAST_MESSAGES_KEY));
}

export async function loadShowDiffPreview(): Promise<boolean> {
    return Boolean(await joplin.settings.value(SHOW_DIFF_PREVIEW_KEY));
}
