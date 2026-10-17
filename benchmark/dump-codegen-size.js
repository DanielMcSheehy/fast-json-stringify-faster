'use strict'

const fs = require('fs')
const path = require('path')

const variants = ['peel', 'if-i', 'sep', 'addComma']
const outDir = path.join(__dirname, '..', 'EXPERIMENTS', 'v8-traces')
fs.mkdirSync(outDir, { recursive: true })

const results = {}
const RealFunction = Function

for (const v of variants) {
  process.env.FJS_LOOP_VARIANT = v
  for (const key of Object.keys(require.cache)) {
    if (key.includes('fast-json-stringify') || key.endsWith('index.js') ||
        key.includes('/lib/')) {
      delete require.cache[key]
    }
  }
  // Clear relative caches from this cwd
  delete require.cache[require.resolve('..')]
  delete require.cache[require.resolve('../lib/serializer')]
  delete require.cache[require.resolve('../lib/validator')]
  delete require.cache[require.resolve('../lib/location')]
  delete require.cache[require.resolve('../lib/schema-validator')]
  delete require.cache[require.resolve('../lib/merge-schemas')]

  let captured = null
  // eslint-disable-next-line no-global-assign
  Function = function (...args) {
    captured = args[args.length - 1]
    return RealFunction.apply(this, args)
  }
  Function.prototype = RealFunction.prototype

  const fjs = require('..')
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
  fjs(schema)

  // eslint-disable-next-line no-global-assign
  Function = RealFunction

  fs.writeFileSync(path.join(outDir, `codegen-${v}.js.txt`), captured)
  results[v] = {
    chars: captured.length,
    lines: captured.split('\n').length,
    asStringCalls: (captured.match(/asString\(/g) || []).length,
    asNumberCalls: (captured.match(/asNumber\(/g) || []).length,
    forLoops: (captured.match(/for \(let i/g) || []).length,
    peelMarker: /obj_\d+\[0\]/.test(captured),
    ifIMarker: /if \(i !== 0\)/.test(captured),
    sepMarker: /let sep = ''/.test(captured),
    addCommaMarker: /let addComma = false/.test(captured)
  }
}

console.log(JSON.stringify(results, null, 2))
