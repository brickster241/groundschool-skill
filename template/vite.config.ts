import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// `.js` extension: tsconfig.node uses NodeNext resolution, where a
// relative TS import must name the emitted file.
import { openInEditor } from './vite-open-in-editor.js'

export default defineConfig({
  // Relative base: the built app must work from ANY mount point — file://,
  // a subpath like /groundschool-skill/ on GitHub Pages, or a repo's own
  // static host. HashRouter already makes routing base-agnostic; this makes
  // the assets match.
  base: './',
  // `openInEditor` serves POST /__open so code-anchor links open a file
  // directly, instead of relying on a `vscode://` handler the browser gates
  // behind a prompt it will not let localhost remember. See the plugin for
  // the trust boundary.
  plugins: [react(), tailwindcss(), openInEditor()],
})
