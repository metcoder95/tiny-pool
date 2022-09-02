/// <reference types="node" />
import { EventEmitter } from 'node:events';

declare class AsyncPool extends EventEmitter {
  constructor(options?: AsyncPoolOptions);
  /**
   * Executes the given async task. The task should return a Promise.
   * The function returns a Promise that will either resolve with the
   * value returned by the Promise or reject in case of a failure
   * @template Result
   * @param {Promise<Result>} task
   * @return {Promise}  {AsyncPoolTask<Result>}
   * @memberof AsyncPool
   */
  run<Result = unknown>(task: Promise<Result>): AsyncPoolTask<Result>
  /**
   *
   * The function will clear the queue, avoiding the execution of
   * the tasks within.
   * @memberof AsyncPool
   */
  clear(): void
  /**
   * Will flush all the enqueued and current running tasks
   * blocking for any new incoming one of being enqueued.
   * Will emit the event `flushed` once the queue is empty.
   * @return {Promise}  {Promise<AsyncPoolTask[]>}
   * @memberof AsyncPool
   */
  flush(): Promise<AsyncPoolTask[]>
  /**
   * It will until all the tasks that are currently running are
   * done being executed. Enqueueing is still possible but it will
   * not execute any enqueued tasks until the draining is done.
   * It will emit the event `drained` once done.
   * @return {Promise}  {Promise<AsyncPoolTask[]>}
   * @memberof AsyncPool
   */
  drain(): Promise<AsyncPoolTask[]>
}

type AsyncPoolOptions = {
  /**
   * Indicates the maximum number of concurrent tasks being executed
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

type AsyncPoolTask<Result = unknown> = PromiseLike<Result>

export default AsyncPool;
export { AsyncPoolOptions, AsyncPool };
