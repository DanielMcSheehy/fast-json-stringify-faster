'use strict'

/**
 * Exhaustive semantic identity: optimized asString vs baseline clone vs JSON.stringify.
 * Run: node EXPERIMENTS/identity-asString.js
 */

// Baseline from feature/speedup HEAD
// eslint-disable-next-line
const STR_ESCAPE = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/

function asStringBaseline (str) {
  const len = str.length
  if (len === 0) {
    return '""'
  } else if (len < 42) {
    let result = ''
    let last = -1
    let point = 255
    for (let i = 0; i < len; i++) {
      point = str.charCodeAt(i)
      if (point === 0x22 || point === 0x5c) {
        last === -1 && (last = 0)
        result += str.slice(last, i) + '\\'
        last = i
      } else if (point < 32 || (point >= 0xD800 && point <= 0xDFFF)) {
        return JSON.stringify(str)
      }
    }
    return (last === -1 && ('"' + str + '"')) || ('"' + result + str.slice(last) + '"')
  } else if (len < 5000 && STR_ESCAPE.test(str) === false) {
    return '"' + str + '"'
  } else {
    return JSON.stringify(str)
  }
}

const Serializer = require('../lib/serializer')
const ser = new Serializer()

function check (label, s) {
  const a = asStringBaseline(s)
  const b = ser.asString(s)
  const c = JSON.stringify(s)
  if (a !== b || a !== c) {
    throw new Error(`${label}: baseline=${a} candidate=${b} JSON=${c}`)
  }
}

let n = 0
check('empty', '')
n++

for (let cp = 0; cp <= 0xFFFF; cp++) {
  check(`u+${cp.toString(16)}`, String.fromCharCode(cp))
  n++
}

const highs = []
const lows = []
for (let h = 0xD800; h <= 0xDBFF; h += 64) highs.push(h)
highs.push(0xD83D)
for (let l = 0xDC00; l <= 0xDFFF; l += 64) lows.push(l)
lows.push(0xDE00)

for (const h of highs) {
  for (const l of lows) {
    check(`pair ${h.toString(16)}-${l.toString(16)}`, String.fromCharCode(h, l))
    n++
  }
}

const mixes = [
  'hello',
  'hel"lo',
  'hel\\lo',
  'a'.repeat(41),
  'a'.repeat(42),
  'a'.repeat(100),
  'a'.repeat(4999),
  'a'.repeat(5000),
  'a'.repeat(41) + '"',
  'a'.repeat(42) + '"',
  '\uD83D\uDE00'.repeat(10),
  'x\u0000y',
  'line\nbreak'
]
for (const s of mixes) {
  check('mix', s)
  n++
}

console.log(`OK: ${n} strings identical across baseline, optimized asString, JSON.stringify`)
