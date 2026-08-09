/**
 * Rewrite the `id`s inside an SVG so two copies can coexist on one page.
 *
 * This matters more than it sounds. Every diagram in a ground school is
 * injected at least twice — once inline in the panel, once in the lightbox —
 * and diagrams authored by hand reuse obvious names: `arrow`, `grad`, `clip`.
 * A `url(#arrow)` reference resolves to the FIRST element with that id in
 * document order, so the second diagram silently borrows the first one's
 * marker. The failure looks like a rendering bug (an arrowhead in the wrong
 * colour, a gradient that went flat), which is exactly the kind of thing a
 * learner blames on their own machine.
 *
 * Duplicate ids are also simply invalid HTML, and `getElementById` becomes a
 * coin flip for anything else on the page.
 *
 * Done with the DOM rather than a regex: id references hide in `fill`,
 * `stroke`, `filter`, `mask`, `clip-path`, all three `marker-*` properties, an
 * inline `style`, and both `href` spellings. Enumerating attributes finds them
 * all; a regex over the string finds the ones you thought of.
 */
export function namespaceSvgIds(svg: string, prefix: string): string {
  if (typeof DOMParser === 'undefined' || !svg.includes('id=')) return svg

  // Parsed as HTML, not `image/svg+xml`, to match the parser that will
  // actually consume the result — `dangerouslySetInnerHTML`. The XML parser
  // is stricter than the input deserves: a hand-authored diagram using
  // `xlink:href` without declaring `xmlns:xlink` is well-formed HTML and
  // malformed XML, and the XML path would silently return the string
  // un-namespaced, reintroducing exactly the collision this exists to stop.
  const doc = new DOMParser().parseFromString(svg, 'text/html')
  const root = doc.body.firstElementChild
  if (!root) return svg

  const rename = new Map<string, string>()
  // `querySelectorAll` searches descendants only; the `<svg>` element may
  // carry an id of its own.
  const withIds = [...(root.hasAttribute('id') ? [root] : []), ...root.querySelectorAll('[id]')]
  for (const el of withIds) {
    const old = el.getAttribute('id')
    if (!old) continue
    const next = `${prefix}-${old}`
    rename.set(old, next)
    el.setAttribute('id', next)
  }
  if (rename.size === 0) return svg

  // Escape for use inside a RegExp; ids may legally contain `.` and `-`.
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const walk = (el: Element) => {
    for (const attr of Array.from(el.attributes)) {
      let v = attr.value
      if (!v.includes('#')) continue
      for (const [old, next] of rename) {
        // `url(#old)` in any paint/filter attribute or inline style.
        v = v.replace(new RegExp(`url\\(\\s*['"]?#${esc(old)}['"]?\\s*\\)`, 'g'), `url(#${next})`)
        // A bare fragment reference: href / xlink:href on <use>, <textPath>, …
        if (v === `#${old}`) v = `#${next}`
      }
      if (v === attr.value) continue
      // Preserve the attribute's namespace — `xlink:href` is a real namespaced
      // attribute, and plain `setAttribute` would leave the original beside a
      // new one that merely looks the same.
      if (attr.namespaceURI) el.setAttributeNS(attr.namespaceURI, attr.name, v)
      else el.setAttribute(attr.name, v)
    }
    for (const child of Array.from(el.children)) walk(child)
  }
  walk(root)

  return root.outerHTML
}
