import { AssertError, indent, deindent, log, error, done } from './report.js'
import * as assert from './assert.js'

function _test(list, desc, spec) {
  if (!spec) {
    log('TODO ' + desc)
    return
  }

  const fn = async () => {
    indent(desc)
    await spec(assert)
    list.push(deindent)
  }

  fn.isTest = true

  list.push(fn)
}

let normal = []
export function test(desc, spec) {
  _test(normal, desc, spec)
}

let only = []
test.only = function(desc, spec) {
  _test(only, desc, spec)
}

test.skip = function(desc) {
  log('SKIP ' + desc)
}

export { test as describe, test as it, test as default }

export function before(fn) {
  Promise.resolve().then(() =>
    (only.length ? only : normal).unshift(() => fn(assert))
  )
}

export function after(fn) {
  Promise.resolve().then(() =>
    (only.length ? only : normal).push(() => fn(assert))
  )
}

export function beforeEach(fn) {
  Promise.resolve().then(() => {
    for (let i = normal.length - 1; i >= 0; i--) {
      if (normal[i].isTest) normal.splice(i, 0, () => fn(assert))
    }

    for (let i = only.length - 1; i >= 0; i--) {
      if (only[i].isTest) only.splice(i, 0, () => fn(assert))
    }
  })
}

export function afterEach(fn) {
  Promise.resolve().then(() => {
    for (let i = normal.length - 1; i >= 0; i--) {
      if (normal[i].isTest) normal.splice(i + 1, 0, () => fn(assert))
    }

    for (let i = only.length - 1; i >= 0; i--) {
      if (only[i].isTest) only.splice(i + 1, 0, () => fn(assert))
    }
  })
}

let queue = []
export async function run() {
  log('TAP version 13')
  let fn = () => {}

  while (fn) {
    try {
      await fn()
    } catch (err) {
      if (!(err instanceof AssertError)) error(err)
      log('Aborting test, see above')
      deindent()
    }

    queue.unshift(...(only.length ? only : normal))
    only.length = 0
    normal.length = 0
    fn = queue.shift()
  }

  done()
}

Promise.resolve().then(run)
