// Self-heal for the "Into the Valley" analysis divider (flagship + catalyst articles).
// The upstream AI is inconsistent: some articles name the divider, some mark the
// closing-analysis break with a bare "---" rule, and some omit it entirely. Normalize
// all three to the named divider so the renderers' image-swap always fires — no more
// literal "---" or articles whose last paragraph runs on without the divider.
// Works on HTML bodies and markdown (condensed_content) alike.
export function ensureValley(content: string): string {
    const c = content || '';
    if (!c.trim() || /into the valley|valley view|vv-header/i.test(c)) return c;
    const isHtml = /^\s*<(p|div|h\d)[ >]/i.test(c);
    if (isHtml) {
        // Convert the LAST standalone <p>---</p> / <hr> rule into the named divider…
        const rules = [...c.matchAll(/<p[^>]*>\s*-{3,}\s*<\/p>|<hr\s*\/?>/gi)];
        if (rules.length) {
            const last = rules[rules.length - 1];
            return c.slice(0, last.index) + '<h2>Into the Valley</h2>' + c.slice((last.index as number) + last[0].length);
        }
        // …or insert before the final paragraph (the closing analysis/takeaway).
        const idx = c.lastIndexOf('<p');
        return idx > 0 ? c.slice(0, idx) + '<h2>Into the Valley</h2>\n' + c.slice(idx) : c;
    }
    // Markdown: turn the LAST standalone "---" rule into the named divider…
    const hrRe = /(^|\n)([ \t]*-{3,}[ \t]*)(?=\n|$)/g;
    let last: RegExpExecArray | null = null;
    let m: RegExpExecArray | null;
    while ((m = hrRe.exec(c)) !== null) last = m;
    if (last) {
        const s = last.index + last[1].length;
        return c.slice(0, s) + '## Into the Valley' + c.slice(s + last[2].length);
    }
    // …or, with no rule at all, insert before the final paragraph block.
    const parts = c.split(/\n\n+/);
    if (parts.length > 1) {
        parts.splice(parts.length - 1, 0, '## Into the Valley');
        return parts.join('\n\n');
    }
    return c;
}
