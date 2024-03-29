export class AssertError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

export let assertCount = 1
export let passCount = 0
export let failCount = 0
export let errorCount = 0

export const deindent = console.groupEnd

export function indent(msg) {
  console.group('#', msg)
}

export function log(msg) {
  console.log('#', msg)
}

export function error(err) {
  errorCount++
  console.error(err)
}

export function ok(msg) {
  passCount++
  console.log('ok', assertCount++, msg)
}

export function notOk(msg, detail) {
  failCount++
  const length =
    Object.keys(detail).reduce(
      (max, o) => (o.length > max ? o.length : max),
      0
    ) + 1
  console.log(
    'not ok',
    assertCount++,
    msg,
    '\n  ---\n',
    ...Object.entries(detail).reduce(
      (o, [key, value]) => (
        o.push('    ' + (key + ':').padEnd(length), value, '\n'), o
      ),
      []
    ),
    ' ...\n'
  )
  throw new AssertError(msg)
}

export function done() {
  console.log(`
1..${assertCount - 1}
# tests ${assertCount - 1}
# pass  ${passCount}
${failCount ? '# fail  ' + failCount : ''}
${errorCount ? '# error ' + errorCount : !failCount ? '# ok' : ''}`)
}
