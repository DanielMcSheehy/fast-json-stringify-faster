'use strict'

/**
 * Compilation (build) overhead benchmark (experiment contract).
 * Run: node --expose-gc benchmark/bench-compile.js
 */

const { Bench } = require('tinybench')
const FJS = require('..')

const schemas = {
  small: {
    type: 'object',
    properties: {
      a: { type: 'string' },
      b: { type: 'integer' }
    }
  },
  wide: {
    type: 'object',
    properties: Object.fromEntries(
      Array.from({ length: 40 }, (_, i) => [`p${i}`, { type: i % 2 ? 'integer' : 'string' }])
    )
  },
  deep: (() => {
    let schema = { type: 'integer' }
    for (let i = 0; i < 8; i++) {
      schema = {
        type: 'object',
        properties: { nested: schema }
      }
    }
    return schema
  })(),
  refHeavy: {
    definitions: {
      id: { type: 'string' },
      item: {
        type: 'object',
        properties: {
          id: { $ref: '#/definitions/id' },
          child: { $ref: '#/definitions/item' }
        }
      }
    },
    type: 'object',
    properties: {
      root: { $ref: '#/definitions/item' },
      list: { type: 'array', items: { $ref: '#/definitions/item' } }
    }
  }
}

async function main () {
  for (const [name, schema] of Object.entries(schemas)) {
    const bench = new Bench({
      time: 400,
      warmupTime: 100,
      setup: (_task, mode) => {
        if (mode === 'warmup' && typeof globalThis.gc === 'function') globalThis.gc()
      }
    })
    bench.add(name, () => { FJS(schema) })
    await bench.run()
    const t = bench.tasks[0]
    console.log(`${name} x ${Math.round(t.result.throughput.mean).toLocaleString()} ops/sec ±${t.result.latency.rme.toFixed(2)}%`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
