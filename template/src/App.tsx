import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { TracksIndex } from './pages/TracksIndex'
import { TrackPage } from './pages/TrackPage'
import { PlannerPage } from './pages/PlannerPage'
import { RevisionPage } from './pages/RevisionPage'
import { GlossaryPage } from './pages/GlossaryPage'
import { NotesPage } from './pages/NotesPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    /*
     * `reducedMotion="user"` honours the OS setting. It is not decoration:
     * this app flips cards in 3D and springs panels in on every route change,
     * and for a reader with vestibular sensitivity that is a reason to close
     * the tab. Motion One animates with inline styles from rAF, so the usual
     * `@media (prefers-reduced-motion)` CSS override cannot reach it — the
     * library has to be told.
     */
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tracks" element={<TracksIndex />} />
            <Route path="/track/:slug" element={<TrackPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/revision" element={<RevisionPage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </MotionConfig>
  )
}
