'use strict'

const { Bench } = require('tinybench')
const { loadVariant } = require('./array-accumulation-variants')
const variant = process.env.FJS_ARRAY_VARIANT || 'baseline'
const build = loadVariant(variant)
const scalar = { type: 'string' }
const small = { type: 'object', properties: { id: { type: 'integer' }, tags: { type: 'array', items: scalar } } }
const wide = { type: 'object', properties: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`p${i}`, { type: 'array', items: scalar }])) }
let deep = { type: 'array', items: scalar }
for (let i = 0; i < 20; i++) deep = { type: 'object', properties: { child: deep } }
const refs = {
  $id: 'urn:compile-heavy',
  type: 'object',
  definitions: Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`d${i}`, { type: 'array', items: { type: 'integer' } }])),
  properties: Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`p${i}`, { $ref: `#/definitions/d${i}` }]))
}

async function main () {
  for (const [kind, schema] of [['small', small], ['wide', wide], ['deep', deep], ['$ref-heavy', refs]]) {
    if (globalThis.gc) globalThis.gc()
    const bench = new Bench({ time: 500, iterations: 10, warmupTime: 100, warmupIterations: 3 })
    bench.add(kind, () => build(schema))
    await bench.run()
    const result = bench.tasks[0].result
    if (result.error) throw result.error
    console.log(JSON.stringify({ variant, kind, hz: result.throughput.mean, rme: result.latency.rme, samples: result.latency.df + 1 }))
  }
}

main().catch(err => { console.error(err); process.exitCode = 1 })
