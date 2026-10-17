'use strict'

/**
 * Compare FJS_LOOP_VARIANT shapes on integer / short-string / flat-object arrays
 * at sizes 1e3 / 2e4 / 1e5 / 1e6. Spawns a fresh process per variant so the env
 * switch is applied at codegen time.
 */

const { spawnSync } = require('child_process')
const path = require('path')
const fs = require('fs')
const os = require('os')

const VARIANTS = ['peel', 'if-i', 'sep', 'addComma']
const KINDS = ['integer', 'short-string', 'flat-object']
const SIZES = [1e3, 2e4, 1e5, 1e6]
const RUNS = Number(process.env.VARIANT_RUNS || 3)

const runner = path.join(__dirname, 'bench-large-array.js')
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fjs-loop-'))

function median (nums) {
  const a = [...nums].sort((x, y) => x - y)
  const mid = Math.floor(a.length / 2)
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2
}

function variance (nums) {
  if (nums.length < 2) return 0
  const m = nums.reduce((s, n) => s + n, 0) / nums.length
  return nums.reduce((s, n) => s + (n - m) ** 2, 0) / (nums.length - 1)
}

function runVariant (variant) {
  const outFile = path.join(outDir, `${variant}.json`)
  const env = {
    ...process.env,
    FJS_LOOP_VARIANT: variant,
    BENCH_JSON_OUT: outFile,
    BENCH_FORCE_HEAVY: '1'
  }
  // Restrict to targeted kinds via filter — run three kinds separately for clarity
  const all = []
  for (const kind of KINDS) {
    for (const size of SIZES) {
      const r = spawnSync(process.execPath, [runner], {
        env: { ...env, BENCH_KIND: kind, BENCH_SIZE: String(size) },
        encoding: 'utf8',
        maxBuffer: 20 * 1024 * 1024
      })
      if (r.status !== 0) {
        console.error(r.stdout)
        console.error(r.stderr)
        throw new Error(`bench failed for ${variant} ${kind}@${size}`)
      }
      process.stdout.write(r.stdout)
      const partial = JSON.parse(fs.readFileSync(outFile, 'utf8'))
      all.push(...partial)
    }
  }
  return all
}

function main () {
  const byKey = {} // key -> { variant -> [hz...] }

  for (let run = 0; run < RUNS; run++) {
    console.log(`\n=== run ${run + 1}/${RUNS} ===`)
    for (const variant of VARIANTS) {
      console.log(`-- variant ${variant}`)
      const results = runVariant(variant)
      for (const row of results) {
        const key = `${row.kind}@${row.size}`
        byKey[key] = byKey[key] || {}
        byKey[key][variant] = byKey[key][variant] || []
        byKey[key][variant].push(row.hz)
      }
    }
  }

  console.log('\n=== MEDIAN ops/sec ===')
  const summary = {}
  for (const key of Object.keys(byKey).sort()) {
    summary[key] = {}
    const parts = []
    for (const variant of VARIANTS) {
      const samples = byKey[key][variant] || []
      const med = median(samples)
      const v = variance(samples)
      summary[key][variant] = { median: med, variance: v, samples }
      parts.push(`${variant}=${med.toFixed(1)} (var=${v.toFixed(2)})`)
    }
    const peel = summary[key].peel.median
    const deltas = VARIANTS.filter(v => v !== 'peel').map(v => {
      const d = ((summary[key][v].median - peel) / peel) * 100
      return `${v}:${d >= 0 ? '+' : ''}${d.toFixed(2)}%`
    })
    console.log(`${key}: ${parts.join(' | ')} || vs peel: ${deltas.join(', ')}`)
  }

  const summaryPath = path.join(__dirname, '..', 'EXPERIMENTS', 'loop-variant-raw.json')
  fs.writeFileSync(summaryPath, JSON.stringify({ byKey, summary, runs: RUNS, node: process.version }, null, 2))
  console.log(`\nWrote ${summaryPath}`)
}

main()
