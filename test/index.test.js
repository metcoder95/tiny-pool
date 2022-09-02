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

tap.test('AsyncPool#run', subtest => {
  subtest.plan(4)

  subtest.test('Should run and tight to a single task', async t => {
    t.plan(1)
    const pool = new AsyncPool()
    const list = []
    const expectedList = []
    const getTask = num => async () => {
      await sleep(100)
      return num
    }

    for (let i = 0; i < 10; i++) {
      list.push(pool.run(getTask(i)))
      expectedList.push(i)
    }

    // No need to wait for idle as the pool will be empty after
    // this statement.
    const result = await Promise.all(list)
    t.same(result, expectedList)
  })

  subtest.test('Should run tasks in order', async t => {
    t.plan(1)
    const pool = new AsyncPool()
    const list = []
    const expectedList = []
    const getTask = num => async () => {
      await sleep(100)
      return num
    }

    for (let i = 0; i < 10; i++) {
      expectedList.push(i)
      pool.run(getTask(i)).then(list.push.bind(list))
    }

    await once(pool, 'idle')
    t.same(list, expectedList)
  })

  subtest.test(
    'Should throw if the queue and running queue is full',
    async t => {
      t.plan(2)
      const pool = new AsyncPool({ maxEnqueued: 1, maxConcurrent: 1 })
      const getTask = num => async () => {
        await sleep(100)
        return num
      }

      try {
        pool.run(getTask(1))
        pool.run(getTask(2))
        await pool.run(getTask(3))
      } catch (err) {
        t.ok(err instanceof Error, true)
        t.equal(err.message, 'Too many enqueued tasks')
      }

      await once(pool, 'idle')
    }
  )

  subtest.test('Should throw if queue if pool is being flushed', async t => {
    t.plan(2)
    const pool = new AsyncPool({ maxConcurrent: 1 })
    const getTask = num => async () => {
      await sleep(500)
      return num
    }

    try {
      pool.run(getTask(1))
      pool.run(getTask(2))
      pool.flush()
      await pool.run(getTask(3))
    } catch (err) {
      t.ok(err instanceof Error, true)
      t.equal(err.message, 'Queue is being flushed')
    }

    await once(pool, 'flushed')
  })
})

tap.test('AsyncPool#flush', { todo: true })
tap.test('AsyncPool#drain', { todo: true })
