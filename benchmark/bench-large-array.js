'use strict'

const assert = require('node:assert/strict')
const { Bench } = require('tinybench')
const { loadVariant } = require('./array-accumulation-variants')
const variant = process.env.FJS_ARRAY_VARIANT || 'baseline'
const build = loadVariant(variant)
const sizes = (process.env.FJS_SIZES || '1000,20000,100000,1000000').split(',').map(Number)
const paths = (process.env.FJS_PATHS || 'inline,named').split(',')
const flatSchema = {
  type: 'object',
  properties: { s: { type: 'string' }, n: { type: 'number' }, b: { type: 'boolean' } }
}
const kinds = [
  ['integer', { type: 'integer' }, i => i % 10000],
  ['number', { type: 'number' }, i => (i % 10000) + 0.25],
  ['short-string', { type: 'string' }, i => `hello ${i % 100}`],
  ['long-string', { type: 'string' }, i => 'abcdefghijklmnop'.repeat(8) + `"${i % 10}\\\n`],
  ['flat-object', flatSchema, i => ({ s: 'hello', n: i % 10000, b: i % 2 === 0 })],
  ['nested-object', {
    type: 'object',
    properties: { id: { type: 'integer' }, child: flatSchema, tags: { type: 'array', items: { type: 'integer' } } }
  }, i => ({ id: i % 10000, child: { s: 'hello', n: i % 10000, b: true }, tags: [1, 2, 3] })]
]

async function main () {
  for (const path of paths) {
    for (const size of sizes) {
      for (const [kind, items, make] of kinds) {
        if (process.env.FJS_KINDS && !process.env.FJS_KINDS.split(',').includes(kind)) continue
        const schema = { type: 'array', items }
        if (path === 'named') schema.$id = 'urn:array-accumulation'
        const input = Array.from({ length: size }, (_, i) => make(i))
        const stringify = build(schema)
        // Compare separately to avoid retaining two giant strings during the timing.
        if (process.env.FJS_VERIFY !== '0') assert.equal(stringify(input), JSON.stringify(input))
        if (globalThis.gc) globalThis.gc()
        let bytes = 0
        const bench = new Bench({
          time: Number(process.env.FJS_BENCH_TIME || 200),
          iterations: 2,
          warmupTime: 50,
          warmupIterations: 1
        })
        bench.add(`${path}/${size}/${kind}`, () => {
          bytes = Buffer.byteLength(stringify(input))
        })
        await bench.run()
        const result = bench.tasks[0].result
        if (result.error) throw result.error
        console.log(JSON.stringify({
          variant,
          path,
          size,
          kind,
          bytes,
          hz: result.throughput.mean,
          rme: result.latency.rme,
          samples: result.latency.df + 1
        }))
      }
    }
  }
}

main().catch(err => { console.error(err); process.exitCode = 1 })
