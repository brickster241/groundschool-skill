# groundschool

A Claude Code skill that reads a repository and writes you a course about it — a local-first
learning dashboard that lives at `<repo>/groundschool/` and remembers where you got to.

**[▶ Live demo](https://brickster241.github.io/groundschool-skill/)** — the skill run on its
own repository. No install, no account.

![The flight deck of the template's own ground school](docs/img/dashboard.png)

## Install & cook

```bash
git clone https://github.com/brickster241/groundschool-skill.git
ln -s "$PWD/groundschool-skill" ~/.claude/skills/groundschool
```

Then, in Claude Code, inside any repo:

```
build a ground school for this repo
```

Later, after the repo has moved on:

```
update the ground school
```

That's it. (Skills are directories, not packages — the symlink *is* the install. The
generated app needs Node `^20.19` or `>=22.12`.)

## What you get

- **Tracks → lessons → typed checklists** (`READ` `RUN` `BUILD` `QUIZ` `WRITE` `WATCH`),
  each with a mental model and a *why this repo does it this way* argument.
- **Code anchors that actually open your editor** — through the dev server, not a flaky
  `vscode://` link. macOS / Linux / Windows.
- **Checkrides** (per-track exams, best score persists), **flash decks**, a glossary,
  architecture **diagrams**, an optional study plan.
- **Progress that survives** — stored in your browser, per branch, forever. Updates are
  append-only: content is deprecated with a dated note, never deleted out from under you.
- Resources open in a new tab; hosts *measured* to allow framing get an inline preview chip.
  Nothing loads until you click.

<details>
<summary><b>More screenshots</b> — checklists, revision decks, mobile</summary>
<br>

![Lessons render as typed, checkable challenge/response items](docs/img/checklists.png)

<table><tr>
<td width="50%"><img src="docs/img/revision.png" alt="Flash decks per track and for the glossary"></td>
<td width="50%"><img src="docs/img/track.png" alt="A track page: mental model, why-this-design, code anchors"></td>
</tr></table>

<img src="docs/img/mobile.png" width="300" alt="The same track page on a phone — the dev server binds --host, so it's readable from anything on your network">

</details>

## vs the official `learn` skill

Honest positioning: this is a **superset of `learn`'s artifacts across exactly one subject —
a repository — and a subset of its method.**

| | `learn` | groundschool |
|---|---|---|
| Subject | anything | one codebase |
| Shape | a conversation | an app on disk |
| Adapts to you | yes, continuously | no — a fixed curriculum |
| Anchored to real files | no | every track, verified |
| Still there in three weeks | no | yes, with your progress |

Use `learn` when you have a question. Use groundschool when you have a repository and a month.

## The one rule

`src/branches/**` belongs to your repo. Everything else under `src/` belongs to the skill and
is overwritten on the next update — shell fixes go to the template, where they reach everyone.

## Digging deeper

- [docs/ENGINEERING.md](docs/ENGINEERING.md) — the browser behaviors that had to be measured,
  not assumed (why embeds are allow-listed, why editor links go through the server, Windows
  quoting), plus platforms and roadmap.
- [SKILL.md](SKILL.md) — the full GENERATE / UPDATE protocol and quality bar.
- `template/` builds standalone: `cd template && npm install && npm run build`.

MIT — see [LICENSE](LICENSE).
