import { useRef } from 'react';

const none = {};

export function useLazyRef<T>(init: () => T) {
  const ref = useRef<T>(none as unknown as T);
  if (ref.current === none) {
    ref.current = init();
  }
  return ref;
}
