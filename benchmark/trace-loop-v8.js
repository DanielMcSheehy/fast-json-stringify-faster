'use strict'

/**
 * Warm + serialize a 1e5 flat-object array so --trace-opt / --trace-deopt /
 * --trace-turbo-inlining can be attached externally.
 */

const fjs = require('..')

const N = Number(process.env.TRACE_N || 1e5)
const schema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      s: { type: 'string' },
      n: { type: 'number' },
      b: { type: 'boolean' }
    }
  }
}

const input = new Array(N)
for (let i = 0; i < N; i++) {
  input[i] = { s: 'hello', n: i, b: true }
}

const stringify = fjs(schema, { largeArrayMechanism: 'default' })

// Warmup to trigger optimization
for (let i = 0; i < 5; i++) {
  Buffer.byteLength(stringify(input))
}

// Measured calls
for (let i = 0; i < 10; i++) {
  Buffer.byteLength(stringify(input))
}

console.log(`done variant=${process.env.FJS_LOOP_VARIANT || 'peel'} N=${N}`)
