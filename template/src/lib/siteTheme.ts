import { useEffect } from 'react'
import type { Meta } from '../data/types'

/**
 * Per-instance theming: the shell is shared, the identity is not.
 *
 * A ground school for a flight simulator has every right to look like a
 * cockpit; a ground school for a JSON parser does not. The curriculum's
 * `meta.theme` (instance-owned, like everything in `src/branches/`) overrides
 * the Tailwind v4 `@theme` custom properties at runtime — palettes and font
 * stacks both — so each repo's dashboard carries that repo's own visual
 * language without forking the shell.
 *
 * Diagrams are the one exception: they are authored SVGs with baked-in
 * colors, usually light strokes for a dark panel. A light theme would render
 * them invisible, so themed instances keep diagram surfaces dark unless the
 * theme says otherwise.
 */
export function useSiteTheme(meta: Meta) {
  useEffect(() => {
    const t = meta.theme
    if (!t) return
    const root = document.documentElement

    for (const [k, v] of Object.entries(t.vars ?? {})) {
      root.style.setProperty(k, v)
    }

    let link: HTMLLinkElement | null = null
    if (t.fontsHref && !document.querySelector(`link[href="${t.fontsHref}"]`)) {
      link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = t.fontsHref
      document.head.appendChild(link)
    }

    let style: HTMLStyleElement | null = null
    if (t.darkDiagrams !== false) {
      style = document.createElement('style')
      style.textContent =
        '.diagram-svg{background:#0b0e14;border-radius:10px}'
      document.head.appendChild(style)
    }

    return () => {
      for (const k of Object.keys(t.vars ?? {})) root.style.removeProperty(k)
      link?.remove()
      style?.remove()
    }
  }, [meta])
}
