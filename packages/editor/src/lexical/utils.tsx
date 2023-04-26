import { type Accessor } from 'solid-js';

export type MaybeAccessor<T> = T | Accessor<T>;

export function resolve<T>(t: MaybeAccessor<T>): T {
  if (typeof t === 'function') {
    // @ts-expect-error T itself can be a function without being accessor, T needs to be restricted in type
    return t();
  } else {
    return t;
  }
}
