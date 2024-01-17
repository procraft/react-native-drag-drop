import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Component,
} from 'react';
import {
  measure,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  type AnimatedRef,
} from 'react-native-reanimated';
import { DragDropContext } from '../contexts';
import type { DragDropAreaHandler } from '../handlers';
import {
  DLAddItem,
  DLCreate,
  DLToArray,
  SDLAddItemAfter,
  SDLAddItemBefore,
  SDLMoveItemAfter,
  SDLMoveItemBefore,
  SDLRemoveItem,
  type DoublyLinkedList,
} from '../helpers';
import type { DragDropItemType } from '../types';
import type { DragDropAreaConfig } from '../types/DragDropAreaConfig';

export type useDragDropAreaHandlers<T> = {
  measureItem: DragDropAreaHandler<T>['measureItem'];
  itemMoved: DragDropAreaHandler<T>['itemMoved'];
  tryPutItem: DragDropAreaHandler<T>['tryPutItem'];
  removeItem: DragDropAreaHandler<T>['removeItem'];
};

export interface useDragDropAreaReturn<T> {
  areaId: number;
  items: DragDropItemType<T>[];
}

export function useDragDropArea<T, TComponent extends Component>(
  areaRef: AnimatedRef<TComponent>,
  initialItems: T[],
  extractId: (item: T) => number | string,
  handlerCallbacks: useDragDropAreaHandlers<T>,
  config?: DragDropAreaConfig
): useDragDropAreaReturn<T> {
  const { registerDragDropArea, removeDragDropArea } =
    useContext(DragDropContext);

  const [itemsListInit] = useState(() => {
    const list: DoublyLinkedList<DragDropItemType<T>> = DLCreate();
    for (const item of initialItems) {
      const dragItem: DragDropItemType<T> = { id: extractId(item), data: item };
      DLAddItem(list, extractId(item), dragItem);
    }
    return list;
  });
  const [items, setItems] = useState<DragDropItemType<T>[]>(() =>
    DLToArray(itemsListInit)
  );
  const itemsList = useSharedValue(itemsListInit);

  useDerivedValue(() => {
    const itemsLocal = DLToArray(itemsList.value);
    console.log(
      'SET ITEMS',
      itemsLocal.map((i) => i.id)
    );
    runOnJS(setItems)(itemsLocal);
  }, [itemsList, setItems]);

  const measureArea = useCallback(() => {
    'worklet';
    return measure(areaRef);
  }, [areaRef]);

  const itemMovedCb = handlerCallbacks.itemMoved;
  const itemMoved = useCallback<DragDropAreaHandler<T>['itemMoved']>(
    (item, hoverMeasurement) => {
      'worklet';
      const movedResult = itemMovedCb(item, hoverMeasurement);

      const listItem = itemsList.value.nodes[item.id];
      if (movedResult?.[1] !== undefined) {
        if (listItem != null && listItem.prevId !== movedResult[1]) {
          SDLMoveItemAfter(itemsList, [item.id, movedResult[1]], true);
        }
      } else if (movedResult?.[2] !== undefined) {
        if (listItem != null && listItem.nextId !== movedResult[2]) {
          SDLMoveItemBefore(itemsList, [item.id, movedResult[2]], true);
        }
      } else {
        return null;
      }
      return movedResult;
    },
    [itemsList, itemMovedCb]
  );

  const tryPutItemCb = handlerCallbacks.tryPutItem;
  const tryPutItem = useCallback<DragDropAreaHandler<T>['tryPutItem']>(
    (item, hoverMeasurement) => {
      'worklet';
      const movedResult = tryPutItemCb(item, hoverMeasurement);
      if (movedResult?.[0] !== undefined) {
        SDLAddItemAfter(itemsList, [item.id, item, movedResult[0]]);
      } else if (movedResult?.[1] !== undefined) {
        SDLAddItemBefore(itemsList, [item.id, item, movedResult[1]]);
      } else {
        return null;
      }
      return movedResult;
    },
    [itemsList, tryPutItemCb]
  );

  const removeItemCb = handlerCallbacks.removeItem;
  const removeItem = useCallback<DragDropAreaHandler<T>['removeItem']>(
    (itemId) => {
      'worklet';
      removeItemCb(itemId);
      SDLRemoveItem(itemsList, [itemId]);
    },
    [itemsList, removeItemCb]
  );

  const handler = useMemo<DragDropAreaHandler<T>>(
    () => ({
      groupId: config?.groupId,
      axis: {
        horizontal: config?.axis?.horizontal ?? true,
        vertical: config?.axis?.vertical ?? true,
      },
      measure: measureArea,
      measureItem: handlerCallbacks.measureItem,
      itemMoved,
      tryPutItem,
      removeItem,
    }),
    [
      config?.groupId,
      config?.axis,
      measureArea,
      handlerCallbacks.measureItem,
      itemMoved,
      tryPutItem,
      removeItem,
    ]
  );

  const areaId = useMemo(
    () => registerDragDropArea(handler as DragDropAreaHandler<unknown>),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handler, registerDragDropArea, removeDragDropArea]
  );
  useEffect(
    () => () => {
      removeDragDropArea(areaId);
    },
    [areaId, removeDragDropArea]
  );

  return { areaId, items };
}
