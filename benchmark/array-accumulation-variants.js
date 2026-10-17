'use strict'

// Experiment-only loader: substitute the two homogeneous buildArray loops in memory.
// Production index.js and public build options remain unchanged.
const fs = require('node:fs')
const Module = require('node:module')

const variants = ['baseline', 'local', 'flatten', 'join', 'unroll4', 'comma']

function accumulationLoop (code, array, length) {
  const variant = 'VARIANT_PLACEHOLDER'
  const item = `
    let item
    {
      let json = ''
      ${code}
      item = json
    }
  `
  if (variant === 'join') {
    return `
      {
        const parts = []
        for (let i = 0; i < ${length}; i++) {
          const value = ${array}[i]
          ${item}
          parts.push(item)
        }
        json += parts.join(JSON_STR_COMMA)
      }
    `
  }
  const append = variant === 'local' || variant === 'comma'
    ? `${item}\njson += item`
    : code
  let body = `
    json += JSON_STR_COMMA
    const value = ${array}[i]
    ${append}
  `
  if (variant === 'comma') {
    body = `const value = ${array}[i]\n${item}\njson += JSON_STR_COMMA + item`
  }
  if (variant === 'flatten') {
    // Native intrinsic is an experiment control, never a production dependency.
    body += '\nif ((i & 8191) === 0) json = %FlattenString(json)'
  }
  const loop = variant === 'unroll4'
    ? `
      if (typeof ${length} === 'number') {
        let i = 1
        for (; i + 3 < ${length};) {
          ${Array.from({ length: 4 }, () => `{ ${body}\ni++ }`).join('\n')}
        }
        for (; i < ${length}; i++) { ${body} }
      } else {
        for (let i = 1; i < ${length}; i++) { ${body} }
      }
    `
    : `for (let i = 1; i < ${length}; i++) { ${body} }`
  return `
    if (${length} > 0) {
      const value = ${array}[0]
      ${append}
      ${loop}
    }
  `
}

function loadVariant (variant) {
  if (!variants.includes(variant)) throw new Error(`Unknown variant: ${variant}`)
  const filename = require.resolve('..')
  delete require.cache[filename]
  if (variant === 'baseline') return require('..')
  let source = fs.readFileSync(filename, 'utf8')
  const helper = accumulationLoop.toString().replace('VARIANT_PLACEHOLDER', variant)
  source = source.replace('function buildArray (context, location, input) {',
    `function buildArray (context, location, input) {\n${helper}`)
  for (const [array, length, invocation] of [
    ['obj', 'arrayLength', "accumulationLoop(code, 'obj', 'arrayLength')"],
    ['${objVar}', 'arrayLength_${objVar}', "accumulationLoop(code, objVar, 'arrayLength_' + objVar)"] // eslint-disable-line no-template-curly-in-string
  ]) {
    const original = `
      if (${length} > 0) {
        const value = ${array}[0]
        \${code}
        for (let i = 1; i < ${length}; i++) {
          json += JSON_STR_COMMA
          const value = ${array}[i]
          \${code}
        }
      }`
    if (!source.includes(original)) throw new Error(`Cannot find ${array} array loop`)
    source = source.replace(original, '${' + invocation + '}')
  }
  const experiment = new Module(filename, module)
  experiment.filename = filename
  experiment.paths = Module._nodeModulePaths(require('node:path').dirname(filename))
  require.cache[filename] = experiment
  experiment._compile(source, filename)
  experiment.loaded = true
  return experiment.exports
}

module.exports = { loadVariant, variants }
if (process.env.FJS_ARRAY_VARIANT) loadVariant(process.env.FJS_ARRAY_VARIANT)
