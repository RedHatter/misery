import * as report from './report.js'

export function wait(ms) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}

export function plan(count) {
  const initial = report.assertCount
  Promise.resolve().then(
    () =>
      report.assertCount - initial != count &&
      report.notOk('unexpected number of assertions', {
        operator: 'plan',
        expected: count,
        actual: report.assertCount - initial
      })
  )
}

export function fail(msg) {
  report.notOk(msg, { operator: 'fail' })
}

export function ok(condition, msg = 'should be truthy') {
  if (condition) report.ok(msg)
  else report.notOk(msg, { operator: 'ok', expected: true, actual: condition })
}

export function equal(actual, expected, msg = 'should be equal') {
  if (expected == actual) report.ok(msg)
  else report.notOk(msg, { operator: 'equal', expected, actual })
}

export function notEqual(actual, expected, msg = 'should not be equal') {
  if (expected != actual) report.ok(msg)
  else report.notOk(msg, { operator: 'equal', expected, actual })
}

export function snapshot(actual, name, msg = 'should match snapshot') {
  if (!('snapshotIndex' in this.__metadata)) this.__metadata.snapshotIndex = 0

  const id = `misery snapshot: ${this.__metadata.desc}: ${name ||
    this.__metadata.snapshotIndex++}`
  const expected = localStorage.getItem(id)
  if (expected == null) {
    localStorage.setItem(id, JSON.stringify(actual))
    report.ok(msg)
    report.log('Empty snapshot set')
  } else if (expected == JSON.stringify(actual)) {
    report.ok(msg)
  } else {
    report.log('To update snapshot clear localStorage and re-run test')
    report.notOk(msg, {
      operator: 'snapshot',
      expected: JSON.parse(expected),
      actual
    })
  }
}
