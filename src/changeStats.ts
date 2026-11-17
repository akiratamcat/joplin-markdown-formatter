import { DIFF_DELETE, DIFF_INSERT, diffCleanupEfficiency, diffMain } from 'diff-match-patch-es';

import { _ } from './i18n';

export interface CharacterChangeStats {
    added: number;
    removed: number;
}

/** Counts inserted and deleted UTF-16 code units between two text snapshots. */
export function computeCharacterChangeStats(oldText: string, newText: string): CharacterChangeStats {
    const diffs = diffMain(oldText, newText);
    diffCleanupEfficiency(diffs);

    let added = 0;
    let removed = 0;
    for (const [op, text] of diffs) {
        if (op === DIFF_INSERT) {
            added += text.length;
        } else if (op === DIFF_DELETE) {
            removed += text.length;
        }
    }

    return { added, removed };
}

/** Plural-free wording, so every language needs a single translation. */
export function formatCharacterChangeStats(stats: CharacterChangeStats): string {
    return _('Characters added: {added}, removed: {removed}', { added: stats.added, removed: stats.removed });
}
