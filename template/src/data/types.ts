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
   * Set `false` to suppress a preview we would otherwise offer. Setting `true`
   * cannot force an arbitrary host to allow framing — it is a hint, not a lever.
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
  /** Set by the UPDATE protocol only (see Lesson.status). */
  status?: 'deprecated'
  statusNote?: string
}

export type TrackDraft = Omit<Track, 'lessons' | 'quiz' | 'cards' | 'diagrams'> & {
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
}

/** Per-branch configuration. The ONLY place the app shell reads branding from. */
export interface Meta {
  /** Short subject name for the wordmark, e.g. "AMOS". */
  repoName: string
  /** Browser tab / hero title, e.g. "AMOS Ground School". */
  title: string
  /** Placard line above the hero H1. */
  eyebrow: string
  /** 1–2 sentence hero intro. `code` spans allowed. */
  intro: string
  /** Display path of the host repo, e.g. "~/Coding/amos". */
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
}
