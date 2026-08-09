import { useEffect } from 'react'

/**
 * Body scroll lock that survives two dialogs being open at once.
 *
 * The naive version — each dialog saving `document.body.style.overflow` on
 * open and writing it back on close — corrupts itself the moment locks
 * overlap, and they do overlap here: ⌘K is a global listener, so the command
 * palette opens happily on top of a diagram lightbox. The second dialog then
 * saves `'hidden'` as the "previous" value, and whichever closes last restores
 * it, leaving the page unscrollable with no dialog on screen. The only way out
 * is a reload, and nothing on screen explains why.
 *
 * A module-level count fixes it: the first lock records the real previous
 * value, the last release puts it back, and everything in between is a no-op.
 */
let depth = 0
let saved = ''

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    if (depth === 0) {
      saved = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    depth += 1
    return () => {
      depth -= 1
      if (depth === 0) document.body.style.overflow = saved
    }
  }, [active])
}
