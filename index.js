'use strict'
const { EventEmitter } = require('node:events')

class AsyncPool extends EventEmitter {
  constructor (options = { maxConcurrent: 5, maxEnqueued: 10 }) {
    super()

    const { maxConcurrent, maxEnqueued } = options
    this.maxConcurrent = maxConcurrent
    this.maxEnqueued = maxEnqueued
    this._queue = []
    this._running = new Set()
    this._draining = false
    this._flushing = false
  }

  run (task) {
    let resolve, reject
    // eslint-disable-next-line promise/param-names
    const promise = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })

    if (this._running.size === this.maxConcurrent || this._draining === true) {
      if (this._queue.length === this.maxEnqueued) {
        process.nextTick(reject, new Error('Too many enqueued tasks'))
      } else if (this._flushing === true) {
        process.nextTick(reject, new Error('Queue is being flushed'))
      } else {
        this._queue.push({ task, resolve, reject, promise })
      }
    } else {
      this._run({ task, resolve, reject, promise })
    }

    return promise
  }

  clear () {
    this._queue = []
  }

  flush () {
    this._flushing = true
    const set = Array.from(this._running.values()).concat(this._queue)
    const promises = []

    for (const task of set) {
      if (task.then != null) promises.push(task)
      else promises.push(task.promise)
    }

    const results = Promise.all(promises)

    results.finally(this._onFlushed.bind(this))

    return results
  }

  // The values are getting drained easily, but values not
  // resolved as expected. Shape this
  drain () {
    this._draining = true
    const set = Array.from(this._running.values())
    const promises = []

    for (const promise of set) {
      promises.push(promise)
    }

    this._running.clear()

    const results = Promise.all(promises)

    results.finally(this._onDrained.bind(this))

    return results
  }

  _onFlushed () {
    this._flushing = false
    this.emit('flushed')
  }

  _onDrained () {
    this._draining = false
    this.emit('drained')
  }

  _run (incoming) {
    const { task, resolve: taskresolve, reject: taskreject } = incoming
    const taskPromise = task()

    taskPromise.then(taskresolve, taskreject)
    taskPromise.finally(this._runNext.bind(this, taskPromise))
    this._running.add(taskPromise)
  }

  _runNext (taskPromise) {
    if (this._running.has(taskPromise)) {
      this._running.delete(taskPromise)
    }

    if (this._queue.length !== 0 && this._draining === false) {
      const nextTask = this._queue.shift()

      if (nextTask) {
        this._run(nextTask)
      }
    } else if (this._flushing === false) {
      this.emit('idle')
    }
  }

  static get AsyncPool () {
    return AsyncPool
  }
}

module.exports = { AsyncPool, default: AsyncPool }
