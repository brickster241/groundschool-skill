import { useRef, useState } from 'react'
import { Download, Upload, TriangleAlert } from 'lucide-react'
import { useCurriculum } from '../curriculum'
import { storeKey } from '../branches'
import { exportState, useChecks, useNotes, useProgress } from '../store'

export function SettingsPage() {
  const c = useCurriculum()
  const checks = useChecks()
  const notes = useNotes()
  const importState = useProgress((s) => s.importState)
  const resetBranch = useProgress((s) => s.resetBranch)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const download = () => {
    const blob = new Blob([exportState()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${storeKey}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Progress exported (all branches).')
  }

  const onImport = async (file: File) => {
    const text = await file.text()
    const ok = importState(text)
    setMsg(ok ? 'Progress imported.' : 'Import failed — not a valid progress file.')
  }

  const noteCount = Object.values(notes).filter((n) => n.trim()).length

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:py-12">
      <p className="placard">Local-first</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Your data</h1>
      <p className="mt-2 text-sm leading-relaxed text-dim">
        Everything lives in this browser&rsquo;s localStorage (
        <code className="font-mono text-hud">{storeKey}</code>), sliced per branch — nothing
        leaves your machine. Export a JSON snapshot (all branches) to back it up or move browsers.
      </p>
      <p className="mt-2 font-mono text-[10px] tracking-wider text-faint">
        BRANCH {c.branch.toUpperCase()} · BASELINE {c.meta.baseline.branch} @{' '}
        {c.meta.baseline.commit.slice(0, 7)} · {c.meta.baseline.date}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-panel px-4 py-3">
          <div className="font-mono text-2xl font-medium text-ink tabular-nums">
            {Object.keys(checks).length}
            <span className="text-sm text-faint">/{c.totalItems}</span>
          </div>
          <div className="placard mt-1">Items checked · {c.branch}</div>
        </div>
        <div className="rounded-xl border border-line bg-panel px-4 py-3">
          <div className="font-mono text-2xl font-medium text-ink tabular-nums">{noteCount}</div>
          <div className="placard mt-1">Notebooks · {c.branch}</div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={download}
          className="flex w-full items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3 text-left transition-colors hover:bg-panel2"
        >
          <Download className="h-4 w-4 text-amber" />
          <span>
            <span className="block text-sm text-ink">Export progress</span>
            <span className="block text-xs text-dim">Checks, notes, scores — every branch, one JSON file.</span>
          </span>
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3 text-left transition-colors hover:bg-panel2"
        >
          <Upload className="h-4 w-4 text-hud" />
          <span>
            <span className="block text-sm text-ink">Import progress</span>
            <span className="block text-xs text-dim">Replaces what&rsquo;s here with the file&rsquo;s contents.</span>
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onImport(f)
            e.target.value = ''
          }}
        />

        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-warn/30 bg-panel px-4 py-3 text-left transition-colors hover:bg-warn/5"
          >
            <TriangleAlert className="h-4 w-4 text-warn" />
            <span>
              <span className="block text-sm text-ink">Reset this branch</span>
              <span className="block text-xs text-dim">
                Clears checks and notes for {c.branch} only. Asks first.
              </span>
            </span>
          </button>
        ) : (
          <div className="rounded-xl border border-warn/50 bg-panel px-4 py-3">
            <p className="text-sm text-ink">
              Delete all progress and notes on <b>{c.branch}</b>? Export first if unsure.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  resetBranch()
                  setConfirmReset(false)
                  setMsg(`Branch ${c.branch} reset.`)
                }}
                className="rounded-md bg-warn/20 px-3 py-1.5 font-mono text-[11px] tracking-wider text-warn"
              >
                YES, RESET
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="rounded-md border border-line px-3 py-1.5 font-mono text-[11px] tracking-wider text-dim"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </div>

      {msg && <p className="mt-4 font-mono text-[11px] tracking-wider text-ok">{msg}</p>}
    </div>
  )
}
