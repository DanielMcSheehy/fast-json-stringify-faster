'use strict'

const path = require('path')
const { Worker } = require('worker_threads')

const BENCH_THREAD_PATH = path.join(__dirname, 'bench-thread.js')

const SIZES = [1e3, 2e4, 1e5, 1e6]
const LONG_STRING_LENGTH = 200

function getRandomInt (max) {
  return Math.floor(Math.random() * max)
}

function makeLongString () {
  let s = ''
  for (let i = 0; i < LONG_STRING_LENGTH; i++) {
    s += i
    if (i % 50 === 0) s += '"'
  }
  return s
}

const longString = makeLongString()

function makeArray (size, kind) {
  const arr = new Array(size)
  for (let i = 0; i < size; i++) {
    switch (kind) {
      case 'integer':
        arr[i] = getRandomInt(1000)
        break
      case 'number':
        arr[i] = getRandomInt(1000) + 0.5
        break
      case 'short string':
        arr[i] = 'hello world'
        break
      case 'long string':
        arr[i] = longString
        break
      case 'flat object':
        arr[i] = { s: 'hello world', n: 42, b: true }
        break
      case 'nested object':
        arr[i] = { a: { b: { c: i } }, n: 42 }
        break
      default:
        throw new Error(`unknown kind ${kind}`)
    }
  }
  return arr
}

const kinds = [
  {
    name: 'integer',
    schemaItems: { type: 'integer' }
  },
  {
    name: 'number',
    schemaItems: { type: 'number' }
  },
  {
    name: 'short string',
    schemaItems: { type: 'string' }
  },
  {
    name: 'long string',
    schemaItems: { type: 'string' }
  },
  {
    name: 'flat object',
    schemaItems: {
      type: 'object',
      properties: {
        s: { type: 'string' },
        n: { type: 'number' },
        b: { type: 'boolean' }
      }
    }
  },
  {
    name: 'nested object',
    schemaItems: {
      type: 'object',
      properties: {
        a: {
          type: 'object',
          properties: {
            b: {
              type: 'object',
              properties: {
                c: { type: 'integer' }
              }
            }
          }
        },
        n: { type: 'number' }
      }
    }
  }
]

const mechanisms = [
  { label: 'default', options: { largeArrayMechanism: 'default' } },
  { label: 'json-stringify', options: { largeArrayMechanism: 'json-stringify', largeArraySize: 1 } },
  { label: 'JSON.stringify', native: true }
]

const benchmarks = []

for (const size of SIZES) {
  for (const kind of kinds) {
    // Cap 1e6 nested/flat object runs only when explicitly wanted; still include them
    // but skip extreme memory for nested at 1e6 if needed — keep all for contract.
    const input = makeArray(size, kind.name)
    for (const mech of mechanisms) {
      const name = `array/${kind.name}/n=${size}/${mech.label}`
      if (mech.native) {
        benchmarks.push({
          name,
          native: true,
          input
        })
      } else {
        benchmarks.push({
          name,
          schema: { type: 'array', items: kind.schemaItems },
          options: mech.options,
          input
        })
      }
    }
  }
}

async function runBenchmark (benchmark) {
  if (benchmark.native) {
    const { Bench } = require('tinybench')
    const bench = new Bench({
      name: benchmark.name,
      setup: (_task, mode) => {
        if (mode === 'warmup' && typeof globalThis.gc === 'function') {
          globalThis.gc()
        }
      }
    })
    const input = benchmark.input
    bench.add(benchmark.name, () => {
      Buffer.byteLength(JSON.stringify(input))
    })
    await bench.run()
    const task = bench.tasks[0]
    const hz = task.result.throughput.mean
    const rme = task.result.latency.rme
    const samples = task.result.latency.df + 1
    return `${task.name} x ${hz.toLocaleString('en-US', { maximumFractionDigits: 0 })} ops/sec ±${rme.toFixed(2)}% (${samples} runs sampled)`
  }

  const worker = new Worker(BENCH_THREAD_PATH, { workerData: benchmark })
  return new Promise((resolve, reject) => {
    let result = null
    worker.on('error', reject)
    worker.on('message', (benchResult) => {
      result = benchResult
    })
    worker.on('exit', (code) => {
      if (code === 0) resolve(result)
      else reject(new Error(`Worker stopped with exit code ${code}`))
    })
  })
}

async function runBenchmarks () {
  let maxNameLength = 0
  for (const benchmark of benchmarks) {
    maxNameLength = Math.max(benchmark.name.length, maxNameLength)
  }

  for (const benchmark of benchmarks) {
    benchmark.name = benchmark.name.padEnd(maxNameLength, '.')
    const resultMessage = await runBenchmark(benchmark)
    console.log(resultMessage)
  }
}

runBenchmarks().catch((err) => {
  console.error(err)
  process.exit(1)
})
