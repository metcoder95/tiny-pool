'use strict'
const { once } = require('node:events')
const tap = require('tap')
const semver = require('semver')
const { AsyncPool } = require('..')

function sleep (ms) {
  if (semver.satisfies(process.version, '>=16')) {
    const { setTimeout } = require('node:timers/promises')

    return setTimeout(ms)
  }

  return new Promise(resolve => setTimeout(resolve, ms))
}

tap.plan(4)

tap.test('AsyncPool#class', subtest => {
  subtest.plan(2)

  subtest.test('Instance should have prototype of AsyncPool', t => {
    t.plan(2)
    const pool = new AsyncPool()
    t.ok(pool instanceof AsyncPool, true)
    t.ok(Object.getPrototypeOf(pool) === AsyncPool.prototype, true)
  })

  subtest.test('AsyncPool#Clear should clear the queue', async t => {
    t.plan(1)
    const pool = new AsyncPool()

    for (let i = 0; i < 10; i++) {
      pool.run(() => sleep(100))
    }

    pool.clear()

    t.ok(pool._queue.length === 0, true)
    await once(pool, 'idle')
  })
})

tap.test('AsyncPool#run', { todo: true })
tap.test('AsyncPool#flush', { todo: true })
tap.test('AsyncPool#drain', { todo: true })
