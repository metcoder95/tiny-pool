import { expectAssignable, expectType } from 'tsd';
import { AsyncPool, AsyncPoolOptions } from '..';

expectAssignable<AsyncPoolOptions>({
  maxConcurrent: 10,
  maxEnqueued: 1,
});

expectAssignable<AsyncPoolOptions>({
  maxEnqueued: 1,
});

expectAssignable<AsyncPoolOptions>({
  maxConcurrent: 1,
});

expectType<AsyncPool>(new AsyncPool());

expectType<typeof AsyncPool>(AsyncPool);
