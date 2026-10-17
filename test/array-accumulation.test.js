'use strict'

const { test } = require('node:test')
const build = require('..')

for (const named of [false, true]) {
  test(`array accumulation tolerates item coercion replacing join (${named ? 'named' : 'inline'})`, t => {
    const schema = { type: 'array', items: { type: 'string' } }
    if (named) schema.$id = 'urn:array-join-mutation'
    const stringify = build(schema)
    const originalJoin = Array.prototype.join
    let output
    try {
      output = stringify([{
        toString () { Array.prototype.join = () => 'changed'; return 'x' } // eslint-disable-line no-extend-native -- Deliberate coercion side effect.
      }, 'y'])
    } finally {
      Array.prototype.join = originalJoin // eslint-disable-line no-extend-native -- Restore the original method.
    }
    t.assert.equal(output, '["x","y"]')
  })

  test(`array accumulation preserves proxy length coercions (${named ? 'named' : 'inline'})`, t => {
    const schema = { type: 'array', items: { type: 'integer' } }
    if (named) schema.$id = 'urn:array-length-coercions'
    let calls = 0
    const input = new Proxy([0, 1, 2, 3, 4, 5, 6, 7, 8], {
      get (target, key) {
        return key === 'length' ? { valueOf () { return ++calls < 3 ? 9 : 2 } } : target[key]
      }
    })
    t.assert.equal(build(schema)(input), '[0,1]')
    t.assert.equal(calls, 3)
  })

  test(`array accumulation boundaries (${named ? 'named' : 'inline'})`, t => {
    const schema = { type: 'array', items: { type: 'integer' } }
    if (named) schema.$id = 'urn:array-boundaries'
    const stringify = build(schema)
    for (const size of [0, 1, 2, 3, 4, 5, 7, 8, 9, 1023, 1024, 1025, 2049]) {
      const input = Array.from({ length: size }, (_, i) => i)
      t.assert.equal(stringify(input), JSON.stringify(input))
    }
  })

  test(`array accumulation reads and serializes each item in order (${named ? 'named' : 'inline'})`, t => {
    const schema = { type: 'array', items: { type: 'object', properties: { n: { type: 'integer' } } } }
    if (named) schema.$id = 'urn:array-access-order'
    const events = []
    const array = Array.from({ length: 9 }, (_, i) => ({
      toJSON () {
        events.push(`serialize:${i}`)
        if (i === 2) array[3] = { n: 99 }
        return { n: i }
      }
    }))
    const input = new Proxy(array, {
      get (target, key) {
        if (key !== 'length') events.push(`read:${key}`)
        return target[key]
      }
    })
    t.assert.equal(build(schema)(input), '[{"n":0},{"n":1},{"n":2},{"n":99},{"n":4},{"n":5},{"n":6},{"n":7},{"n":8}]')
    t.assert.deepEqual(events, [
      'read:0', 'serialize:0', 'read:1', 'serialize:1', 'read:2', 'serialize:2',
      'read:3', 'read:4', 'serialize:4', 'read:5', 'serialize:5', 'read:6', 'serialize:6',
      'read:7', 'serialize:7', 'read:8', 'serialize:8'
    ])
  })
}
