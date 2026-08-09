import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Search, Radar, ListChecks, CalendarRange, BookA, Layers, NotebookPen, Settings2, GitBranch,
} from 'lucide-react'
import { branchNames, useCurriculum } from '../curriculum'
import { fractionDone, useChecks, useProgress } from '../store'
import { CommandPalette } from './CommandPalette'
import { useSiteTheme } from '../lib/siteTheme'

/**
 * Branch chips.
 *
 * `layoutId` must be unique per mounted instance: the sidebar is only hidden
 * with CSS on small screens, so the mobile and desktop switchers are BOTH in
 * the tree at all times. Two elements sharing one `layoutId` make the shared
 * pill animate between a visible and a `display:none` box.
 */
function BranchChips({ pillId }: { pillId: string }) {
  const branch = useProgress((s) => s.branch)
  const setBranch = useProgress((s) => s.setBranch)

  return (
    <div className="flex flex-wrap gap-1">
      {branchNames.map((b) => (
        <button
          key={b}
          onClick={() => setBranch(b)}
          aria-pressed={b === branch}
          className={`relative rounded-md px-2 py-1 font-mono text-[11px] transition-colors ${
            b === branch ? 'text-night' : 'text-dim hover:text-ink'
          }`}
        >
          {b === branch && (
            <motion.span
              layoutId={pillId}
              className="absolute inset-0 rounded-md bg-amber"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative">{b}</span>
        </button>
      ))}
    </div>
  )
}

/** Sidebar branch switcher — appears only when more than one branch is registered. */
function BranchSwitcher() {
  if (branchNames.length < 2) return null

  return (
    <div className="border-b border-line px-4 py-3">
      <div className="placard mb-2 flex items-center gap-1.5">
        <GitBranch className="h-3 w-3" /> Branch
      </div>
      <BranchChips pillId="branch-pill-desktop" />
    </div>
  )
}

export function Layout() {
  const c = useCurriculum()
  useSiteTheme(c.meta)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const checks = useChecks()
  const { pathname, hash } = useLocation()

  const nav = [
    { to: '/', label: 'Flight Deck', icon: Radar, end: true },
    { to: '/tracks', label: 'Tracks', icon: ListChecks, end: false },
    ...(c.weeks.length > 0
      ? [{ to: '/planner', label: 'Study Plan', icon: CalendarRange, end: false }]
      : []),
    { to: '/revision', label: 'Revision', icon: Layers, end: false },
    { to: '/glossary', label: 'Glossary', icon: BookA, end: false },
    { to: '/notes', label: 'Notes', icon: NotebookPen, end: false },
    { to: '/settings', label: 'Data', icon: Settings2, end: false },
  ]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // scroll to top on route change (respect in-page hash anchors)
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 })
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-panel/60 backdrop-blur md:flex">
        <NavLink to="/" className="flex items-center gap-2.5 border-b border-line px-4 py-4">
          <img src="./roundel.svg" alt="" className="h-7 w-7" />
          <span className="min-w-0">
            <span className="block font-display text-sm leading-tight font-bold tracking-wide text-ink">
              GROUND SCHOOL
            </span>
            <span className="block font-mono text-[9px] tracking-[0.22em] text-faint uppercase">
              {c.meta.repoName} · FUNDAMENTALS
            </span>
          </span>
        </NavLink>

        <BranchSwitcher />

        <nav className="px-2 py-3">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors ${
                  isActive ? 'bg-panel2 text-amber' : 'text-dim hover:bg-panel2 hover:text-ink'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          <button
            onClick={() => setPaletteOpen(true)}
            className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-dim transition-colors hover:bg-panel2 hover:text-ink"
          >
            <Search className="h-4 w-4" />
            Search
            <kbd className="ml-auto rounded border border-line px-1.5 font-mono text-[10px] text-faint">⌘K</kbd>
          </button>
        </nav>

        <div className="mt-2 flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          {c.phases.map((phase) => {
            const pts = c.tracks.filter((t) => t.phase === phase.id)
            return (
              <div key={phase.id}>
                <div className="placard mb-1.5" style={{ color: phase.color }}>
                  {phase.name}
                </div>
                <ul className="space-y-0.5">
                  {pts.map((t) => {
                    const frac = fractionDone(c.trackItemIds.get(t.id) ?? [], checks)
                    return (
                      <li key={t.id}>
                        <NavLink
                          to={`/track/${t.slug}`}
                          className={({ isActive }) =>
                            `group flex items-center gap-2 rounded px-1.5 py-1 text-xs transition-colors ${
                              isActive ? 'text-ink' : 'text-dim hover:text-ink'
                            }`
                          }
                        >
                          <span className="font-mono text-[9px] text-faint">
                            T{String(t.num).padStart(2, '0')}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{t.title}</span>
                          <span
                            className="h-1 w-6 shrink-0 overflow-hidden rounded-full bg-line"
                            aria-hidden
                          >
                            <span
                              className="block h-full rounded-full transition-all"
                              style={{ width: `${frac * 100}%`, background: phase.color }}
                            />
                          </span>
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {/*
          Mobile top bar.

          Two rows, because one row cannot hold it. The sidebar is the only
          place search and the branch switcher used to live, and it is
          `md:` only — so on a phone a multi-branch ground school had no way
          to change branch and no way to search at all.

          The nav scrolls horizontally rather than shrinking: seven icons
          squeezed into 375px gives ~32px targets, under the 44px that a
          thumb actually hits.
        */}
        <div className="sticky top-0 z-40 border-b border-line bg-night/90 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 pt-3">
            <NavLink to="/" className="flex min-w-0 items-center gap-2">
              <img src="./roundel.svg" alt="" className="h-6 w-6 shrink-0" />
              <span className="truncate font-display text-sm font-bold text-ink">
                GROUND SCHOOL
              </span>
            </NavLink>
            <div className="flex shrink-0 items-center gap-2">
              {branchNames.length > 1 && <BranchChips pillId="branch-pill-mobile" />}
              <button
                onClick={() => setPaletteOpen(true)}
                aria-label="Search"
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-md text-dim"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
          <nav
            aria-label="Sections"
            className="flex gap-1 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {nav.map(({ to, icon: Icon, end, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex h-11 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[12px] whitespace-nowrap ${
                    isActive ? 'text-amber' : 'text-dim'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <Outlet />
      </main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
