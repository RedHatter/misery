export let assertCount = 1

export const deindent = console.groupEnd

export function indent(msg) {
  console.group('#', msg)
}

export function log(msg) {
  console.log('#', msg)
}

export function ok(msg) {
  console.log('ok', assertCount++, msg)
}

export function notOk(msg, detail) {
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
  throw new Error()
}

export function plan() {
  console.log('1..' + (assertCount - 1))
}
