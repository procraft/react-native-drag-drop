import { useCallback, type DependencyList } from 'react';
import type { SharedValue } from 'react-native-reanimated';

export function useSharedCallback<T, A extends unknown[]>(
  value: SharedValue<T>,
  cb: (v: T, ...args: A) => T | void,
  deps: DependencyList,
  forceUpdate?: boolean
) {
  return useCallback(
    (...args: A) => {
      'worklet';
      value.modify((v) => {
        'worklet';
        const result = cb(v, ...args);
        if (result !== undefined) {
          return result;
        }
        return v;
      }, forceUpdate);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cb, value, ...deps]
  );
}
