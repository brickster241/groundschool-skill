# Ground School (template)

This directory is the **app template** bundled with the groundschool skill. It builds and runs
as-is with a one-track example curriculum so the shell can be verified independently — but its
purpose is to be instantiated: copied into `<target-repo>/groundschool/`, with `src/data/`
replaced by a real, repo-specific curriculum and `src/data/meta.ts` filled in.

When instantiating, this README is replaced by a repo-specific one (see the skill's SKILL.md).

```bash
npm install
npm run dev       # develop / study
npm run build     # static build in dist/ — fully offline except opted-in video embeds
```

Layout worth knowing:

- `src/data/meta.ts` — ALL repo-specific branding/config (name, paths, storage key, editor
  deep-link scheme, curriculum baseline commit). The shell reads nothing else.
- `src/data/tracks/*.ts` — one file per track. Checklist IDs derive from position:
  **append, never reorder or delete** (saved progress is keyed on them). Deprecate instead.
- `src/data/{pipeline,planner,glossary}.ts` — the system map, optional study plan (empty array
  hides the page), and vocabulary.
- `src/components/`, `src/pages/` — the generic shell. Instantiations normally do not edit it.
