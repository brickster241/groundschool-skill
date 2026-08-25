import type { Article } from '../../data/types'

/**
 * The showcase chapter, attached to t04 (the authoring showcase track).
 * It documents the article layer by being one — every block kind appears
 * once. Real branches author real chapters; this one is the worked example.
 */
const authoringArticle: Article = {
  id: 'article-layer',
  title: 'The article layer',
  subtitle:
    'Long-form chapters as typed blocks: math, callouts, figures, worked derivations, and live instruments — inside the shell typography.',
  blocks: [
    {
      kind: 'p',
      text:
        'Checklists teach by **doing**; some subjects also need a place to *read* — a derivation you can follow line by line, a convention table you will return to, a caution that deserves a box. Articles are that place. Each one is data (`Article` in `types.ts`), so every chapter in every branch shares one typography, one math renderer, one figure pipeline.',
    },
    {
      kind: 'h2',
      text: 'Math that costs nothing until used',
    },
    {
      kind: 'p',
      text:
        'Inline math rides inside paragraphs between dollar signs — $e^{i\\pi} + 1 = 0$ — and display equations get their own block with an optional right-margin label:',
    },
    {
      kind: 'math',
      tex: '\\dot{\\mathbf{x}} = f(\\mathbf{x}, \\mathbf{u}, t) + \\mathbf{w}(t)',
      label: '(demo)',
    },
    {
      kind: 'p',
      text:
        'KaTeX loads lazily the first time an equation mounts. A branch with no articles — or a chapter with no math — never downloads it.',
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'blocks are append-only too',
      text:
        'Articles are curriculum content under the same law as lessons: readers link to heading anchors and quote equation labels, so **edit text in place, append new blocks at the end, deprecate rather than delete** whole articles.',
    },
    {
      kind: 'callout',
      tone: 'street',
      title: 'write the worked example first',
      text:
        'Chapters go abstract fast. Authoring the worked example *before* the prose forces every symbol to earn its place — if the example does not need it, the chapter probably does not either.',
    },
    {
      kind: 'h2',
      text: 'The block vocabulary',
    },
    {
      kind: 'table',
      head: ['Block', 'Use for'],
      rows: [
        ['`h2` / `h3`', 'Section structure; each gets a linkable anchor id.'],
        ['`p`', 'Prose with `code`, **bold**, *italics*, and inline $\\TeX$.'],
        ['`math`', 'Display equations, optionally labeled.'],
        ['`callout`', 'note · trap · street · canon asides.'],
        ['`figure`', 'Raw SVG, sanitized and id-namespaced like diagrams.'],
        ['`code` / `table`', 'Snippets and reference tables.'],
        ['`worked`', 'Numbered derivations mixing prose and display math.'],
        ['`widget`', 'A live instrument, embedded mid-chapter by id.'],
      ],
      caption: 'One vocabulary, shared by every chapter in every branch.',
    },
    {
      kind: 'worked',
      title: 'authoring a chapter',
      steps: [
        {
          text: 'Declare the article in the branch: `articles.ts` maps track ids to `Article[]`.',
        },
        {
          text: 'Write blocks in reading order. Inline math shares paragraph text: $\\sigma^2 = E[(x-\\mu)^2]$.',
        },
        {
          text: 'Display math gets its own block, so long equations scroll instead of wrapping:',
          tex: 'P_{k|k} = (I - K_k H_k)\\, P_{k|k-1}',
        },
      ],
    },
    {
      kind: 'h2',
      text: 'Instruments, inline',
    },
    {
      kind: 'p',
      text:
        'A `widget` block pulls one of the track’s instruments into the chapter exactly where the text needs it. Widgets not referenced by any article render in the track’s own **Instruments** section instead — authored hardware never silently disappears.',
    },
    { kind: 'widget', id: 'sine-scope' },
    {
      kind: 'code',
      lang: 'ts',
      code: "// branch/articles.ts\nexport const articles: Record<string, Article[]> = {\n  t04: [authoringArticle],\n}",
      caption: 'Registration is one map entry; the assembler attaches it to the track.',
    },
  ],
}

export const articles: Record<string, Article[]> = {
  t04: [authoringArticle],
}
