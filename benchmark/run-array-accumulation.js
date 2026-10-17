'use strict'

const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const { variants } = require('./array-accumulation-variants')
const directory = path.resolve(process.argv[2] || 'EXPERIMENTS/array-string-accumulation-data')
fs.mkdirSync(directory, { recursive: true })
const suites = (process.env.FJS_SUITES || 'large,compile').split(',')
const selected = (process.env.FJS_VARIANTS || variants.join(',')).split(',')
for (let run = 1; run <= 3; run++) {
  // Rotate order across repetitions to reduce fixed thermal/order bias.
  const ordered = [...selected.slice(run - 1), ...selected.slice(0, run - 1)]
  for (const variant of ordered) {
    for (const suite of suites) {
      const target = path.join(directory, `${suite}-${variant}-${run}.txt`)
      if (fs.existsSync(target + '.done')) continue
      const fd = fs.openSync(target, 'w')
      const script = { large: 'bench-large-array.js', compile: 'bench-compile.js', full: 'bench.js' }[suite]
      if (!script) throw new Error(`Unknown suite ${suite}`)
      console.log(`${new Date().toISOString()} run=${run} variant=${variant} suite=${suite}`)
      const result = spawnSync(process.execPath, [
        '--expose-gc', '--allow-natives-syntax',
        '-r', path.join(__dirname, 'array-accumulation-variants.js'),
        path.join(__dirname, script)
      ], { env: { ...process.env, FJS_ARRAY_VARIANT: variant }, stdio: ['ignore', fd, 'inherit'] })
      fs.closeSync(fd)
      if (result.status !== 0) throw new Error(`${variant}/${suite}: ${result.error || result.signal || result.status}`)
      fs.writeFileSync(target + '.done', 'complete\n')
    }
  }
}
