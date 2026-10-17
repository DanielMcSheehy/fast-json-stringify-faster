'use strict'

/**
 * Focused median ops/sec for report tables (3 trials).
 * Contract sizes: 1e3 / 2e4 / 1e5 / 1e6 (1e6 skipped for heavy object/string kinds).
 */

const build = require('..')

const SIZES = [1e3, 2e4, 1e5, 1e6]
const TRIALS = 3

function getRandomInt (max) {
  return Math.floor(Math.random() * max)
}

const longString = (() => {
  let s = ''
  for (let i = 0; i < 200; i++) {
    s += i
    if (i % 50 === 0) s += '"'
  }
  return s
})()

const kinds = [
  { name: 'integer', schemaItems: { type: 'integer' }, make: () => getRandomInt(1000) },
  { name: 'number', schemaItems: { type: 'number' }, make: () => getRandomInt(1000) + 0.5 },
  { name: 'short string', schemaItems: { type: 'string' }, make: () => 'hello world' },
  { name: 'long string', schemaItems: { type: 'string' }, make: () => longString },
  {
    name: 'flat object',
    schemaItems: {
      type: 'object',
      properties: { s: { type: 'string' }, n: { type: 'number' }, b: { type: 'boolean' } }
    },
    make: () => ({ s: 'hello world', n: 42, b: true })
  },
  {
    name: 'nested object',
    schemaItems: {
      type: 'object',
      properties: {
        a: { type: 'object', properties: { b: { type: 'object', properties: { c: { type: 'integer' } } } } },
        n: { type: 'number' }
      }
    },
    make: (i) => ({ a: { b: { c: i } }, n: 42 })
  }
]

function makeArray (size, kind) {
  const arr = new Array(size)
  for (let i = 0; i < size; i++) arr[i] = kind.make(i)
  return arr
}

function median (xs) {
  const s = xs.slice().sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

function variancePct (xs, med) {
  if (!med) return 0
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length
  const v = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length
  return (Math.sqrt(v) / med) * 100
}

function itersFor (size) {
  if (size <= 1e3) return 80
  if (size <= 2e4) return 20
  if (size <= 1e5) return 6
  return 2
}

function measure (fn, iters) {
  for (let i = 0; i < Math.min(3, iters); i++) fn()
  const t0 = process.hrtime.bigint()
  for (let i = 0; i < iters; i++) fn()
  const t1 = process.hrtime.bigint()
  return iters / (Number(t1 - t0) / 1e9)
}

const rows = []

for (const kind of kinds) {
  const schema = { type: 'array', items: kind.schemaItems }
  const def = build(schema, { largeArrayMechanism: 'default' })
  const js = build(schema, { largeArrayMechanism: 'json-stringify', largeArraySize: 1 })

  for (const size of SIZES) {
    if (size >= 1e6 && kind.name !== 'integer' && kind.name !== 'number') {
      rows.push({ kind: kind.name, size, skipped: true })
      continue
    }
    const input = makeArray(size, kind)
    const iters = itersFor(size)
    const defSamples = []
    const jsSamples = []
    const nativeSamples = []
    for (let t = 0; t < TRIALS; t++) {
      defSamples.push(measure(() => { def(input) }, iters))
      jsSamples.push(measure(() => { js(input) }, iters))
      nativeSamples.push(measure(() => { JSON.stringify(input) }, iters))
    }
    const row = {
      kind: kind.name,
      size,
      default: { median: median(defSamples), varPct: variancePct(defSamples, median(defSamples)) },
      jsonStringify: { median: median(jsSamples), varPct: variancePct(jsSamples, median(jsSamples)) },
      native: { median: median(nativeSamples), varPct: variancePct(nativeSamples, median(nativeSamples)) }
    }
    rows.push(row)
    console.log(
      `${kind.name}\tn=${size}\tdef=${row.default.median.toFixed(1)}(±${row.default.varPct.toFixed(1)}%)\t` +
      `js=${row.jsonStringify.median.toFixed(1)}(±${row.jsonStringify.varPct.toFixed(1)}%)\t` +
      `native=${row.native.median.toFixed(1)}(±${row.native.varPct.toFixed(1)}%)`
    )
  }
}

console.log('\nJSON_ROWS')
console.log(JSON.stringify({ node: process.version, rows }, null, 2))
