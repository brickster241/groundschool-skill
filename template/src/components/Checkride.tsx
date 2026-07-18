import { useState } from 'react'
import { motion } from 'motion/react'
import { Award, Check, GraduationCap, RotateCcw, X } from 'lucide-react'
import type { QuizQuestion } from '../data/types'
import { useProgress, useQuizBest } from '../store'
import { inline } from './text'

const LETTERS = ['A', 'B', 'C', 'D']

/**
 * The Checkride: a per-track multiple-choice exam with immediate feedback,
 * explanations, and a persisted best score. "Checkride" is the aviation term
 * for the practical exam after ground school — pass it and you fly.
 */
export function Checkride({ trackId, questions }: { trackId: string; questions: QuizQuestion[] }) {
  const best = useQuizBest()[trackId]
  const recordQuiz = useProgress((s) => s.recordQuiz)

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[idx]
  const answered = selected !== null

  const pick = (i: number) => {
    if (answered) return
    setSelected(i)
    if (i === q.answer) setCorrect((c) => c + 1)
  }

  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setSelected(null)
    } else {
      const finalScore = correct
      recordQuiz(trackId, finalScore)
      setDone(true)
    }
  }

  const retake = () => {
    setIdx(0)
    setSelected(null)
    setCorrect(0)
    setDone(false)
  }

  return (
    <section className="overflow-hidden rounded-xl border border-hud/25 bg-panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="placard flex items-center gap-2 text-hud">
          <GraduationCap className="h-3.5 w-3.5" /> Checkride — {questions.length} questions
        </h2>
        <span className="font-mono text-[10px] tracking-wider text-faint">
          {best !== undefined ? `BEST ${best}/${questions.length}` : 'NOT YET FLOWN'}
        </span>
      </div>

      {/* keyed enter-only transitions — no exit choreography to stall on */}
      {done ? (
          <motion.div
            key="score"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 px-4 py-8 text-center"
          >
            <Award className={`h-7 w-7 ${correct === questions.length ? 'text-amber' : 'text-hud'}`} />
            <div className="font-display text-3xl font-bold text-ink">
              {correct}/{questions.length}
            </div>
            <p className="max-w-sm text-sm text-dim">
              {correct === questions.length
                ? 'Clean checkride. This track is yours.'
                : 'Every miss above has its explanation — reread, then fly it again.'}
            </p>
            <button
              onClick={retake}
              className="mt-1 flex items-center gap-2 rounded-md border border-line px-3 py-1.5 font-mono text-[11px] tracking-wider text-dim transition-colors hover:border-hud/50 hover:text-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" /> RETAKE
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22 }}
            className="px-4 py-4"
          >
            <div className="flex items-baseline gap-3">
              <span className="shrink-0 font-mono text-[11px] text-faint">
                {String(idx + 1).padStart(2, '0')}/{String(questions.length).padStart(2, '0')}
              </span>
              <p className="text-[14px] leading-relaxed text-ink">{inline(q.prompt)}</p>
            </div>

            <div className="mt-3 space-y-1.5">
              {q.options.map((opt, i) => {
                const isAnswer = i === q.answer
                const isPicked = i === selected
                let cls = 'border-line hover:border-hud/40 hover:bg-panel2'
                if (answered) {
                  if (isAnswer) cls = 'border-ok/60 bg-ok/5'
                  else if (isPicked) cls = 'border-warn/60 bg-warn/5'
                  else cls = 'border-line opacity-50'
                }
                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    disabled={answered}
                    className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${cls}`}
                  >
                    <span className="mt-0.5 font-mono text-[11px] text-faint">{LETTERS[i]}</span>
                    <span className="flex-1 text-[13px] leading-snug text-ink">{inline(opt)}</span>
                    {answered && isAnswer && <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />}
                    {answered && isPicked && !isAnswer && (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
                    )}
                  </button>
                )
              })}
            </div>

            {answered && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-lg border-l-2 border-hud/60 bg-panel2 px-3 py-2"
              >
                <p className="text-[13px] leading-relaxed text-dim">{inline(q.explain)}</p>
                <button
                  onClick={next}
                  className="mt-2 rounded-md border border-hud/40 px-3 py-1.5 font-mono text-[11px] tracking-wider text-hud transition-colors hover:bg-hud/10"
                >
                  {idx + 1 < questions.length ? 'NEXT' : 'SEE SCORE'}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
    </section>
  )
}
