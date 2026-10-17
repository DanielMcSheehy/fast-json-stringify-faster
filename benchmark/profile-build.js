'use strict'

/**
 * Exercise build() across schema shapes for CPU profiling.
 * Run with: node --cpu-prof --cpu-prof-dir=.profile-build benchmark/profile-build.js
 */

const fjs = require('..')

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
    schema = { type: 'object', properties: { nested: schema } }
  }
  return schema
}

function refHeavySchema (defs) {
  const definitions = {}
  for (let i = 0; i < defs; i++) {
    definitions[`d${i}`] = {
      type: 'object',
      properties: { id: { type: 'integer' }, name: { type: 'string' } }
    }
  }
  const properties = {}
  for (let i = 0; i < defs; i++) {
    properties[`f${i}`] = { $ref: `#/definitions/d${i}` }
  }
  return { type: 'object', definitions, properties }
}

const schemas = {
  tiny: { type: 'object', properties: { a: { type: 'string' } } },
  wide: wideSchema(200),
  deep: deepSchema(20),
  refHeavy: refHeavySchema(50),
  oneOf: {
    type: 'object',
    properties: {
      value: {
        oneOf: [
          { type: 'string' },
          { type: 'number' },
          { type: 'boolean' },
          { type: 'object', properties: { x: { type: 'integer' } } }
        ]
      }
    }
  }
}

const target = process.argv[2] || 'all'
const iterations = Number(process.argv[3]) || 200

const toRun = target === 'all' ? Object.keys(schemas) : [target]

for (const name of toRun) {
  const schema = schemas[name]
  if (!schema) throw new Error(`Unknown schema: ${name}`)
  for (let i = 0; i < iterations; i++) {
    fjs(schema)
  }
  console.log(`built ${name} x ${iterations}`)
}
