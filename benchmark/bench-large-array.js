'use strict'

/**
 * Large-array serialization benchmark (experiment contract).
 * Sizes: 1e3 / 2e4 / 1e5 / 1e6
 * Item kinds: integer, number, short string, long string, flat object, nested object
 *
 * Run: node --expose-gc benchmark/bench-large-array.js
 */

const { Bench } = require('tinybench')
const FJS = require('..')

const SIZES = [1e3, 2e4, 1e5, 1e6]
const LONG_STRING_LENGTH = 200

function getRandomInt (max) {
  return Math.floor(Math.random() * max)
}

function buildLongString () {
  let s = ''
  for (let i = 0; i < LONG_STRING_LENGTH; i++) {
    s += (i % 10)
    if (i % 50 === 0) s += '"'
  }
  return s
}

const longString = buildLongString()

function makeArray (size, kind) {
  const arr = new Array(size)
  for (let i = 0; i < size; i++) {
    switch (kind) {
      case 'integer':
        arr[i] = getRandomInt(1000)
        break
      case 'number':
        arr[i] = getRandomInt(1000) + 0.5
        break
      case 'short string':
        arr[i] = 'hello world'
        break
      case 'long string':
        arr[i] = longString
        break
      case 'flat object':
        arr[i] = { s: 'hello', n: i, b: true }
        break
      case 'nested object':
        arr[i] = { a: { b: { c: i } }, s: 'x' }
        break
      default:
        throw new Error(`unknown kind ${kind}`)
    }
  }
  return arr
}

const schemas = {
  integer: { type: 'array', items: { type: 'integer' } },
  number: { type: 'array', items: { type: 'number' } },
  'short string': { type: 'array', items: { type: 'string' } },
  'long string': { type: 'array', items: { type: 'string' } },
  'flat object': {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        s: { type: 'string' },
        n: { type: 'integer' },
        b: { type: 'boolean' }
      }
    }
  },
  'nested object': {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        a: {
          type: 'object',
          properties: {
            b: {
              type: 'object',
              properties: {
                c: { type: 'integer' }
              }
            }
          }
        },
        s: { type: 'string' }
      }
    }
  }
}

const kinds = Object.keys(schemas)

async function runOne (name, fn, { time = 300, warmupTime = 100 } = {}) {
  const bench = new Bench({
    time,
    warmupTime,
    setup: (_task, mode) => {
      if (mode === 'warmup' && typeof globalThis.gc === 'function') {
        globalThis.gc()
      }
    }
  })
  bench.add(name, fn)
  await bench.run()
  const task = bench.tasks[0]
  return {
    name,
    hz: task.result.throughput.mean,
    rme: task.result.latency.rme
  }
}

async function main () {
  // Skip 1e6 for nested/flat object by default if env SMALL=1; always run all when unset
  const skipHugeObjects = process.env.SKIP_HUGE_OBJECTS === '1'
  const results = []

  for (const size of SIZES) {
    for (const kind of kinds) {
      if (skipHugeObjects && size >= 1e6 && (kind === 'flat object' || kind === 'nested object' || kind === 'long string')) {
        console.log(`skip ${kind} n=${size}`)
        continue
      }
      const input = makeArray(size, kind)
      const stringify = FJS(schemas[kind])
      // sanity
      JSON.parse(stringify(input.slice(0, Math.min(size, 10))))

      const label = `${kind} n=${size}`
      process.stdout.write(`bench ${label}... `)
      const time = size >= 1e6 ? 500 : size >= 1e5 ? 400 : 300
      const r = await runOne(label, () => {
        Buffer.byteLength(stringify(input))
      }, { time })
      console.log(`${Math.round(r.hz).toLocaleString()} ops/sec ±${r.rme.toFixed(2)}%`)
      results.push(r)
    }
  }

  console.log('\n=== summary (ops/sec) ===')
  for (const r of results) {
    console.log(`${r.name}\t${Math.round(r.hz)}`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
