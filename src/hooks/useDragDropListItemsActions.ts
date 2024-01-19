import { useCallback } from 'react';
import {
  type MeasuredDimensions,
  type SharedValue,
} from 'react-native-reanimated';
import type { DragDropAreaHandler } from '../handlers';
import {
  SDLAddItemAfter,
  SDLAddItemBefore,
  SDLMoveItemAfter,
  SDLMoveItemBefore,
  SDLRemoveItem,
  type DoublyLinkedList,
} from '../helpers';
import type { DragDropItemId, DragDropItemType, ItemPosition } from '../types';
import { useSharedMap } from './useSharedMap';

export function useDragDropListItemsActions<T>(
  itemsListShared: SharedValue<DoublyLinkedList<DragDropItemType<T>>>,
  findNeighboursItem: (
    itemId: string | number,
    hoverMeasurement: MeasuredDimensions
  ) => ItemPosition | null,
  onRemoveItem?: (itemId: DragDropItemId) => void
) {
  const [movingIds, addMovingId, removeMovingId] = useSharedMap<
    DragDropItemId,
    null
  >({});

  const isItemMoved = useCallback(
    (position: ItemPosition | null) => {
      'worklet';
      if (position?.afterId != null) {
        return position?.afterId in movingIds.value;
      }
      if (position?.beforeId != null) {
        return position?.beforeId in movingIds.value;
      }
      return false;
    },
    [movingIds]
  );

  const itemMoved = useCallback<DragDropAreaHandler<T>['itemMoved']>(
    (item, hoverMeasurement) => {
      'worklet';
      const movedResult = findNeighboursItem(item.id, hoverMeasurement);

      const listItem = itemsListShared.value.nodes[item.id];
      const canMove =
        movedResult == null
          ? false
          : !isItemMoved(movedResult) && listItem != null;
      if (
        canMove &&
        movedResult?.afterId !== undefined &&
        listItem!.prevId !== movedResult.afterId
      ) {
        SDLMoveItemAfter(itemsListShared, [item.id, movedResult.afterId], true);
        if (movedResult.afterId != null) {
          addMovingId(movedResult.afterId, null);
        }
      } else if (
        canMove &&
        movedResult?.beforeId !== undefined &&
        listItem!.nextId !== movedResult.beforeId
      ) {
        SDLMoveItemBefore(
          itemsListShared,
          [item.id, movedResult.beforeId],
          true
        );
        if (movedResult.beforeId != null) {
          addMovingId(movedResult.beforeId, null);
        }
      } else {
        return null;
      }
      return movedResult;
    },
    [addMovingId, findNeighboursItem, isItemMoved, itemsListShared]
  );

  const tryPutItem = useCallback<DragDropAreaHandler<T>['tryPutItem']>(
    (item, hoverMeasurement) => {
      'worklet';
      const movedResult = findNeighboursItem(item.id, hoverMeasurement);
      if (movedResult?.afterId !== undefined) {
        SDLAddItemAfter(
          itemsListShared,
          [item.id, item, movedResult.afterId],
          true
        );
      } else if (movedResult?.beforeId !== undefined) {
        SDLAddItemBefore(
          itemsListShared,
          [item.id, item, movedResult.beforeId],
          true
        );
      }
      return movedResult;
    },
    [findNeighboursItem, itemsListShared]
  );

  const removeItem = useCallback<DragDropAreaHandler<T>['removeItem']>(
    (itemId) => {
      'worklet';
      removeMovingId(itemId);
      onRemoveItem?.(itemId);
      SDLRemoveItem(itemsListShared, [itemId]);
    },
    [itemsListShared, onRemoveItem, removeMovingId]
  );

  const onTransitionDone = useCallback(
    (id: DragDropItemId) => {
      'worklet';
      removeMovingId(id);
    },
    [removeMovingId]
  );

  return { itemMoved, tryPutItem, removeItem, onTransitionDone };
}
