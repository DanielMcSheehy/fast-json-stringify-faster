'use strict'

const { Bench } = require('tinybench')
const build = require('..')

const QUOTED = 'hello "world" \\ path / ' + 'x'.repeat(40)

function fill (n, value) {
  const arr = new Array(n)
  for (let i = 0; i < n; i++) arr[i] = typeof value === 'function' ? value(i) : value
  return arr
}

const cases = [
  {
    name: 'integer',
    schema: { type: 'array', items: { type: 'integer' } },
    make: (n) => fill(n, (i) => i)
  },
  {
    name: 'number',
    schema: { type: 'array', items: { type: 'number' } },
    make: (n) => fill(n, (i) => i + 0.5)
  },
  {
    name: 'short-string',
    schema: { type: 'array', items: { type: 'string' } },
    make: (n) => fill(n, 'hello')
  },
  {
    name: 'quoted-string',
    schema: { type: 'array', items: { type: 'string' } },
    make: (n) => fill(n, QUOTED)
  },
  {
    name: 'flat-object',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'number' }
        }
      }
    },
    make: (n) => fill(n, () => ({ a: 'hello', b: 1 }))
  },
  {
    name: 'nested-object',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          a: {
            type: 'object',
            properties: {
              b: { type: 'string' }
            }
          }
        }
      }
    },
    make: (n) => fill(n, () => ({ a: { b: 'hello' } }))
  }
]

function benchOptions (n) {
  // iterations: 0 leaves only the time budget. A positive iterations value is a
  // minimum in sequential mode and would stretch multi-megabyte cases.
  if (n >= 1e6) return { time: 1500, iterations: 0, warmup: true, warmupTime: 200, warmupIterations: 0 }
  if (n >= 1e5) return { time: 800, iterations: 0, warmup: true, warmupTime: 150, warmupIterations: 0 }
  return { time: 250, warmupTime: 50, warmup: true, iterations: 0, warmupIterations: 0 }
}

async function measure (name, fn, n) {
  if (typeof globalThis.gc === 'function') globalThis.gc()
  const bench = new Bench({ name, ...benchOptions(n) })
  bench.add(name, () => {
    Buffer.byteLength(fn())
  })
  await bench.run()
  const task = bench.tasks[0]
  const hz = task.result.throughput.mean
  const rme = task.result.latency.rme
  const samples = task.result.latency.df + 1
  console.log(`${name} x ${hz.toLocaleString('en-US', { maximumFractionDigits: 0 })} ops/sec ±${rme.toFixed(2)}% (${samples} runs sampled)`)
}

async function main () {
  const sizes = [1e3, 2e4, 1e5, 1e6]
  for (const n of sizes) {
    for (const item of cases) {
      const stringify = build(item.schema)
      const input = item.make(n)
      await measure(`${item.name} n=${n}`, () => stringify(input), n)
    }
  }
}

main()
