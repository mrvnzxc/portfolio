import { copyFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')

const distCandidates = [
  join(rootDir, 'node_modules', 'vue-router', 'dist'),
  join(rootDir, 'node_modules', 'nuxt', 'node_modules', 'vue-router', 'dist'),
]

for (const distDir of distCandidates) {
  const source = join(distDir, 'vue-router.js')
  const target = join(distDir, 'vue-router.mjs')

  if (existsSync(source)) {
    copyFileSync(source, target)
    break
  }
}
