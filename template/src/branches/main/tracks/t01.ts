import type { TrackDraft } from '../../../data/types'

export const t01: TrackDraft = {
  id: 't01',
  num: 1,
  slug: 'embeds-measured-not-hoped',
  title: 'Embeds: measured, not hoped',
  tagline: 'Why resources open in a new tab by default, and what earns a host an inline preview.',
  phase: 'shell',
  hours: [1, 2],
  difficulty: 2,
  dependsOn: ['t00'],
  mentalModel:
    'A resource row\'s label is always an external link — a new tab is the default because that is what a reader wants most of the time, and because it always works. The inline preview is an opt-in chip, and it appears only when `embedTarget` says the source will actually render in a frame: YouTube through its embed host, PDFs, arXiv after a URL rewrite, and a short allow-list of documentation hosts.\n\nThe allow-list exists because the obvious design — *try* the iframe and fall back on failure — is impossible. A frame refused by `X-Frame-Options` fires `load` exactly like a successful one, fires no `error`, and throws on `contentDocument` for every cross-origin frame whether it rendered or not. **The browser will not tell you.** So the decision is made before render, from data gathered outside the browser.',
  why:
    'Nothing loads until asked — opening a track page contacts no third party, fetches no thumbnails. That is a privacy stance and a performance one, but mostly an honesty one: a blank rectangle where a preview should be is worse than a link, because the learner cannot tell "loading" from "blocked" from "broken". Every entry on the allow-list was measured with a probe script, not remembered — and the first run of that probe evicted two hosts the list carried from memory.',
  anchors: [
    { path: 'template/src/lib/resourceEmbed.ts', note: 'The whole decision: YouTube shapes, the arXiv rewrite, the allow-list, and why there is no try-and-fallback.' },
    { path: 'scripts/probe-framing.sh', note: 'Re-measures the allow-list against live hosts. GET not HEAD, redirects followed, browser UA — each of those matters.' },
    { path: 'template/src/components/ResourceRow.tsx', note: 'Label = external link, always. The preview chip is the opt-in.' },
  ],
  lessons: [
    {
      title: 'The undetectable failure',
      summary: 'Prove to yourself that a blocked iframe is invisible to JavaScript, then read the design that accepts it.',
      items: [
        { kind: 'run', text: 'Point an iframe at a site that sends X-Frame-Options: DENY and log its load event', detail: 'It fires. Check contentDocument — it throws, exactly as it does for a frame that rendered fine. There is no signal.' },
        { kind: 'read', text: 'Read the header comment in resourceEmbed.ts', detail: 'It is the argument for the allow-list, written where the next maintainer will trip over it.' },
        { kind: 'quiz', text: 'Why is the arXiv rewrite from /abs/ to /pdf/ mandatory rather than cosmetic?', detail: '/abs/ sends frame-ancestors \'none\' AND X-Frame-Options: SAMEORIGIN; /pdf/ sends neither and is served inline. Same paper, opposite answers.' },
      ],
    },
    {
      title: 'Keeping the list honest',
      summary: 'The allow-list is a claim about the outside world, so it ships with the tool that checks it.',
      items: [
        { kind: 'run', text: 'Run scripts/probe-framing.sh and compare its verdicts to FRAMEABLE_HOSTS', detail: 'Every list entry should read FRAMEABLE. If one moved, fix the list — that is the entire maintenance protocol.' },
        { kind: 'quiz', text: 'Why does the probe use GET with redirects rather than HEAD?', detail: 'Some hosts omit security headers on HEAD, and the header that blocks you is on the final response after redirects. HEAD-without-redirects reports a framable MDN, which is false.' },
        { kind: 'write', text: 'Add one doc host you actually cite, measured first', detail: 'Probe it, then add it. The commit message should quote the probe output — measured beats remembered.' },
      ],
    },
  ],
  deepDive: {
    title: 'The probe\'s three method traps',
    body:
      'HEAD responses may omit security headers, so the probe GETs. The blocking header rides the final response, so it follows redirects. And some hosts vary headers by client, so it sends a browser User-Agent. Each shortcut produces a confidently wrong FRAMEABLE — the worst possible output for a script whose whole job is to be believed.',
  },
  proveIt: [
    'Force an embed for a blocked host with `embed: true` on a resource and describe exactly what renders. Now you know what every learner would see if the list rotted.',
    'Break the YouTube id parser with a /live/ URL before reading how it handles one.',
  ],
  resources: [
    { label: 'X-Frame-Options', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options', kind: 'doc', note: 'MDN itself refuses framing — which is why this row has no preview chip.' },
    { label: 'CSP frame-ancestors', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors', kind: 'doc' },
  ],
}
