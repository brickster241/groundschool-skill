# Ground School (template)

The **app template** bundled with the groundschool skill. It builds and runs as-is with a
two-branch example curriculum (`main` + `sandbox`) so the whole shell — including the branch
switcher — can be verified independently. Its purpose is to be instantiated: copied into
`<target-repo>/groundschool/`, example branches replaced by real ones.

```bash
npm install
npm run dev       # binds --host: reachable from other devices on your LAN
npm run build     # static build in dist/ — offline except opted-in video embeds
```

## Layout

- `src/branches/<branch>/` — one folder per git branch: `meta.ts` (branding/config/baseline),
  `tracks/*.ts`, `pipeline.ts`, `glossary.ts`, `planner.ts` (empty array hides the page),
  `quizzes.ts` (Checkrides, optional per track), `flashcards.ts` (revision decks), and an
  `index.ts` exporting the `BranchBundle` (with the phase list).
- `src/branches/index.ts` — the registry: branch map, `defaultBranch`, and the repo-level
  `storeKey`. More than one entry → the sidebar branch switcher appears; progress, notes,
  and scores are kept per branch under the one storage key.
- `src/curriculum.ts` — assembles every bundle at load; `useCurriculum()` is the single data
  hook all views consume. Checklist IDs derive from position (`t03.1.2`): **append, never
  reorder or delete** — deprecate instead. Quizzes/flashcards are keyed by trackId and may
  evolve freely.
- `src/components/`, `src/pages/` — the shared shell. Instantiations normally do not edit it.
  Animation policy: motion for structure, anime.js for numeric flourishes (`CountUp`).
