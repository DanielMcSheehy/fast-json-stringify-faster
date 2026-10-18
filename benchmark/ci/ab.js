'use strict'
// A/B: main ($MAIN_DIR) vs candidate ($CAND_DIR). Alternating rounds, median ops/s.
// Usage: MAIN_DIR=... CAND_DIR=... node benchmark/ci/ab.js <rounds> <sizes csv> <kinds csv>
const path = require('node:path')
const { Bench } = require('tinybench')
const buildMain = require(path.resolve(process.env.MAIN_DIR || '../fjs-main'))
const buildBranch = require(path.resolve(process.env.CAND_DIR || '.'))
const rounds = Number(process.argv[2] || 8)
const sizes = (process.argv[3] || '32,48,64,100,256,512,1000,10000,100000,300000,1000000').split(',').map(Number)
const kinds = (process.argv[4] || 'intnum,float,integer,mixed').split(',')

function fixture (kind, size) {
  const n = { type: 'array', items: { type: 'number' } }
  const int = { type: 'array', items: { type: 'integer' } }
  switch (kind) {
    case 'intnum': return { schema: n, input: Array.from({ length: size }, (_, i) => (i % 2001) - 1000) }
    case 'mixed': return { schema: n, input: Array.from({ length: size }, (_, i) => i % 2 ? i : i + 0.5) }
    case 'float': return { schema: n, input: Array.from({ length: size }, (_, i) => ((i % 2001) - 1000) / 10) }
    case 'integer': return { schema: int, input: Array.from({ length: size }, (_, i) => (i % 2001) - 1000) }
    default: throw new Error(kind)
  }
}
async function one (fn, input, size) {
  const bench = new Bench({ time: size >= 1e5 ? 400 : 150, warmupTime: 50, throws: true })
  bench.add('x', () => { Buffer.byteLength(fn(input)) })
  await bench.run()
  return bench.tasks[0].result.throughput.p50
}
function median (a) { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1] }
async function main () {
  console.log(`node ${process.version} ${process.arch} ${require('node:os').cpus()[0].model}`)
  console.log('| kind | size | main ops/s | branch ops/s | delta |\n|---|---:|---:|---:|---:|')
  for (const kind of kinds) {
    for (const size of sizes) {
      const { schema, input } = fixture(kind, size)
      const a = buildMain(schema); const b = buildBranch(schema)
      if (a(input) !== b(input)) throw new Error('mismatch')
      const ma = []; const mb = []
      for (let r = 0; r < rounds; r++) {
        if (r % 2) { mb.push(await one(b, input, size)); ma.push(await one(a, input, size)) } else { ma.push(await one(a, input, size)); mb.push(await one(b, input, size)) }
      }
      const A = median(ma); const B = median(mb)
      console.log(`| ${kind} | ${size} | ${A.toFixed(0)} | ${B.toFixed(0)} | ${((B / A - 1) * 100).toFixed(1)}% |`)
    }
  }
}
main()
