'use strict'

const { Bench } = require('tinybench')
const build = require('..')

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

const refHeavySchema = {
  type: 'object',
  definitions: {
    node: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        child: { $ref: '#/definitions/node' }
      }
    },
    leaf: {
      type: 'object',
      properties: {
        value: { type: 'string' }
      }
    }
  },
  properties: {
    a: { $ref: '#/definitions/node' },
    b: { $ref: '#/definitions/leaf' },
    c: { $ref: '#/definitions/node' },
    d: { $ref: '#/definitions/leaf' },
    e: { $ref: '#/definitions/node' }
  }
}

const cases = [
  {
    name: 'small schema',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' }
      }
    }
  },
  {
    name: 'wide schema (50 props)',
    schema: makeWideSchema(50)
  },
  {
    name: 'deep schema (depth 20)',
    schema: makeDeepSchema(20)
  },
  {
    name: '$ref-heavy schema',
    schema: refHeavySchema
  },
  {
    name: 'large array schema (integer items)',
    schema: { type: 'array', items: { type: 'integer' } }
  }
]

async function run () {
  for (const c of cases) {
    const bench = new Bench({ name: c.name })
    bench.add(c.name, () => {
      build(c.schema)
    })
    await bench.run()
    const task = bench.tasks[0]
    const hz = task.result.throughput.mean
    const rme = task.result.latency.rme
    const samples = task.result.latency.df + 1
    console.log(
      `${task.name} x ${hz.toLocaleString('en-US', { maximumFractionDigits: 0 })} ops/sec ±${rme.toFixed(2)}% (${samples} runs sampled)`
    )
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
