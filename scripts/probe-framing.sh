#!/usr/bin/env bash
#
# Re-measure which documentation hosts can be shown inside an iframe.
#
# `template/src/lib/resourceEmbed.ts` carries an allow-list of hosts that
# render in a frame. That list is a claim about the outside world, and the
# outside world changes — a site can add `X-Frame-Options` or a
# `frame-ancestors` CSP any day, and nothing tells you. So the list is
# checkable rather than trusted: run this, and fix the list if a row moved.
#
# Method matters here, and getting it wrong is easy:
#   * GET, not HEAD — some hosts answer HEAD without their security headers.
#   * Follow redirects — the header that blocks you is on the final response.
#     (MDN looks framable over a single un-redirected request and is not.)
#   * Send a browser User-Agent — header sets can differ for bare curl.
#
# Usage: scripts/probe-framing.sh [url ...]      (no args = the current list)

set -uo pipefail

UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"

DEFAULT_URLS=(
  # On the allow-list — these must stay FRAMEABLE.
  "https://www.rfc-editor.org/rfc/rfc9110.html"
  "https://git-scm.com/docs/git-cat-file"
  "https://en.wikipedia.org/wiki/Merkle_tree"
  "https://man7.org/linux/man-pages/man2/open.2.html"
  "https://docs.python.org/3/library/json.html"
  "https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html"
  "https://www.kernel.org/doc/html/latest/filesystems/index.html"
  # Special-cased in code — the rewrite exists because these two differ.
  "https://arxiv.org/pdf/1706.03762"
  "https://arxiv.org/abs/1706.03762"
  "https://www.youtube-nocookie.com/embed/jNQXAC9IVRw"
  # Deliberately NOT on the list. Kept here so the reason stays visible.
  "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429"
  "https://datatracker.ietf.org/doc/html/rfc9110"
  "https://pkg.go.dev/net/http"
  "https://go.dev/doc/effective_go"
)

probe() {
  local url="$1" headers xfo fa verdict
  headers=$(curl -sL -D- -o /dev/null --max-time 20 -A "$UA" "$url" 2>/dev/null)
  xfo=$(printf '%s' "$headers" | grep -io 'x-frame-options: *[a-z-]*' | tr -d '\r' | tail -1)
  fa=$(printf '%s' "$headers" | grep -io 'frame-ancestors [^;]*' | tr -d '\r' | tail -1)

  if [ -z "$headers" ]; then
    verdict="UNREACHABLE"
  elif [ -z "$xfo" ] && [ -z "$fa" ]; then
    verdict="FRAMEABLE"
  else
    verdict="BLOCKED"
  fi
  printf '%-12s %-56s %s %s\n' "$verdict" "${url#https://}" "$xfo" "$fa"
}

echo "Probed $(date -u '+%Y-%m-%d %H:%M UTC')"
echo
if [ "$#" -gt 0 ]; then
  for u in "$@"; do probe "$u"; done
else
  for u in "${DEFAULT_URLS[@]}"; do probe "$u"; done
fi
