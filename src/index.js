import { AssertError, indent, deindent, log, plan } from './report.js'
import * as assert from './assert.js'

function _test(list, desc, spec) {
  if (!spec) {
    log('TODO ' + desc)
    return
  }

  list.push(async () => {
    indent(desc)
    await spec(assert)
    list.push(deindent)
  })
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

let queue = []
export async function run() {
  log('TAP version 13')
  let fn = () => {}

  while (fn) {
    try {
      await fn()
    } catch (err) {
      if (!(err instanceof AssertError)) console.error(err)
      log('Aborting test, see above')
      deindent()
    }

    queue.unshift(...(only.length ? only : normal))
    only.length = 0
    normal.length = 0
    fn = queue.shift()
  }

  plan()
}

Promise.resolve().then(run)
