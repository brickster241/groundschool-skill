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
  /** Set by the UPDATE protocol only (see Lesson.status). */
  status?: 'deprecated'
  statusNote?: string
}

export type TrackDraft = Omit<Track, 'lessons'> & { lessons: LessonDraft[] }

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

/** Per-repo configuration. The ONLY file the app shell reads branding from. */
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
  /** localStorage key. MUST be unique per dashboard: "groundschool-<repo>-v1". */
  storageKey: string
  /** Small mono chips in the hero stats row, e.g. ["SIM VERIFIED 3/3"]. */
  statusChips: string[]
  /** Footer motto — three short clauses that capture the repo's philosophy. */
  motto: string
  /** Title of the dashboard schematic, e.g. "Mission pipeline — the one mental model". */
  systemMapTitle: string
  /** Flow annotation on the schematic, e.g. "intent ▼ telemetry ▲". */
  systemMapFlow: string
  /** Editor for code-anchor deep-links; null renders copy-only anchors. */
  editor: 'vscode' | 'cursor' | 'zed' | null
  /** Provenance: what the curriculum was authored against. UPDATE bumps this. */
  baseline: { branch: string; commit: string; date: string }
}
