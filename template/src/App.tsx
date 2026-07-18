import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
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
  )
}
