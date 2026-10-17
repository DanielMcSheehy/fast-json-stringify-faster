'use strict'

const assert = require('node:assert/strict')
const { loadVariant, variants } = require('./array-accumulation-variants')

function capture (build, schema, make, options) {
  const { input, events = [] } = make()
  try {
    return { output: build(schema, options)(input), events }
  } catch (err) {
    return { name: err.name, message: err.message, events }
  }
}

const fixtures = [
  [{ type: 'integer' }, () => {
    let calls = 0
    const input = new Proxy([0, 1, 2, 3, 4, 5, 6, 7, 8], {
      get (target, key) {
        return key === 'length' ? { valueOf () { return ++calls < 3 ? 9 : 2 } } : target[key]
      }
    })
    return { input }
  }],
  [{ type: 'integer' }, () => ({ input: [1, 2.8, null, '4', undefined, NaN, Infinity] })],
  [{ type: 'number' }, () => ({ input: [1, -0, NaN, Infinity, -Infinity, 2.5] })],
  [{ type: 'string', nullable: true }, () => ({ input: ['a', '"\\\n', '\ud800', '😀', null, undefined] })],
  [{}, () => ({ input: [undefined, null, NaN, { x: 1 }, [2]] })],
  [{ type: 'integer' }, () => ({ input: new Array(8) })],
  [{ type: 'array', items: { type: 'integer' } }, () => ({ input: [[1, 2], [], null, [3, 4, 5]] })],
  [{ type: 'object', properties: { x: { type: 'integer' }, a: { type: 'array', items: { type: 'string' } } } },
    () => ({ input: [{ x: 1, a: ['a', 'b'] }, { x: 2, a: [] }, null] })],
  [{ anyOf: [{ type: 'integer' }, { type: 'string' }] }, () => ({ input: [1, 'a', 2, 'b'] })],
  [{ const: { a: 1 } }, () => ({ input: [{ a: 1 }, { a: 1 }] })],
  [{ type: 'integer' }, () => {
    const events = []
    const array = Array.from({ length: 9 }, (_, i) => i)
    const input = new Proxy(array, {
      get (obj, key) {
        events.push(String(key))
        if (key === '2') obj[3] = 19
        return obj[key]
      }
    })
    return { input, events }
  }],
  [{ type: 'object', properties: { x: { type: 'integer' } } }, () => {
    const events = []
    const input = Array.from({ length: 9 }, (_, i) => ({
      toJSON () { events.push(`toJSON:${i}`); return { get x () { events.push(`get:${i}`); return i } } }
    }))
    return { input, events }
  }],
  [{ type: 'integer' }, () => {
    const events = []
    const input = Array.from({ length: 9 }, (_, i) => i)
    Object.defineProperty(input, 5, { get () { events.push('throw'); throw new Error('getter failed') } })
    return { input, events }
  }]
]

const baseline = loadVariant('baseline')
let checks = 0
for (const variant of variants) {
  const candidate = loadVariant(variant)
  for (const named of [false, true]) {
    for (const [items, make] of fixtures) {
      const schema = { type: 'array', items }
      if (named) schema.$id = 'urn:check-array'
      for (const options of [undefined, { largeArrayMechanism: 'json-stringify', largeArraySize: 4 }]) {
        assert.deepEqual(capture(candidate, schema, make, options), capture(baseline, schema, make, options), `${variant}/${named}`)
        checks++
      }
    }
    for (const size of [0, 1, 2, 3, 4, 5, 7, 8, 9, 1023, 1024, 1025, 2049, 8191, 8192, 8193]) {
      const schema = { type: 'array', items: { type: 'integer' } }
      if (named) schema.$id = 'urn:check-boundary'
      const input = Array.from({ length: size }, (_, i) => i)
      assert.equal(candidate(schema)(input), baseline(schema)(input))
      checks++
    }
    for (const input of [null, {}, 'abc', undefined]) {
      const schema = { type: 'array', items: { type: 'string' } }
      if (named) schema.$id = 'urn:check-invalid'
      assert.deepEqual(capture(candidate, schema, () => ({ input })), capture(baseline, schema, () => ({ input })))
      checks++
    }
  }
}
console.log(`${checks} differential output/error/access-order checks passed`)

// A rejected strategy can introduce a new observable dependency on array methods.
// Keep this counterexample executable, rather than silently claiming equivalence.
for (const named of [false, true]) {
  const outputs = {}
  for (const variant of ['baseline', 'join']) {
    const schema = { type: 'array', items: { type: 'string' } }
    if (named) schema.$id = 'urn:join-mutation'
    const stringify = loadVariant(variant)(schema)
    const originalJoin = Array.prototype.join
    try {
      outputs[variant] = stringify([{
        toString () { Array.prototype.join = () => 'changed'; return 'x' } // eslint-disable-line no-extend-native -- Deliberate coercion side effect.
      }, 'y'])
    } finally {
      Array.prototype.join = originalJoin // eslint-disable-line no-extend-native -- Restore the original method.
    }
  }
  assert.equal(outputs.baseline, '["x","y"]')
  assert.equal(outputs.join, '[changed]')
}
console.log('Confirmed join rejection: item coercion can replace Array.prototype.join (both paths)')
