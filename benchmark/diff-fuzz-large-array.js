'use strict'

/**
 * Differential fuzz: compare fjs default vs fjs json-stringify vs JSON.stringify
 * for array item kinds. Classifies mismatch classes (does not fail the process).
 */

const build = require('..')

const mismatchClasses = Object.create(null)

function record (cls, detail) {
  if (!mismatchClasses[cls]) mismatchClasses[cls] = { count: 0, examples: [] }
  mismatchClasses[cls].count++
  if (mismatchClasses[cls].examples.length < 5) {
    mismatchClasses[cls].examples.push(detail)
  }
}

function tryCall (fn, input) {
  try {
    return { ok: true, value: fn(input) }
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : String(err) }
  }
}

function compareTriple (label, schema, input, optionsExtra) {
  const stringifyDefault = build(schema, { largeArrayMechanism: 'default', ...optionsExtra })
  const stringifyJs = build(schema, {
    largeArrayMechanism: 'json-stringify',
    largeArraySize: 1,
    ...optionsExtra
  })

  const a = tryCall(stringifyDefault, input)
  const b = tryCall(stringifyJs, input)
  const c = tryCall(JSON.stringify, input)

  // default vs json-stringify mechanism
  if (a.ok !== b.ok) {
    record('mechanism-throw-divergence', {
      label,
      inputPreview: preview(input),
      default: a,
      jsonStringify: b
    })
  } else if (a.ok && b.ok && a.value !== b.value) {
    record('mechanism-output-divergence', {
      label,
      inputPreview: preview(input),
      default: a.value,
      jsonStringify: b.value
    })
  }

  // default vs native
  if (a.ok && c.ok && a.value !== c.value) {
    record('fjs-vs-native-output', {
      label,
      inputPreview: preview(input),
      fjs: a.value,
      native: c.value
    })
  } else if (a.ok !== c.ok) {
    record('fjs-vs-native-throw', {
      label,
      inputPreview: preview(input),
      fjs: a,
      native: c
    })
  }

  // json-stringify mechanism vs native (should match when both succeed for plain data)
  if (b.ok && c.ok && b.value !== c.value) {
    record('json-stringify-mech-vs-native', {
      label,
      inputPreview: preview(input),
      mech: b.value,
      native: c.value
    })
  }
}

function preview (input) {
  try {
    const s = JSON.stringify(input, (_k, v) => {
      if (typeof v === 'number' && !Number.isFinite(v)) return String(v)
      if (typeof v === 'bigint') return String(v)
      if (typeof v === 'function') return '[Function]'
      if (v === undefined) return '[undefined]'
      return v
    })
    return s && s.length > 200 ? s.slice(0, 200) + '…' : s
  } catch {
    return String(input)
  }
}

function randInt (n) {
  return Math.floor(Math.random() * n)
}

function randomPrimitive () {
  const roll = randInt(12)
  switch (roll) {
    case 0: return null
    case 1: return undefined
    case 2: return true
    case 3: return false
    case 4: return randInt(1000)
    case 5: return randInt(1000) + 0.25
    case 6: return NaN
    case 7: return Infinity
    case 8: return -Infinity
    case 9: return 'hello'
    case 10: return 'has"quote'
    case 11: return { toJSON () { return 'via-toJSON' } }
    default: return 0
  }
}

const schemas = [
  { label: 'integer', schema: { type: 'array', items: { type: 'integer' } } },
  { label: 'number', schema: { type: 'array', items: { type: 'number' } } },
  { label: 'string', schema: { type: 'array', items: { type: 'string' } } },
  { label: 'boolean', schema: { type: 'array', items: { type: 'boolean' } } },
  {
    label: 'nullable-integer',
    schema: { type: 'array', items: { type: 'integer', nullable: true } }
  },
  {
    label: 'nullable-string',
    schema: { type: 'array', items: { type: 'string', nullable: true } }
  },
  {
    label: 'flat-object-all-required',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          a: { type: 'integer' },
          b: { type: 'string' }
        },
        required: ['a', 'b']
      }
    }
  },
  {
    label: 'flat-object-additionalProperties-false',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          a: { type: 'integer' },
          b: { type: 'string' }
        },
        additionalProperties: false
      }
    }
  },
  {
    label: 'nested-object',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nested: {
            type: 'object',
            properties: { x: { type: 'number' } }
          }
        }
      }
    }
  }
]

// Hand-crafted semantic probes
const probes = [
  { label: 'undefined-element', schema: schemas[0].schema, input: [1, undefined, 3] },
  { label: 'nan-element', schema: schemas[1].schema, input: [1, NaN, 3] },
  { label: 'infinity-element', schema: schemas[1].schema, input: [1, Infinity, -Infinity] },
  { label: 'toJSON-element-number-schema', schema: schemas[1].schema, input: [{ toJSON () { return 42 } }] },
  { label: 'toJSON-element-string-schema', schema: schemas[2].schema, input: [{ toJSON () { return 'x' } }] },
  {
    label: 'extra-props',
    schema: schemas[7].schema,
    input: [{ a: 1, b: 'x', extra: 'y' }]
  },
  {
    label: 'property-order',
    schema: schemas[6].schema,
    input: [{ b: 'x', a: 1 }]
  },
  {
    label: 'null-in-non-nullable-integer',
    schema: schemas[0].schema,
    input: [1, null, 2]
  },
  {
    label: 'null-in-nullable-integer',
    schema: schemas[4].schema,
    input: [1, null, 2]
  },
  {
    label: 'string-coercion-in-integer',
    schema: schemas[0].schema,
    input: [1, '2', 3]
  },
  {
    label: 'date-in-string-array',
    schema: schemas[2].schema,
    input: [new Date('2020-01-01T00:00:00.000Z')]
  },
  {
    label: 'sparse-array',
    schema: schemas[0].schema,
    input: (() => { const a = [1]; a[2] = 3; return a })()
  },
  {
    label: 'typed-array-as-array-input-float64',
    schema: schemas[1].schema,
    input: Float64Array.from([1.5, 2.5, 3.5])
  },
  {
    label: 'typed-array-as-array-input-int32',
    schema: schemas[0].schema,
    input: Int32Array.from([1, 2, 3])
  },
  {
    label: 'array-of-typed-array-values-via-spread',
    schema: schemas[1].schema,
    input: [...Float64Array.from([1.25, NaN, Infinity])]
  }
]

console.log('Running hand-crafted probes...')
for (const p of probes) {
  compareTriple(p.label, p.schema, p.input)
}

console.log('Running random fuzz (200 cases per schema)...')
for (const { label, schema } of schemas) {
  for (let i = 0; i < 200; i++) {
    const len = randInt(8)
    const input = new Array(len)
    for (let j = 0; j < len; j++) {
      if (label.startsWith('flat-object') || label === 'nested-object') {
        if (label === 'nested-object') {
          input[j] = { nested: { x: randomPrimitive() } }
        } else {
          const obj = { a: randomPrimitive(), b: randomPrimitive() }
          if (randInt(3) === 0) obj.extra = randomPrimitive()
          if (randInt(3) === 0) {
            // reverse insert order
            input[j] = { b: obj.b, a: obj.a, ...(obj.extra !== undefined ? { extra: obj.extra } : {}) }
          } else {
            input[j] = obj
          }
        }
      } else {
        input[j] = randomPrimitive()
      }
    }
    compareTriple(`${label}/rand-${i}`, schema, input)
  }
}

// Typed-array behavior notes: fjs requires Array.isArray; typed arrays are not arrays.
console.log('\n=== Typed-array Array.isArray checks ===')
console.log('Array.isArray(Float64Array):', Array.isArray(new Float64Array(3)))
console.log('Array.isArray(Int32Array):', Array.isArray(new Int32Array(3)))
const stringifyNum = build({ type: 'array', items: { type: 'number' } })
for (const ta of [new Float64Array([1, 2, 3]), new Int32Array([1, 2, 3])]) {
  const r = tryCall(stringifyNum, ta)
  console.log(ta.constructor.name, r.ok ? r.value : `THROW: ${r.error}`)
  console.log('  JSON.stringify:', JSON.stringify(ta))
}

console.log('\n=== MISMATCH CLASS SUMMARY ===')
const summary = Object.entries(mismatchClasses).map(([cls, v]) => ({
  class: cls,
  count: v.count,
  examples: v.examples
}))
summary.sort((a, b) => b.count - a.count)
console.log(JSON.stringify(summary, null, 2))
