import { useMemo } from 'react';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import { toModify } from '../utils';

export function useSharedMap<T extends string | number | symbol, V>(
  initial: Record<T, V>
): [
  itemsMap: SharedValue<Record<T, V>>,
  setItem: (id: T, value: V) => void,
  removeItem: (id: T) => void
] {
  const itemsMap = useSharedValue<Record<T, V>>(initial);
  const setItem = useMemo(
    () =>
      toModify(
        itemsMap,
        (v, id: T, value: V) => {
          'worklet';
          v[id] = value;
        },
        true
      ),
    [itemsMap]
  );
  const removeItem = useMemo(
    () =>
      toModify(
        itemsMap,
        (v, id: T) => {
          'worklet';
          delete v[id];
        },
        true
      ),
    [itemsMap]
  );

  return [itemsMap, setItem, removeItem];
}
