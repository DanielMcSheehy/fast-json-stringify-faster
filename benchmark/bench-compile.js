'use strict'

/**
 * Measure build() wall time for representative schemas.
 * Reports median ms over N iterations (default 100) per case.
 *
 * Usage: node benchmark/bench-compile.js [iterations]
 */

const fjs = require('..')

const ITERATIONS = Number(process.argv[2]) || 100

function median (values) {
  const sorted = values.slice().sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function mean (values) {
  return values.reduce((a, b) => a + b, 0) / values.length
}

function stddev (values) {
  const m = mean(values)
  const variance = values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function wideSchema (n) {
  const properties = {}
  for (let i = 0; i < n; i++) {
    properties[`p${i}`] = { type: i % 3 === 0 ? 'string' : i % 3 === 1 ? 'number' : 'boolean' }
  }
  return { type: 'object', properties }
}

function deepSchema (levels) {
  let schema = { type: 'string' }
  for (let i = 0; i < levels; i++) {
    schema = {
      type: 'object',
      properties: { nested: schema }
    }
  }
  return schema
}

function refHeavySchema (defs) {
  const definitions = {}
  for (let i = 0; i < defs; i++) {
    definitions[`d${i}`] = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' }
      }
    }
  }
  const properties = {}
  for (let i = 0; i < defs; i++) {
    properties[`f${i}`] = { $ref: `#/definitions/d${i}` }
  }
  return { type: 'object', definitions, properties }
}

const oneOfSchema = {
  type: 'object',
  properties: {
    value: {
      oneOf: [
        { type: 'string' },
        { type: 'number' },
        { type: 'boolean' },
        {
          type: 'object',
          properties: { x: { type: 'integer' } }
        }
      ]
    }
  }
}

const cases = [
  {
    name: 'tiny',
    schema: { type: 'object', properties: { a: { type: 'string' } } }
  },
  {
    name: 'wide-200',
    schema: wideSchema(200)
  },
  {
    name: 'deep-20',
    schema: deepSchema(20)
  },
  {
    name: 'ref-heavy-50',
    schema: refHeavySchema(50)
  },
  {
    name: 'oneOf',
    schema: oneOfSchema
  }
]

function measure (schema, iterations) {
  // Warmup
  for (let i = 0; i < 5; i++) fjs(schema)

  const times = []
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint()
    fjs(schema)
    const end = process.hrtime.bigint()
    times.push(Number(end - start) / 1e6)
  }
  return {
    medianMs: median(times),
    meanMs: mean(times),
    stddevMs: stddev(times),
    opsPerSec: 1000 / median(times)
  }
}

console.log(`Node ${process.version} | iterations=${ITERATIONS}`)
console.log('')
console.log(
  'case'.padEnd(16) +
  'median_ms'.padStart(12) +
  'mean_ms'.padStart(12) +
  'stddev_ms'.padStart(12) +
  'ops/sec'.padStart(14)
)

const results = {}
for (const c of cases) {
  const r = measure(c.schema, ITERATIONS)
  results[c.name] = r
  console.log(
    c.name.padEnd(16) +
    r.medianMs.toFixed(3).padStart(12) +
    r.meanMs.toFixed(3).padStart(12) +
    r.stddevMs.toFixed(3).padStart(12) +
    r.opsPerSec.toFixed(1).padStart(14)
  )
}

if (process.env.BENCH_JSON) {
  console.log('\n' + JSON.stringify(results, null, 2))
}
