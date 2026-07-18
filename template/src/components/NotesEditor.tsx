import { useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Eye, PenLine } from 'lucide-react'
import { useNotes, useProgress } from '../store'

marked.setOptions({ gfm: true, breaks: true })

export function NotesEditor({ noteKey, placeholder }: { noteKey: string; placeholder?: string }) {
  const value = useNotes()[noteKey] ?? ''
  const setNote = useProgress((s) => s.setNote)
  const [preview, setPreview] = useState(false)

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <span className="placard">Field notes</span>
        <button
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[11px] tracking-wider text-dim transition-colors hover:text-amber"
        >
          {preview ? <PenLine className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {preview ? 'EDIT' : 'PREVIEW'}
        </button>
      </div>
      {preview ? (
        <div
          className="notes-md min-h-32 px-4 py-3"
          dangerouslySetInnerHTML={{
            __html: value.trim()
              ? DOMPurify.sanitize(marked.parse(value) as string)
              : '<p style="color:#5b6675">Nothing here yet.</p>',
          }}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => setNote(noteKey, e.target.value)}
          placeholder={placeholder ?? 'Markdown supported. Notes save automatically, locally.'}
          spellCheck={false}
          className="block min-h-32 w-full resize-y bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed text-ink placeholder:text-faint focus:outline-none"
          rows={Math.max(6, value.split('\n').length + 1)}
        />
      )}
    </div>
  )
}
