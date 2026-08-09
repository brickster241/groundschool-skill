/**
 * Copy text, and actually say whether it worked.
 *
 * `navigator.clipboard` requires a **secure context**. The dev server runs
 * `vite --host`, so reading the dashboard from a phone means an origin like
 * `http://192.168.1.20:5173` — not secure, and the API is simply absent there.
 * `localhost` is exempt and works; the LAN IP is not.
 *
 * That is exactly the device people read prep material on, so a copy button
 * that silently no-ops there is worse than useless — it reports success
 * (a green tick) while the clipboard still holds whatever was in it before.
 * Hence the legacy fallback, and a boolean the caller must respect.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Permission denied or a non-secure context that still exposes the object.
    // Fall through rather than reporting a success that did not happen.
  }

  // Deprecated, but it is the only path that works off a non-secure origin.
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    // Keep it off-screen without `display:none`, which would make it unselectable.
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;'
    document.body.appendChild(ta)
    ta.select()
    ta.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

/**
 * True when this origin can reach a local editor and the clipboard API.
 *
 * A `vscode://` URL is resolved by the **client** device, so opening the
 * dashboard from a phone or another machine would try to launch an editor
 * *there*. Worth telling the reader rather than letting them click into
 * silence.
 */
export function isLocalOrigin(): boolean {
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === ''
}
