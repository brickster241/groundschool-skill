# UPDATE — syncing a curriculum with a moved repo

Runs **only when the user asks** ("update the ground school", "sync it with the new commits").
Never propose it merely because commits exist; never run it as a side effect of other work.

The invariant that rules everything here: **the learner's progress and notes are sacred.**
Progress is keyed on positional IDs and lives in their browser — you cannot see it, so you
must assume every item is mid-flight. Hence the append-only law: existing lessons/items are
never deleted, reordered, or renumbered. Content leaves the curriculum by deprecation, not
deletion.

## Protocol

### 1. Read the baseline

Baselines are **per branch**: `src/branches/<branch>/meta.ts` → `baseline: { branch, commit,
date }`. An update targets ONE branch's curriculum — the one the user is talking about
(default: the active/checked-out branch). Other branch folders are off-limits during the run.
If the user instead wants a NEW branch covered, that is a scoped GENERATE (new folder +
registry entry), not an update.

### 2. Diff and map

```bash
git -C <repo> log --oneline <baseline>..HEAD          # what happened, in the authors' words
git -C <repo> diff --stat <baseline>..HEAD            # where it happened
```

Build the impact map: intersect changed paths against every track's `anchors[].path` AND
grep the data files for path mentions in prose (`rtk grep -o 'src/[a-zA-Z0-9_/.-]*' src/data/tracks` or similar).
Also scan the log for *new* subsystems (added directories, new top-level modules) that no
track covers.

### 3. Classify each affected track

| Class | Meaning | Action |
|---|---|---|
| **UNAFFECTED** | no anchor/prose overlap | nothing |
| **DRIFTED** | anchored files changed but the concepts hold | reread the changed files; correct any prose that is now false (editing text in place is fine — only structure is append-only); update `line:` numbers |
| **BROKEN** | an anchor path no longer exists | find the successor path and update the anchor; if the subject itself was removed, deprecate the lesson(s): `status: 'deprecated'`, `statusNote: '<date>: <what happened, where the replacement lives>'` |
| **NEW TERRITORY** | commits introduce something no track teaches | append lessons to the owning track, or append a new track (next free number, end of its phase) with full curriculum.md quality — a stub track is worse than none |

Deprecation cascades up: a track goes `status: 'deprecated'` only when its whole subject left
the system. Deprecated ≠ hidden — the UI banners it and everything stays checkable, because
the user may be mid-lesson and stale-but-flagged beats vanished.

### 4. Verify anchors wholesale

Every anchor in the data (not just touched ones) gets an existence check — cheap insurance:

```bash
cd <repo> && for p in $(list of anchor paths); do [ -e "$p" ] || echo "MISSING $p"; done
```

### 5. Re-stamp and record

- The branch's `meta.baseline` → branch @ `git rev-parse --short HEAD`, today's date.
- Quizzes and flashcards may be freely evolved during an update (they live in central files
  keyed by trackId, carry no positional IDs, and best-scores survive question changes) —
  but keep them true to the concept-weighted bar in curriculum.md.
- `CHANGELOG.md` (inside `groundschool/`): dated entry — commits covered, tracks touched and
  how (drifted/deprecated/appended), anything the user should re-study because it changed.
- Update `docs/curriculum-plan.md` if the track table changed.

### 6. Verify and commit

`npm run build`, load it, eyeball a touched track (banner renders? new lessons appear? counts
moved?). Commit inside `groundschool/` with a message naming the new baseline. Tell the user
what changed in study terms ("T07's validate stage grew a new finding type — one appended
lesson; T09 L2 deprecated, replacement in T09 L5"), not diff terms.

## Red flags

- Deleting or reordering anything in `tracks/*.ts` — the one unforgivable move.
- Renumbering tracks to "keep them tidy".
- A deprecation without a dated, explanatory `statusNote`.
- Appending a lesson that is a changelog entry rather than teaching ("X was refactored" is
  not a lesson; "how X works now, and why it moved" is).
- Bumping `meta.baseline` without actually reading the diff it claims to cover.
