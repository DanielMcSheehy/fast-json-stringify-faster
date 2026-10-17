'use strict'

/**
 * Compilation (build()) overhead microbenchmark (experiment contract harness).
 */

const { Bench } = require('tinybench')
const fjs = require('..')

function makeWideSchema (n) {
  const properties = {}
  for (let i = 0; i < n; i++) {
    properties[`p${i}`] = { type: 'string' }
  }
  return { type: 'object', properties }
}

function makeDeepSchema (depth) {
  let schema = { type: 'string' }
  for (let i = 0; i < depth; i++) {
    schema = {
      type: 'object',
      properties: { nested: schema }
    }
  }
  return schema
}

function makeRefHeavySchema () {
  return {
    definitions: {
      id: { type: 'integer' },
      name: { type: 'string' },
      tag: { type: 'string' },
      item: {
        type: 'object',
        properties: {
          id: { $ref: '#/definitions/id' },
          name: { $ref: '#/definitions/name' },
          tags: {
            type: 'array',
            items: { $ref: '#/definitions/tag' }
          }
        }
      }
    },
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/definitions/item' }
      }
    }
  }
}

const cases = [
  {
    name: 'small',
    schema: {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'integer' }
      }
    }
  },
  {
    name: 'wide',
    schema: makeWideSchema(50)
  },
  {
    name: 'deep',
    schema: makeDeepSchema(20)
  },
  {
    name: 'ref-heavy',
    schema: makeRefHeavySchema()
  }
]

async function runOne (name, schema) {
  const bench = new Bench({
    name,
    time: 500,
    setup: (_task, mode) => {
      if (mode === 'warmup' && typeof globalThis.gc === 'function') {
        globalThis.gc()
      }
    }
  })
  bench.add(name, () => {
    fjs(schema)
  })
  await bench.run()
  const task = bench.tasks[0]
  const hz = task.result.throughput.mean
  const rme = task.result.latency.rme
  return { hz, rme, samples: task.result.latency.df + 1 }
}

async function main () {
  for (const c of cases) {
    const { hz, rme, samples } = await runOne(c.name, c.schema)
    const formattedHz = hz.toLocaleString('en-US', { maximumFractionDigits: 0 })
    console.log(`${c.name} x ${formattedHz} ops/sec ±${rme.toFixed(2)}% (${samples} runs sampled)`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
