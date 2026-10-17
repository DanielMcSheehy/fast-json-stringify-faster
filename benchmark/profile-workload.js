'use strict'

// Example: node --cpu-prof --cpu-prof-name=integer.cpuprofile benchmark/profile-workload.js --kind integer
const { parseArgs } = require('node:util')
const build = require('..')
const { arrayFixture, compileFixtures, mechanisms } = require('./experiment-fixtures')
const { positiveNumber } = require('./experiment-utils')

const { values } = parseArgs({ options: { kind: { type: 'string', default: 'integer' }, case: { type: 'string' }, mechanism: { type: 'string', default: 'default' }, duration: { type: 'string', default: '2000' } } })
const duration = positiveNumber(values.duration, 'duration')
let operation
let output
if (values.case) {
  const fixture = compileFixtures()[values.case]
  if (!fixture) throw new Error('Unknown compile case')
  operation = function compileFixture () { output = build(fixture.schema, fixture.options) }
} else {
  if (!mechanisms.includes(values.mechanism)) throw new Error('Unknown mechanism')
  const { input, schema, typed } = arrayFixture(values.kind, 1e5)
  if (typed && values.mechanism !== 'native') throw new Error('FJS rejects typed arrays; use --mechanism native to profile native indexed-object output')
  const stringify = values.mechanism === 'native' ? JSON.stringify : build(schema, { largeArrayMechanism: values.mechanism })
  operation = function serializeFixture () { output = Buffer.byteLength(stringify(input)) }
}

function runFor (milliseconds) {
  const start = process.hrtime.bigint()
  const deadline = start + BigInt(Math.round(milliseconds * 1e6))
  let iterations = 0
  do {
    operation()
    iterations++
  } while (process.hrtime.bigint() < deadline)
  return { startUs: Number(start / 1000n), endUs: Number(process.hrtime.bigint() / 1000n), iterations }
}

runFor(500)
// A distinct stack frame lets the summary locate this phase on the V8 clock.
// process.hrtime() and V8 TimeTicks have different origins on some platforms.
function measureWorkload () {
  return runFor(duration)
}

const measured = measureWorkload()
console.log(JSON.stringify({ ...values, ...measured, outputType: typeof output }))
