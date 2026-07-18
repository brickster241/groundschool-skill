import type { BranchBundle } from '../data/types'
import { bundle as main } from './main'
import { bundle as sandbox } from './sandbox'

/**
 * The branch registry. One folder per branch under src/branches/, one entry
 * here. The switcher appears in the sidebar whenever more than one branch is
 * registered; content AND progress are kept per branch.
 *
 * Keys must match the git branch names they teach (slashes are fine).
 */
export const branchBundles: Record<string, BranchBundle> = {
  main,
  sandbox,
}

/** The branch shown on first load — normally the repo's primary branch. */
export const defaultBranch = 'main'

/** Repo-level localStorage key: "groundschool-<repo>-v2". Unique per repo. */
export const storeKey = 'groundschool-example-v2'
