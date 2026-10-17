'use strict'

const { Bench } = require('tinybench')
const fjs = require('..')

const SIZES = [1e3, 2e4, 1e5, 1e6]
const RUNS = Number(process.env.BENCH_RUNS || 3)

function getRandomInt (max) {
  return Math.floor(Math.random() * max)
}

function makeLongString () {
  let s = ''
  for (let i = 0; i < 200; i++) {
    s += i
    if (i % 40 === 0) s += '"'
  }
  return s
}

const longString = makeLongString()

const itemKinds = [
  {
    name: 'integer',
    schema: { type: 'array', items: { type: 'integer' } },
    make: (n) => Array.from({ length: n }, () => getRandomInt(1000))
  },
  {
    name: 'number',
    schema: { type: 'array', items: { type: 'number' } },
    make: (n) => Array.from({ length: n }, () => getRandomInt(1000) + 0.5)
  },
  {
    name: 'short string',
    schema: { type: 'array', items: { type: 'string' } },
    make: (n) => Array.from({ length: n }, () => 'hello world')
  },
  {
    name: 'long string',
    schema: { type: 'array', items: { type: 'string' } },
    make: (n) => Array.from({ length: n }, () => longString)
  },
  {
    name: 'flat object',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          s: { type: 'string' },
          n: { type: 'number' },
          b: { type: 'boolean' }
        }
      }
    },
    make: (n) => Array.from({ length: n }, () => ({ s: 'hello world', n: 42, b: true }))
  },
  {
    name: 'flat object required',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        required: ['s', 'n', 'b'],
        properties: {
          s: { type: 'string' },
          n: { type: 'number' },
          b: { type: 'boolean' }
        }
      }
    },
    make: (n) => Array.from({ length: n }, () => ({ s: 'hello world', n: 42, b: true }))
  },
  {
    name: 'nested object',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: {
            type: 'object',
            properties: {
              c: { type: 'number' },
              d: { type: 'boolean' }
            }
          }
        }
      }
    },
    make: (n) => Array.from({ length: n }, () => ({ a: 'x', b: { c: 1, d: false } }))
  }
]

function median (values) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function variance (values, med) {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const v = values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1)
  return { stdev: Math.sqrt(v), pctOfMedian: med === 0 ? 0 : (Math.sqrt(v) / med) * 100 }
}

async function runOne (name, stringify, input) {
  const bench = new Bench({
    name,
    setup: (_task, mode) => {
      if (mode === 'warmup' && typeof globalThis.gc === 'function') {
        globalThis.gc()
      }
    }
  })
  bench.add(name, () => {
    Buffer.byteLength(stringify(input))
  })
  await bench.run()
  return bench.tasks[0].result.throughput.mean
}

async function main () {
  const filter = process.env.BENCH_FILTER || ''
  const results = []

  for (const kind of itemKinds) {
    if (filter && !kind.name.includes(filter)) continue
    const stringify = fjs(kind.schema)

    for (const size of SIZES) {
      // Skip 1e6 long-string unless explicitly requested — very heavy.
      if (size === 1e6 && kind.name === 'long string' && !process.env.BENCH_HEAVY) {
        continue
      }
      const input = kind.make(size)
      const samples = []
      for (let i = 0; i < RUNS; i++) {
        samples.push(await runOne(`${kind.name} n=${size}`, stringify, input))
      }
      const med = median(samples)
      const { stdev, pctOfMedian } = variance(samples, med)
      const row = {
        kind: kind.name,
        size,
        medianOpsSec: Math.round(med),
        samples: samples.map(s => Math.round(s)),
        stdev: Math.round(stdev),
        stdevPct: Number(pctOfMedian.toFixed(2))
      }
      results.push(row)
      console.log(
        `${kind.name.padEnd(22)} n=${String(size).padStart(7)}  ` +
        `median ${row.medianOpsSec.toLocaleString()} ops/sec  ` +
        `samples=[${row.samples.join(',')}]  σ=${row.stdevPct}%`
      )
    }
  }

  if (process.env.BENCH_JSON) {
    console.log(JSON.stringify(results, null, 2))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
