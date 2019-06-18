import { AssertError, indent, deindent, log, error, done } from './report.js'
import * as assert from './assert.js'

let currentContext = { ...assert, __metadata: { desc: '' } }

function _test(list, desc, spec) {
  if (!spec) {
    log('TODO ' + desc)
    return
  }

  const fn = async () => {
    indent(desc)
    const parentContext = currentContext
    const context = {
      ...currentContext,
      __metadata: {
        desc: `${parentContext.__metadata.desc}${desc}: `
      }
    }

    currentContext = context
    const parentDesc = parentContext.__metadata.desc
    parentContext.__metadata.desc += desc
    await spec(parentContext)
    parentContext.__metadata.desc = parentDesc
    getList().push(() => {
      deindent()
      currentContext = parentContext
    })
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

function getList () {
  return only.length ? only : normal
}

export function before(fn) {
  const context = currentContext
  Promise.resolve().then(() => getList().unshift(() => fn(context)))
}

export function after(fn) {
  const context = currentContext
  Promise.resolve().then(() => getList().push(() => fn(context)))
}

export function beforeEach(fn) {
  const context = currentContext
  Promise.resolve().then(() => {
    for (let i = normal.length - 1; i >= 0; i--) {
      if (normal[i].isTest) normal.splice(i, 0, () => fn(context))
    }

    for (let i = only.length - 1; i >= 0; i--) {
      if (only[i].isTest) only.splice(i, 0, () => fn(context))
    }
  })
}

export function afterEach(fn) {
  const context = currentContext
  Promise.resolve().then(() => {
    for (let i = normal.length - 1; i >= 0; i--) {
      if (normal[i].isTest) normal.splice(i + 1, 0, () => fn(context))
    }

    for (let i = only.length - 1; i >= 0; i--) {
      if (only[i].isTest) only.splice(i + 1, 0, () => fn(context))
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

    queue.unshift(...getList())
    only.length = 0
    normal.length = 0
    fn = queue.shift()
  }

  done()
}

Promise.resolve().then(run)
