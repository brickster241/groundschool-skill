import React from 'react'

/** Render `code` spans and **bold** inside a data string. */
export function inline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  // split on `code` first, then handle **bold** in the plain parts
  const codeParts = text.split(/(`[^`]+`)/g)
  codeParts.forEach((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      out.push(<code key={`c${i}`}>{part.slice(1, -1)}</code>)
    } else {
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g)
      boldParts.forEach((bp, j) => {
        if (bp.startsWith('**') && bp.endsWith('**') && bp.length > 4) {
          out.push(<strong key={`b${i}.${j}`}>{bp.slice(2, -2)}</strong>)
        } else if (bp) {
          const italicParts = bp.split(/(\*[^*]+\*)/g)
          italicParts.forEach((ip, k) => {
            if (ip.startsWith('*') && ip.endsWith('*') && ip.length > 2) {
              out.push(<em key={`i${i}.${j}.${k}`}>{ip.slice(1, -1)}</em>)
            } else if (ip) {
              out.push(<React.Fragment key={`t${i}.${j}.${k}`}>{ip}</React.Fragment>)
            }
          })
        }
      })
    }
  })
  return out
}

/** Multi-paragraph data string -> <p> blocks with inline formatting. */
export function Copy({ text, className }: { text: string; className?: string }) {
  return (
    <div className={`copy ${className ?? ''}`}>
      {text.split('\n\n').map((p, i) => (
        <p key={i}>{inline(p)}</p>
      ))}
    </div>
  )
}
