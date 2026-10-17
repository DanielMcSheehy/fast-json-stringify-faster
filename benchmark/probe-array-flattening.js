'use strict'

// Run with node --allow-natives-syntax. Intrinsics are strings to keep ESLint portable.
const debugPrint = new Function('s', '%DebugPrint(s)') // eslint-disable-line no-new-func
const flatten = new Function('s', 'return %FlattenString(s)') // eslint-disable-line no-new-func
function rope () {
  let value = ''
  for (let i = 0; i < 100; i++) value += `abcdefghijklm${i}`
  return value
}
for (const [name, operation] of [
  ['concat-empty', s => s.concat('')],
  ['length-touch', s => { const length = s.length; if (!length) throw new Error('Empty rope'); return s }],
  ['native-flatten', s => flatten(s)]
]) {
  const value = rope()
  console.log(`${name}: before`)
  debugPrint(value)
  console.log(`${name}: after`)
  debugPrint(operation(value))
}
