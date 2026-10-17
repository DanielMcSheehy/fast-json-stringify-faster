'use strict'

const { Bench } = require('tinybench')
const build = require('..')

// ~64 chars, contains quotes and backslashes so asString takes its escape path.
const QUOTED = 'hello "world" \\ path / ' + 'x'.repeat(40)

const stringifyDefault = build({
  type: 'array',
  items: { type: 'string' }
})
// Opt-in mechanism. On a non-string element it does not match the default
// coercing loop (numbers stay numbers, null stays null). Speed only.
const stringifyJson = build({
  type: 'array',
  items: { type: 'string' }
}, {
  largeArrayMechanism: 'json-stringify',
  largeArraySize: 2e4
})

function makeShort (n) {
  const arr = new Array(n)
  for (let i = 0; i < n; i++) arr[i] = 'hello'
  return arr
}

function makeQuoted (n) {
  const arr = new Array(n)
  for (let i = 0; i < n; i++) arr[i] = QUOTED
  return arr
}

function makeMixed (n) {
  const arr = new Array(n)
  for (let i = 0; i < n; i++) arr[i] = (i % 10 === 9) ? i : 'hello'
  return arr
}

function makeMixedTail (n) {
  const arr = makeShort(n)
  arr[n - 1] = 1
  return arr
}

function guardOnly (arr) {
  const n = arr.length
  let all = true
  for (let i = 0; i < n; i++) {
    if (typeof arr[i] !== 'string') {
      all = false
      break
    }
  }
  return all
}

function benchOptions (n) {
  // iterations: 0 leaves only the time budget. A positive iterations value is a
  // minimum in sequential mode and would stretch multi-megabyte cases.
  if (n >= 1e6) return { time: 1500, iterations: 0, warmup: true, warmupTime: 200, warmupIterations: 0 }
  if (n >= 1e5) return { time: 800, iterations: 0, warmup: true, warmupTime: 150, warmupIterations: 0 }
  return { time: 300, warmupTime: 80, warmup: true, iterations: 0, warmupIterations: 0 }
}

async function measure (name, fn, n) {
  if (typeof globalThis.gc === 'function') globalThis.gc()
  const bench = new Bench({ name, ...benchOptions(n) })
  bench.add(name, () => {
    const out = fn()
    if (typeof out === 'string') Buffer.byteLength(out)
  })
  await bench.run()
  const task = bench.tasks[0]
  const hz = task.result.throughput.mean
  const rme = task.result.latency.rme
  const samples = task.result.latency.df + 1
  const formattedHz = hz.toLocaleString('en-US', { maximumFractionDigits: 0 })
  const formattedRme = rme.toFixed(2)
  console.log(`${name} x ${formattedHz} ops/sec ±${formattedRme}% (${samples} runs sampled)`)
}

async function main () {
  const sizes = [1e3, 2e4, 1e5, 1e6]
  const kinds = [
    ['short', makeShort],
    ['quoted', makeQuoted],
    ['mixed-every-10', makeMixed],
    ['mixed-tail', makeMixedTail]
  ]

  for (const n of sizes) {
    for (const [kind, make] of kinds) {
      const arr = make(n)
      const label = `${kind} n=${n}`
      await measure(`default ${label}`, () => stringifyDefault(arr), n)
      await measure(`json-stringify ${label}`, () => stringifyJson(arr), n)
      await measure(`guard-only ${label}`, () => guardOnly(arr), n)
    }
  }
}

main()
