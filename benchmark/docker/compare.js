'use strict'
// Summarizes benchmark/docker results: median-of-rounds ops/sec per case, base vs head, with CV.
// Usage: node benchmark/docker/compare.js [results-dir]
const fs = require('node:fs')
const path = require('node:path')

const dir = path.resolve(process.argv[2] || path.join(__dirname, 'results'))
const files = fs.readdirSync(dir)

function median (xs) {
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
function cv (xs) {
  if (xs.length < 2) return 0
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (xs.length - 1))
  return sd / mean
}
function pct (a, b) { return ((b / a - 1) * 100).toFixed(1).padStart(6) + '%' }

function collect (suite, side) {
  const rounds = files.filter(f => f.startsWith(`${suite}-${side}-`) && f.endsWith('.json'))
  const byKey = new Map()
  for (const f of rounds) {
    const { rows } = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
    for (const r of rows) {
      if (r.ops === undefined) continue
      const key = suite === 'large' ? `${r.kind} / ${r.size} / ${r.mechanism}` : r.name
      if (!byKey.has(key)) byKey.set(key, [])
      byKey.get(key).push(r.ops)
    }
  }
  return byKey
}

function collectFull (side) {
  const rounds = files.filter(f => f.startsWith(`full-${side}-`) && f.endsWith('.txt'))
  const byKey = new Map()
  for (const f of rounds) {
    for (const line of fs.readFileSync(path.join(dir, f), 'utf8').split('\n')) {
      const m = /^(.+?)\.{2,} x ([\d,]+) ops\/sec/.exec(line)
      if (!m) continue
      const key = m[1].trim()
      if (!byKey.has(key)) byKey.set(key, [])
      byKey.get(key).push(Number(m[2].replace(/,/g, '')))
    }
  }
  return byKey
}

function table (title, base, head) {
  if (base.size === 0) return
  console.log(`\n## ${title}\n`)
  console.log('| Case | base ops/s | head ops/s | Change | CV base / head |')
  console.log('| --- | ---: | ---: | ---: | ---: |')
  for (const [key, b] of base) {
    const h = head.get(key)
    if (!h) continue
    const mb = median(b); const mh = median(h)
    console.log(`| ${key} | ${mb.toFixed(2)} | ${mh.toFixed(2)} | ${pct(mb, mh)} | ${(cv(b) * 100).toFixed(1)}% / ${(cv(h) * 100).toFixed(1)}% |`)
  }
}

const refs = files.includes('refs.txt') ? fs.readFileSync(path.join(dir, 'refs.txt'), 'utf8').trim() : ''
console.log(`# Container benchmark comparison\n\n${refs}\nrounds: large=${files.filter(f => /^large-base-\d+\.json$/.test(f)).length} compile=${files.filter(f => /^compile-base-\d+\.json$/.test(f)).length} full=${files.filter(f => /^full-base-\d+\.txt$/.test(f)).length}`)
table('Large arrays', collect('large', 'base'), collect('large', 'head'))
table('Compilation', collect('compile', 'base'), collect('compile', 'head'))
table('Full benchmark/bench.js', collectFull('base'), collectFull('head'))
