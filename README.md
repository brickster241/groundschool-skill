# groundschool-skill

A Claude Code skill that turns any repository into a **ground school**: a deeply-researched,
track-based curriculum about the fundamentals underneath the code, rendered as a local-first
interactive dashboard (checklists, code anchors that open your editor, notes, glossary,
optional study plan, persistent progress) living at `<repo>/groundschool/`, gitignored from
the host repo.

Born from the AMOS ground school (`~/Coding/amos-groundschool`) — this skill is that
workflow, generalized: analysis protocol, authoring quality bar, a verified app template,
and an incremental UPDATE protocol that respects the learner's saved progress (append-only,
deprecate-never-delete).

## Install

Personal skills are directories under `~/.claude/skills/`. Symlink this repo:

```bash
ln -s "$(pwd)" ~/.claude/skills/groundschool
```

Claude Code then triggers it on requests like "build a ground school for this repo" or
"update the ground school", or explicitly via `/groundschool`.

## Layout

| Path | Purpose |
|---|---|
| `SKILL.md` | Entry point: modes (GENERATE / UPDATE), stages, gates, quality bar |
| `references/analysis.md` | Repo analysis → curriculum plan (branch gate, source priority, the spine) |
| `references/curriculum.md` | Authoring spec: voice, per-field quality bar, the append-only ID law |
| `references/design.md` | The night-cockpit design system; what is fixed vs per-repo |
| `references/update.md` | Incremental sync: diff → classify → deprecate/append → re-baseline |
| `template/` | The app (Vite + React + TS + Tailwind v4 + motion + zustand) — builds standalone with example data |

## The template, verified

```bash
cd template && npm install && npm run build   # must always pass
```

The example curriculum inside it demonstrates every authoring feature: inline formatting,
all six checklist kinds, quiz answers on expand, click-to-load YouTube embeds, editor
deep-links (`vscode://` / `cursor://` / `zed://`, with line numbers), deprecation banners,
the animated system map, and the optional study plan.
