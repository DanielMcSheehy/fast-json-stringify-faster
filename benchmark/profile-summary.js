'use strict'

// node benchmark/profile-summary.js profile.cpuprofile workload-window.json
// Self time uses time deltas between the first/last measureWorkload stack samples.
// This excludes setup/warmup while retaining GC samples inside the measured phase.
const { readFileSync } = require('node:fs')
const { gunzipSync } = require('node:zlib')
const path = require('node:path')

function summarize (profile, window) {
  const nodeById = new Map(profile.nodes.map(node => [node.id, node]))
  const measuredIds = new Set()
  function visit (id) {
    measuredIds.add(id)
    for (const child of nodeById.get(id).children || []) visit(child)
  }
  for (const node of profile.nodes) {
    if (node.callFrame.functionName === 'measureWorkload') visit(node.id)
  }
  const first = profile.samples.findIndex(id => measuredIds.has(id))
  const last = profile.samples.findLastIndex(id => measuredIds.has(id))
  if (first === -1) throw new Error('No measureWorkload stack samples in profile')
  const nodes = new Map(profile.nodes.map(node => [node.id, node.callFrame]))
  const totals = new Map()
  let total = 0
  let samples = 0
  for (let i = first; i <= last; i++) {
    const weight = profile.timeDeltas[i]
    if (weight <= 0) continue
    const frame = nodes.get(profile.samples[i])
    let file = frame.url.replace(/^file:\/\//, '')
    if (file.startsWith(process.cwd() + path.sep)) file = path.relative(process.cwd(), file)
    if (!file) file = frame.scriptId === '0' ? '(V8)' : '(generated code / eval)'
    const name = frame.functionName || '(anonymous)'
    const line = frame.lineNumber + 1
    const key = JSON.stringify([name, file, line])
    const row = totals.get(key) || { name, file, line, selfUs: 0 }
    row.selfUs += weight
    totals.set(key, row)
    total += weight
    samples++
  }
  if (Math.abs(total - (window.endUs - window.startUs)) > 50000) {
    throw new Error('Sampled phase duration differs from workload wall time by more than 50 ms')
  }
  const functions = [...totals.values()].sort((a, b) => b.selfUs - a.selfUs).map(row => ({ ...row, percent: row.selfUs / total * 100 }))
  return { ...window, sampledUs: total, samples, functions }
}

if (require.main === module) {
  const [profileFile, windowFile] = process.argv.slice(2)
  const bytes = readFileSync(profileFile)
  const profile = JSON.parse(profileFile.endsWith('.gz') ? gunzipSync(bytes) : bytes)
  console.log(JSON.stringify(summarize(profile, JSON.parse(readFileSync(windowFile))), null, 2))
}

module.exports = summarize
