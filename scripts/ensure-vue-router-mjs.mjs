import { copyFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'node_modules', 'vue-router', 'dist')
const source = join(distDir, 'vue-router.js')
const target = join(distDir, 'vue-router.mjs')

if (existsSync(source)) {
  copyFileSync(source, target)
}
