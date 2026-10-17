'use strict'

/**
 * Micro-benchmark individual build() cost centers for a tiny schema.
 */

const { performance } = require('perf_hooks')
const { RefResolver } = require('json-schema-ref-resolver')
const Validator = require('../lib/validator')
const Serializer = require('../lib/serializer')
const validate = require('../lib/schema-validator')
const Location = require('../lib/location')

const schema = { type: 'object', properties: { a: { type: 'string' } } }
const N = 500

function time (label, fn) {
  // warmup
  for (let i = 0; i < 10; i++) fn()
  const start = performance.now()
  for (let i = 0; i < N; i++) fn()
  const ms = performance.now() - start
  console.log(`${label.padEnd(40)} ${(ms / N).toFixed(4)} ms/op  (${(1000 / (ms / N)).toFixed(0)} ops/sec)`)
}

time('isValidSchema (schema-validator)', () => {
  validate(schema)
})

time('new RefResolver + addSchema', () => {
  const r = new RefResolver()
  r.addSchema(schema, 'root')
})

time('new Validator()', () => {
  // eslint-disable-next-line no-new
  new Validator()
})

time('new Serializer()', () => {
  // eslint-disable-next-line no-new
  new Serializer({})
})

time('new Location', () => {
  // eslint-disable-next-line no-new
  new Location(schema, 'root')
})

time('new Function trivial', () => {
  // eslint-disable-next-line no-new-func
  const f = new Function('validator', 'serializer', 'return function main(input) { return \'"\' + input + \'"\' }')
  f(null, new Serializer({}))
})

const fjs = require('..')
time('full fjs(tiny)', () => {
  fjs(schema)
})
