'use strict'

/**
 * Measure crossover size where JSON.stringify beats fjs default for each item kind.
 * Prints ops/sec for default vs json-stringify(threshold=1) vs native JSON.stringify
 * across sizes, and reports the first size where native >= default.
 */

const build = require('..')

const SIZES = [1e2, 5e2, 1e3, 2e3, 5e3, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6]
const ITERS_BY_SIZE = {
  100: 400,
  500: 200,
  1000: 120,
  2000: 80,
  5000: 40,
  10000: 25,
  20000: 15,
  50000: 8,
  100000: 5,
  200000: 3,
  500000: 2,
  1000000: 1
}

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
  {
    name: 'integer',
    schemaItems: { type: 'integer' },
    make: (i) => getRandomInt(1000)
  },
  {
    name: 'number',
    schemaItems: { type: 'number' },
    make: (i) => getRandomInt(1000) + 0.5
  },
  {
    name: 'short string',
    schemaItems: { type: 'string' },
    make: () => 'hello world'
  },
  {
    name: 'long string',
    schemaItems: { type: 'string' },
    make: () => longString
  },
  {
    name: 'flat object',
    schemaItems: {
      type: 'object',
      properties: {
        s: { type: 'string' },
        n: { type: 'number' },
        b: { type: 'boolean' }
      }
    },
    make: () => ({ s: 'hello world', n: 42, b: true })
  },
  {
    name: 'nested object',
    schemaItems: {
      type: 'object',
      properties: {
        a: {
          type: 'object',
          properties: {
            b: {
              type: 'object',
              properties: { c: { type: 'integer' } }
            }
          }
        },
        n: { type: 'number' }
      }
    },
    make: (i) => ({ a: { b: { c: i } }, n: 42 })
  },
  {
    name: 'nullable integer',
    schemaItems: { type: 'integer', nullable: true },
    make: (i) => (i % 7 === 0 ? null : getRandomInt(1000))
  },
  {
    name: 'nullable string',
    schemaItems: { type: 'string', nullable: true },
    make: (i) => (i % 7 === 0 ? null : 'hello')
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

function measureOps (fn, iters) {
  // warmup
  for (let i = 0; i < Math.min(5, iters); i++) fn()
  const samples = []
  for (let r = 0; r < 3; r++) {
    const t0 = process.hrtime.bigint()
    for (let i = 0; i < iters; i++) fn()
    const t1 = process.hrtime.bigint()
    const sec = Number(t1 - t0) / 1e9
    samples.push(iters / sec)
  }
  return median(samples)
}

const results = []

for (const kind of kinds) {
  const schema = { type: 'array', items: kind.schemaItems }
  const stringifyDefault = build(schema, { largeArrayMechanism: 'default' })
  const stringifyNativeMech = build(schema, {
    largeArrayMechanism: 'json-stringify',
    largeArraySize: 1
  })

  let crossover = null
  console.log(`\n=== ${kind.name} ===`)
  console.log('size\tdefault\tjson-stringify\tnative\twinner')

  for (const size of SIZES) {
    // Skip huge nested/flat at 1e6 to avoid OOM on smaller machines
    if (size >= 1e6 && (kind.name === 'nested object' || kind.name === 'flat object' || kind.name.includes('string'))) {
      console.log(`${size}\t(skipped for memory)`)
      continue
    }

    const input = makeArray(size, kind)
    const iters = ITERS_BY_SIZE[size] || 1

    const defOps = measureOps(() => { stringifyDefault(input) }, iters)
    const jsOps = measureOps(() => { stringifyNativeMech(input) }, iters)
    const nativeOps = measureOps(() => { JSON.stringify(input) }, iters)

    let winner = 'default'
    if (nativeOps >= defOps && nativeOps >= jsOps) winner = 'native'
    else if (jsOps >= defOps) winner = 'json-stringify'

    if (crossover == null && nativeOps > defOps) crossover = size

    console.log(
      `${size}\t${defOps.toFixed(1)}\t${jsOps.toFixed(1)}\t${nativeOps.toFixed(1)}\t${winner}`
    )

    results.push({
      kind: kind.name,
      size,
      default: defOps,
      jsonStringify: jsOps,
      native: nativeOps,
      winner
    })
  }

  console.log(`crossover (native > default): ${crossover == null ? 'none in range' : crossover}`)
}

console.log('\n=== SUMMARY JSON ===')
console.log(JSON.stringify({ results, node: process.version }, null, 2))
