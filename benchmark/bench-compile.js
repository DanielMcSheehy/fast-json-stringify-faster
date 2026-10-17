'use strict'

const { Bench } = require('tinybench')
const fjs = require('..')

const RUNS = Number(process.env.BENCH_RUNS || 3)

const schemas = {
  small: {
    type: 'object',
    properties: {
      a: { type: 'string' },
      b: { type: 'number' }
    }
  },
  wide: {
    type: 'object',
    properties: Object.fromEntries(
      Array.from({ length: 40 }, (_, i) => [`p${i}`, { type: i % 2 === 0 ? 'string' : 'number' }])
    )
  },
  deep: (() => {
    let schema = { type: 'string' }
    for (let i = 0; i < 12; i++) {
      schema = {
        type: 'object',
        properties: { child: schema }
      }
    }
    return schema
  })(),
  refHeavy: {
    type: 'object',
    properties: {
      a: { $ref: '#/definitions/node' },
      b: { $ref: '#/definitions/node' },
      c: { $ref: '#/definitions/node' }
    },
    definitions: {
      node: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          label: { type: 'string' },
          next: { $ref: '#/definitions/leaf' }
        }
      },
      leaf: {
        type: 'object',
        properties: {
          value: { type: 'number' }
        }
      }
    }
  }
}

function median (values) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

async function runOne (name, schema) {
  const bench = new Bench({ name })
  bench.add(name, () => {
    fjs(schema)
  })
  await bench.run()
  return bench.tasks[0].result.throughput.mean
}

async function main () {
  for (const [name, schema] of Object.entries(schemas)) {
    const samples = []
    for (let i = 0; i < RUNS; i++) {
      samples.push(await runOne(name, schema))
    }
    const med = median(samples)
    console.log(
      `${name.padEnd(12)} median ${Math.round(med).toLocaleString()} ops/sec  ` +
      `samples=[${samples.map(s => Math.round(s)).join(',')}]`
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
