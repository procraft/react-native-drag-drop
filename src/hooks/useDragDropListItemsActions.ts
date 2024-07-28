import { modify } from '@procraft/react-native-autoscroll';
import { useCallback, useContext, useMemo } from 'react';
import {
  useDerivedValue,
  useSharedValue,
  type MeasuredDimensions,
  type SharedValue,
} from 'react-native-reanimated';
import { DragDropContext } from '../contexts';
import type { DragDropAreaHandler } from '../handlers';
import {
  SDLAddItemAfter,
  SDLAddItemBefore,
  SDLMoveItemAfter,
  SDLMoveItemBefore,
  SDLRemoveItem,
  SDLSwapItems,
  type DoublyLinkedList,
} from '../helpers';
import type {
  DragDropAreaConfigMode,
  DragDropItemId,
  DragDropItemType,
  ItemPosition,
} from '../types';
import { useSharedMap } from './useSharedMap';

export function useDragDropListItemsActions<T>(
  itemsListShared: SharedValue<DoublyLinkedList<DragDropItemType<T>>>,
  mode: DragDropAreaConfigMode,
  findNeighboursItem: (
    itemId: string | number,
    hoverMeasurement: MeasuredDimensions
  ) => ItemPosition | null,
  onRemoveItem?: (itemId: DragDropItemId) => void
) {
  const { isMoving } = useContext(DragDropContext);

  const prevSwap = useSharedValue<
    [id: DragDropItemId, id: DragDropItemId] | null
  >(null);

  useDerivedValue(() => {
    if (!isMoving?.value) {
      prevSwap.value = null;
    }
  }, [isMoving]);

  const [movingIds, addMovingId, removeMovingId] = useSharedMap<
    DragDropItemId,
    null
  >({});

  const moveBehavior = useMemo(
    () =>
      createMoveStrategy(
        mode,
        movingIds,
        prevSwap,
        itemsListShared,
        addMovingId
      ),
    [addMovingId, itemsListShared, mode, movingIds, prevSwap]
  );

  const itemMoved = useCallback<DragDropAreaHandler<T>['itemMoved']>(
    (item, hoverMeasurement) => {
      'worklet';
      const movedResult = findNeighboursItem(item.id, hoverMeasurement);
      return moveBehavior(movedResult, item);
    },
    [findNeighboursItem, moveBehavior]
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

type MoveStrategy<T> = (
  movedResult: ItemPosition | null,
  item: DragDropItemType<T>
) => ItemPosition | null;

function createMoveStrategy<T>(
  mode: 'MOVE' | 'SWAP',
  movingIds: SharedValue<Record<DragDropItemId, null>>,
  prevSwap: SharedValue<[id: DragDropItemId, id: DragDropItemId] | null>,
  itemsListShared: SharedValue<DoublyLinkedList<DragDropItemType<T>>>,
  addMovingId: (id: DragDropItemId, value: null) => void
): MoveStrategy<T> {
  if (mode === 'MOVE') {
    return createMoveBehavior(movingIds, itemsListShared, addMovingId);
  } else if (mode === 'SWAP') {
    return createSwapBehavior(
      movingIds,
      prevSwap,
      itemsListShared,
      addMovingId
    );
  } else {
    throw new Error(`Unknown mode: ${mode}`);
  }
}

function createSwapBehavior<T>(
  movingIds: SharedValue<Record<DragDropItemId, null>>,
  prevSwap: SharedValue<[id: DragDropItemId, id: DragDropItemId] | null>,
  itemsListShared: SharedValue<DoublyLinkedList<DragDropItemType<T>>>,
  addMovingId: (id: DragDropItemId, value: null) => void
): MoveStrategy<T> {
  'worklet';
  return (movedResult, item) => {
    'worklet';

    const itemHoveredId = movedResult?.overId;
    if (
      itemHoveredId == null ||
      itemHoveredId === item.id ||
      itemHoveredId in movingIds.value
    ) {
      return null;
    }

    const inPrevPosition =
      prevSwap.value?.[0] === item.id && prevSwap.value?.[1] === itemHoveredId;
    if (prevSwap.value != null && !inPrevPosition) {
      SDLSwapItems(itemsListShared, [prevSwap.value], true);
      addMovingId(prevSwap.value[1], null);
    }
    SDLSwapItems(itemsListShared, [[item.id, itemHoveredId]], true);
    addMovingId(itemHoveredId, null);
    modify(
      prevSwap,
      () => {
        'worklet';
        return inPrevPosition ? null : [item.id, itemHoveredId];
      },
      true
    );

    return movedResult;
  };
}

function createMoveBehavior<T>(
  movingIds: SharedValue<Record<DragDropItemId, null>>,
  itemsListShared: SharedValue<DoublyLinkedList<DragDropItemType<T>>>,
  addMovingId: (id: DragDropItemId, value: null) => void
): MoveStrategy<T> {
  'worklet';
  return (movedResult, item) => {
    const listItem = itemsListShared.value.nodes[item.id];
    const canMove =
      movedResult == null
        ? false
        : !isItemMoved(movingIds, movedResult) && listItem != null;

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
      SDLMoveItemBefore(itemsListShared, [item.id, movedResult.beforeId], true);
      if (movedResult.beforeId != null) {
        addMovingId(movedResult.beforeId, null);
      }
    } else {
      return null;
    }

    return movedResult;
  };
}

function isItemMoved(
  movingIds: SharedValue<Record<DragDropItemId, null>>,
  position: ItemPosition | null
) {
  'worklet';
  if (position?.afterId != null) {
    return position?.afterId in movingIds.value;
  }
  if (position?.beforeId != null) {
    return position?.beforeId in movingIds.value;
  }
  return false;
}
