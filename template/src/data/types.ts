import type { ComponentType } from 'react'
import type { EditorId } from '../lib/editorLink'

export type ItemKind = 'read' | 'run' | 'build' | 'quiz' | 'watch' | 'write'

/** One checklist row. `id` is assigned by the curriculum assembler from position. */
export interface ChecklistItem {
  id: string
  kind: ItemKind
  text: string
  /** Optional expansion: the "why" or the exact command. Supports `code` spans. */
  detail?: string
}

/** Authoring shape — no id; assembler assigns `${trackId}.${lessonIdx}.${itemIdx}`. */
export type ItemDraft = Omit<ChecklistItem, 'id'>

export interface Resource {
  label: string
  url?: string
  kind: 'doc' | 'paper' | 'video' | 'code' | 'book'
  note?: string
  /**
   * Inline preview control. Omit to auto-detect from the URL (YouTube and PDFs
   * preview; everything else opens externally, because most sites refuse
   * framing and a blocked iframe is a blank box).
   *
   * Set `false` to suppress a preview we would otherwise offer, or `true` to
   * attempt one for a host not on the verified list. Note that `true` cannot
   * make a site allow framing — if it refuses, the panel is simply empty next
   * to the open-in-tab link, which is always present.
   */
  embed?: boolean
}

/** Optional inline YouTube embed for a lesson. Loads only when clicked. */
export interface LessonVideo {
  /** The 11-char YouTube video id (from youtube.com/watch?v=<id>). */
  youtubeId: string
  label: string
  /** Optional start time in seconds. */
  start?: number
}

export interface Lesson {
  id: string
  title: string
  /** One or more paragraphs, separated by \n\n. `code`, **bold**, *italic* allowed. */
  summary: string
  items: ChecklistItem[]
  resources?: Resource[]
  video?: LessonVideo
  /** Set by the UPDATE protocol only. Never delete learned content — deprecate it. */
  status?: 'deprecated'
  /** Why it was deprecated + date, e.g. "2026-08-01: replaced by the v2 pipeline (see T12 L4)". */
  statusNote?: string
}

export type LessonDraft = Omit<Lesson, 'id' | 'items'> & { items: ItemDraft[] }

export interface CodeAnchor {
  /** Path relative to the host repo root. */
  path: string
  note: string
  /** Optional line number for editor deep-links. */
  line?: number
}

/** One revision flashcard: a prompt on the front, a crisp answer on the back. */
export interface Flashcard {
  front: string
  back: string
}

/**
 * An architecture diagram embedded in a track. `svg` is raw markup
 * (author .svg files in the branch's diagrams/ folder, import with `?raw`) —
 * rendered inline so the app's fonts and palette apply.
 */
export interface DiagramSpec {
  title: string
  caption?: string
  svg: string
}

/**
 * ——— Articles: the long-form textbook layer ———
 *
 * A track can carry full chapters — derivations, display math, worked
 * examples, callouts, figures — authored as typed blocks so every article
 * shares the shell's typography. Math is KaTeX TeX source; the renderer
 * loads KaTeX lazily, so branches without articles pay nothing.
 */
export type ArticleBlock =
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  /** Paragraph. `code`, **bold**, *italic*, and inline math between $…$ . */
  | { kind: 'p'; text: string }
  /** Display equation. `label` renders as a right-margin equation tag, e.g. "(2.4)". */
  | { kind: 'math'; tex: string; label?: string }
  /**
   * Aside box. Tones: `note` = context, `trap` = misconception/pitfall,
   * `street` = practitioner lore the books skip, `canon` = the standard,
   * verified way (with its source).
   */
  | { kind: 'callout'; tone: 'note' | 'trap' | 'street' | 'canon'; title: string; text: string }
  /** Inline figure — same contract as DiagramSpec (raw SVG, sanitized + id-namespaced). */
  | { kind: 'figure'; title: string; svg: string; caption?: string }
  /**
   * Raster/photo figure. `src` is a path served by the app (put files in
   * `public/`), `credit` is REQUIRED — only public-domain or properly
   * licensed images belong in a curriculum, and the license rides with the
   * block so it survives every future copy.
   */
  | { kind: 'image'; src: string; alt: string; title?: string; caption?: string; credit: string }
  | { kind: 'code'; lang?: string; code: string; caption?: string }
  /** Cells support the same inline formatting as paragraphs (math included). */
  | { kind: 'table'; head: string[]; rows: string[][]; caption?: string }
  /** Numbered derivation / worked example. Steps may mix prose and display math. */
  | { kind: 'worked'; title: string; steps: { text?: string; tex?: string }[] }
  /** Embed one of the track's widgets inline at this point, by WidgetSpec id. */
  | { kind: 'widget'; id: string }

export interface Article {
  id: string
  title: string
  /** One-line dek under the title. */
  subtitle?: string
  blocks: ArticleBlock[]
}

/**
 * ——— Widgets: branch-owned interactive instruments ———
 *
 * The component is authored inside the branch folder (instance-owned code);
 * the shell only frames it (placard title, caption, error boundary). Widgets
 * referenced from an article's `widget` block render inline in the chapter;
 * the rest render in the track's Instruments section.
 */
export interface WidgetSpec {
  id: string
  title: string
  /** What to try and what to look for. Shown under the instrument. */
  caption?: string
  component: ComponentType
}

/** One Checkride question. Distractors should be real misconceptions, not filler. */
export interface QuizQuestion {
  prompt: string
  /** 2–4 options. Mono letters A–D are added by the UI. */
  options: string[]
  /** Index into options. */
  answer: number
  /** Shown after answering — teaches WHY, not just which. */
  explain: string
}

export interface Track {
  id: string // 't00'
  num: number
  slug: string
  title: string
  tagline: string
  phase: string
  hours: [number, number]
  difficulty: 1 | 2 | 3 | 4 | 5
  mentalModel: string
  why: string
  anchors: CodeAnchor[]
  lessons: Lesson[]
  deepDive: { title: string; body: string }
  proveIt: string[]
  dependsOn: string[]
  resources: Resource[]
  /** Attached at assemble time from the branch's quizzes map — do not author on drafts. */
  quiz?: QuizQuestion[]
  /** Attached at assemble time from the branch's flashcards map — do not author on drafts. */
  cards?: Flashcard[]
  /** Attached at assemble time from the branch's diagrams map — do not author on drafts. */
  diagrams?: DiagramSpec[]
  /** Attached at assemble time from the branch's articles map — do not author on drafts. */
  articles?: Article[]
  /** Attached at assemble time from the branch's widgets map — do not author on drafts. */
  widgets?: WidgetSpec[]
  /** Set by the UPDATE protocol only (see Lesson.status). */
  status?: 'deprecated'
  statusNote?: string
}

export type TrackDraft = Omit<
  Track,
  'lessons' | 'quiz' | 'cards' | 'diagrams' | 'articles' | 'widgets'
> & {
  lessons: LessonDraft[]
}

export interface Phase {
  id: string
  name: string
  blurb: string
  /** identifying hue for rings/headers */
  color: string
}

export interface GlossaryTerm {
  term: string
  def: string
  trackId?: string
}

export interface WeekPlan {
  week: number
  focus: string
  trackIds: string[]
  items: ChecklistItem[]
}
export type WeekPlanDraft = Omit<WeekPlan, 'items'> & { items: ItemDraft[] }

export interface PipelineStage {
  id: string
  label: string
  sub: string
  file: string
  trackSlug: string
}

/** Everything one branch's curriculum ships: the shape of `src/branches/<branch>/index.ts`. */
export interface BranchBundle {
  meta: Meta
  phases: Phase[]
  tracks: TrackDraft[]
  planner: WeekPlanDraft[]
  glossary: GlossaryTerm[]
  pipeline: PipelineStage[]
  quizzes: Record<string, QuizQuestion[]>
  flashcards: Record<string, Flashcard[]>
  diagrams: Record<string, DiagramSpec[]>
  /** Optional: long-form chapters per track. See Article. */
  articles?: Record<string, Article[]>
  /** Optional: interactive instruments per track. See WidgetSpec. */
  widgets?: Record<string, WidgetSpec[]>
}

/** Per-branch configuration. The ONLY place the app shell reads branding from. */
export interface Meta {
  /** Short subject name for the wordmark, e.g. "MYREPO". */
  repoName: string
  /** Browser tab / hero title, e.g. "MyRepo Ground School". */
  title: string
  /** Placard line above the hero H1. */
  eyebrow: string
  /** 1–2 sentence hero intro. `code` spans allowed. */
  intro: string
  /** Display path of the host repo, e.g. "~/Coding/myrepo". */
  repoPath: string
  /** Absolute path of the host repo — used for copy-path and editor deep-links. */
  repoPathAbs: string
  /** Small mono chips in the hero stats row, e.g. ["SIM VERIFIED 3/3"]. */
  statusChips: string[]
  /** Footer motto — three short clauses that capture the repo's philosophy. */
  motto: string
  /** Title of the dashboard schematic, e.g. "Mission pipeline — the one mental model". */
  systemMapTitle: string
  /** Flow annotation on the schematic, e.g. "intent ▼ telemetry ▲". */
  systemMapFlow: string
  /**
   * Editor for code-anchor deep-links; `null` renders copy-only anchors.
   * Anchors always offer the absolute path and a shell command too, because
   * protocol handlers can fail silently and the browser never tells us.
   */
  editor: EditorId | null
  /** Provenance: what the curriculum was authored against. UPDATE bumps this. */
  baseline: { branch: string; commit: string; date: string }
  /**
   * Optional visual identity for THIS repo's dashboard. The shell defaults to
   * the night-cockpit look, which belongs to flight-simulation subjects — a
   * parser or an HTTP stack should not be wearing it. Derive the theme from
   * the repo's own world (its artifacts, its era, its materials) and override
   * the `@theme` tokens; see references/design.md for worked palettes.
   */
  theme?: SiteTheme
}

/** Runtime overrides applied by useSiteTheme — instance-owned, shell-applied. */
export interface SiteTheme {
  /** Google Fonts (or any) stylesheet href injected at runtime. */
  fontsHref?: string
  /**
   * CSS custom properties to override, e.g. `{'--color-night': '#f6f5f1'}`.
   * The Tailwind v4 tokens in index.css are the vocabulary.
   */
  vars?: Record<string, string>
  /**
   * Diagrams are authored SVGs, usually light-on-dark; light themes keep
   * diagram surfaces dark unless this is explicitly false. Default true.
   */
  darkDiagrams?: boolean
}
