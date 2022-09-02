# @metcoder95/tiny-pool

Extremely simplistic and tiny AsyncPool for limiting concurrency of async operations.
Contains zero dependencies beside Node.js native ones.

## Examples

### JavaScript

```js
const { AsyncPool } = require('@metcoder95/tiny-pool');
async () => {
  const asyncPool = new AsyncPool({ maxConcurrent: 5, maxEnqueued: 100 });

  asyncPool.on('flushed', () => console.log('queue is flushed'));
  asyncPool.on('drained', () => console.log('pool is drained'));

  for (let i = 0; i < 20; i++) {
    asyncPool.run(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(i);
        }, 1000);
      });
    });

    if (i === 10) {
      const result = await asyncPool.drain();
      console.log('Queue drained:', result);
    } else if (i === 15) {
      const result = await asyncPool.flush();
      console.log('Pool flushed:', result);
    }
  }

  await once(asyncPool, 'idle').then(console.log('done'));
};
```

### TypeScript

```ts
import { AsyncPool, AsyncPoolOptions } from '@metcoder95/tiny-pool';
async () => {
  const options: AsyncPoolOptions = {
    maxEnqueued: 100,
  };
  const asyncPool = new AsyncPool({ maxConcurrent: 5, maxEnqueued: 100 });

  asyncPool.on('flushed', () => console.log('queue is flushed'));
  asyncPool.on('drained', () => console.log('pool is drained'));

  for (let i = 0; i < 20; i++) {
    asyncPool.run(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(i);
        }, 1000);
      });
    });

    if (i === 10) {
      const result = await asyncPool.drain();
      console.log('Queue drained:', result);
    } else if (i === 15) {
      const result = await asyncPool.flush();
      console.log('Pool flushed:', result);
    }
  }

  await once(asyncPool, 'idle').then(console.log('done'));
};
```

## Usage

### Options
```ts
type AsyncPoolOptions = {
  /**
   * Indicates the maximum number of concurrent tasks being executed
   *
   * @default 5
   * @type {number}
   */
  maxConcurrent?: number;
  /**
   * Specifies the maximum number of tasks being enqueued for posterior execution
   * @default 10
   * @type {number}
   */
  maxEnqueued?: number;
};
```

### APIs

#### `run`

**Signature**
`run<Result = unknown>(task: Promise<Result>): AsyncPoolTask<Result>`

Executes the given async task. The task should return a Promise.
The function returns a Promise that will either resolve with the
value returned by the Promise or reject in case of a failure

#### `clear`

**Signature**
`clear(): void`

The function will clear the queue, avoiding the execution of
the tasks within.

#### `flush`
<a id="flush"></a>

**Signature**
`flush(): Promise<AsyncPoolTask[]>`

Will flush all the enqueued and current running tasks
blocking for any new incoming one of being enqueued.
Will emit the event `flushed` once the queue is empty.

#### `drain`
<a id="drain"></a>

**Signature**
`drain(): Promise<AsyncPoolTask[]>`

It will until all the tasks that are currently running are
done being executed. Enqueueing is still possible but it will
not execute any enqueued tasks until the draining is done.
It will emit the event `drained` once done.

### Events

The `AsyncPool` class extends from the [`EventEmitter`](https://nodejs.org/api/events.html#class-eventemitter) from Node.js.
For instance is possible to listen for a couple of events that might be helpful when using the pool.

#### `flushed`

It indicates the full pool has been flushed. Is emitted after the execution of the [`flush`](#flush) function.

#### `drained`

Will be emitted onceall the running tasks are being executed. It's only emitted after the execution of [`drain`](#drain) function.

#### `idle`

Only emitted when the queue is empty and the current tasks finished its execution. This can be a good moment to continue appending more tasks to the pool.
