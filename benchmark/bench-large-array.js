'use strict'

/**
 * Large-array serialization microbenchmark (experiment contract harness).
 * Sizes: 1e3 / 2e4 / 1e5 / 1e6
 * Item kinds: integer, number, short string, long string, flat object, nested object
 */

const { Bench } = require('tinybench')
const fjs = require('..')

const SIZES = [1e3, 2e4, 1e5, 1e6]
const LONG_STRING_LENGTH = 200

function makeLongString () {
  let s = ''
  for (let i = 0; i < LONG_STRING_LENGTH; i++) {
    s += (i % 10)
    if (i % 50 === 0) s += '"'
  }
  return s
}

const longString = makeLongString()

const kinds = [
  {
    name: 'integer',
    schema: { type: 'array', items: { type: 'integer' } },
    fill: (n) => {
      const a = new Array(n)
      for (let i = 0; i < n; i++) a[i] = i
      return a
    }
  },
  {
    name: 'number',
    schema: { type: 'array', items: { type: 'number' } },
    fill: (n) => {
      const a = new Array(n)
      for (let i = 0; i < n; i++) a[i] = i + 0.5
      return a
    }
  },
  {
    name: 'short-string',
    schema: { type: 'array', items: { type: 'string' } },
    fill: (n) => {
      const a = new Array(n)
      for (let i = 0; i < n; i++) a[i] = 'hello world'
      return a
    }
  },
  {
    name: 'long-string',
    schema: { type: 'array', items: { type: 'string' } },
    fill: (n) => {
      const a = new Array(n)
      for (let i = 0; i < n; i++) a[i] = longString
      return a
    }
  },
  {
    name: 'flat-object',
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
    fill: (n) => {
      const a = new Array(n)
      for (let i = 0; i < n; i++) a[i] = { s: 'hello', n: i, b: true }
      return a
    }
  },
  {
    name: 'nested-object',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          nested: {
            type: 'object',
            properties: {
              x: { type: 'number' },
              y: { type: 'string' }
            }
          }
        }
      }
    },
    fill: (n) => {
      const a = new Array(n)
      for (let i = 0; i < n; i++) a[i] = { id: i, nested: { x: i + 0.1, y: 'y' } }
      return a
    }
  }
]

async function runOne (label, stringify, input) {
  const bench = new Bench({
    name: label,
    time: 500,
    setup: (_task, mode) => {
      if (mode === 'warmup' && typeof globalThis.gc === 'function') {
        globalThis.gc()
      }
    }
  })
  bench.add(label, () => {
    Buffer.byteLength(stringify(input))
  })
  await bench.run()
  const task = bench.tasks[0]
  const hz = task.result.throughput.mean
  const rme = task.result.latency.rme
  return { hz, rme, samples: task.result.latency.df + 1 }
}

async function main () {
  const filterKind = process.env.BENCH_KIND || null
  const filterSize = process.env.BENCH_SIZE ? Number(process.env.BENCH_SIZE) : null
  const results = []

  for (const kind of kinds) {
    if (filterKind && kind.name !== filterKind) continue
    const stringify = fjs(kind.schema, { largeArrayMechanism: 'default' })
    for (const size of SIZES) {
      if (filterSize && size !== filterSize) continue
      // Skip 1e6 nested/long-string by default unless forced — very slow / memory heavy
      if (size === 1e6 && (kind.name === 'long-string' || kind.name === 'nested-object') &&
          process.env.BENCH_FORCE_HEAVY !== '1') {
        console.log(`${kind.name}@${size} skipped (set BENCH_FORCE_HEAVY=1 to run)`)
        continue
      }
      const input = kind.fill(size)
      // Correctness smoke
      const out = stringify(input)
      const expected = JSON.stringify(input)
      if (out !== expected) {
        throw new Error(`Semantic mismatch for ${kind.name}@${size}`)
      }
      const label = `${kind.name}@${size}`
      const { hz, rme, samples } = await runOne(label, stringify, input)
      const formattedHz = hz.toLocaleString('en-US', { maximumFractionDigits: 0 })
      console.log(`${label} x ${formattedHz} ops/sec ±${rme.toFixed(2)}% (${samples} runs sampled)`)
      results.push({ kind: kind.name, size, hz, rme, samples })
    }
  }

  if (process.env.BENCH_JSON_OUT) {
    const fs = require('fs')
    fs.writeFileSync(process.env.BENCH_JSON_OUT, JSON.stringify(results, null, 2))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
