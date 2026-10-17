'use strict'

const { Bench } = require('tinybench')
const build = require('..')

function wideSchema (count) {
  const properties = {}
  const required = []
  for (let i = 0; i < count; i++) {
    const key = 'p' + i
    properties[key] = { type: i % 2 === 0 ? 'string' : 'number' }
    required.push(key)
  }
  return { type: 'object', properties, required }
}

function deepSchema (depth) {
  let schema = { type: 'string' }
  for (let i = 0; i < depth; i++) {
    schema = {
      type: 'object',
      properties: { child: schema }
    }
  }
  return schema
}

function refSchema () {
  const schema = {}
  for (let i = 0; i < 30; i++) {
    schema['S' + i] = {
      $id: 'S' + i,
      type: 'object',
      properties: {
        name: { type: 'string' },
        next: { $ref: 'S' + ((i + 1) % 30) + '#' }
      }
    }
  }
  return {
    schema: {
      type: 'object',
      properties: {
        item: { $ref: 'S0#' }
      }
    },
    options: { schema }
  }
}

const workloads = [
  {
    name: 'small',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' }
      },
      required: ['id', 'name']
    }
  },
  { name: 'wide', schema: wideSchema(80) },
  { name: 'deep', schema: deepSchema(40) },
  (() => {
    const refs = refSchema()
    return { name: 'ref-heavy', schema: refs.schema, options: refs.options }
  })()
]

async function measure (workload) {
  const bench = new Bench({ name: workload.name, time: 400, warmupTime: 100, warmup: true })
  bench.add(workload.name, () => {
    build(workload.schema, workload.options)
  })
  await bench.run()
  const task = bench.tasks[0]
  const hz = task.result.throughput.mean
  const rme = task.result.latency.rme
  const samples = task.result.latency.df + 1
  console.log(`${workload.name} x ${hz.toLocaleString('en-US', { maximumFractionDigits: 0 })} ops/sec ±${rme.toFixed(2)}% (${samples} runs sampled)`)
}

async function main () {
  for (const workload of workloads) {
    await measure(workload)
  }
}

main()
