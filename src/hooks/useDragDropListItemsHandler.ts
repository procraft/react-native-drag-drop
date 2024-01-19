import { useCallback, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import type { DragDropItemHandlerMap, RegisterItemHandler } from '../handlers';
import { toModify } from '../utils';

function addItem<T>(
  v: DragDropItemHandlerMap<T>,
  ...args: Parameters<RegisterItemHandler<T>>
) {
  'worklet';
  const [id, handler] = args;
  v[id] = handler;
}

function removeItem<T>(v: DragDropItemHandlerMap<T>, id: number | string) {
  'worklet';
  delete v[id];
}

export function useDragDropListItemsHandler<T>() {
  const handlers = useSharedValue<DragDropItemHandlerMap<T>>({});

  const addItemHandler = useMemo(
    () => toModify(handlers, addItem, true),
    [handlers]
  );
  const removeItemHandler = useMemo(
    () => toModify(handlers, removeItem, true),
    [handlers]
  );

  const registerItemHandler = useCallback<RegisterItemHandler<T>>(
    (id, handler) => {
      addItemHandler(id, handler);

      return () => {
        removeItemHandler(id);
      };
    },
    [addItemHandler, removeItemHandler]
  );

  return { handlers, registerItemHandler, removeItemHandler };
}
