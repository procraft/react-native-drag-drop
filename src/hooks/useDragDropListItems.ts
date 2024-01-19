import { useCallback, useState } from 'react';
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import {
  DLClone,
  DLCreate,
  DLFindIndex,
  DLRestoreHistory,
  DLToArray,
  convertArrToDragDrop,
  convertDragDropToArr,
  extractDragDropId,
  type DoublyLinkedListHistory,
  type DoublyLinkedListHistoryType,
} from '../helpers';
import type { DragDropItemId, DragDropItemType } from '../types';
import { useLazyRef } from './useLazyRef';

const ACTIONS_REMOVE: DoublyLinkedListHistory<unknown>['type'][] = ['Remove'];
const ACTIONS_ADD: DoublyLinkedListHistory<unknown>['type'][] = [
  'Add',
  'AddAfter',
  'AddBefore',
];
const ACTIONS_MOVE: DoublyLinkedListHistory<unknown>['type'][] = [
  'MoveAfter',
  'MoveBefore',
];

export function useDragDropListItems<T>(
  initialItems: T[],
  extractId: (item: T) => DragDropItemId,
  onItemChangedPosition?: (items: T[], from: number, to: number) => void,
  onItemAdded?: (items: T[], item: T) => void,
  onItemRemoved?: (items: T[], item: T) => void
) {
  const itemsListRef = useLazyRef(() =>
    DLCreate(convertArrToDragDrop(initialItems, extractId), extractDragDropId)
  );

  //! because useSharedValue make obj deep freeze
  const initListShared = useLazyRef(() => DLClone(itemsListRef.current));
  const itemsListShared = useSharedValue(initListShared.current);
  const [items, setItemsLocal] = useState(() =>
    DLToArray(itemsListRef.current)
  );

  const updateItems = useCallback(
    (history: DoublyLinkedListHistory<DragDropItemType<T>>[]) => {
      for (const historyItem of history) {
        if (historyItem.id > itemsListRef.current.historyId) {
          let item: T | null = null;
          let prevPos: number = -1;
          if (isActionRemove(historyItem)) {
            item =
              itemsListRef.current.nodes[historyItem.data.id]?.data.data ??
              null;
          }
          if (isActionMove(historyItem)) {
            prevPos = DLFindIndex(itemsListRef.current, historyItem.data.id);
          }
          DLRestoreHistory(itemsListRef.current, historyItem);
          if (isActionAdd(historyItem)) {
            onItemAdded?.(
              convertDragDropToArr(DLToArray(itemsListRef.current)),
              historyItem.data.data.data
            );
          }
          if (isActionRemove(historyItem) && item != null) {
            onItemRemoved?.(
              convertDragDropToArr(DLToArray(itemsListRef.current)),
              item
            );
          }
          if (isActionMove(historyItem) && prevPos > -1) {
            const newPos = DLFindIndex(
              itemsListRef.current,
              historyItem.data.id
            );
            onItemChangedPosition?.(
              convertDragDropToArr(DLToArray(itemsListRef.current)),
              prevPos,
              newPos
            );
          }
        }
      }
      setItemsLocal(DLToArray(itemsListRef.current));
    },
    [onItemAdded, onItemChangedPosition, onItemRemoved, itemsListRef]
  );

  const prevHistoryId = useSharedValue(itemsListShared.value.historyId);
  useDerivedValue(() => {
    if (prevHistoryId.value < itemsListShared.value.historyId) {
      prevHistoryId.value = itemsListShared.value.historyId;
      runOnJS(updateItems)(itemsListShared.value.history);
    }
  }, [updateItems]);

  const setItems = useCallback(
    (newItems: T[]) => {
      const newDragDrop = convertArrToDragDrop(newItems, extractId);
      const newList = DLCreate(newDragDrop, extractDragDropId);
      itemsListRef.current = newList;
      setItemsLocal(DLToArray(newList));
    },
    [extractId, itemsListRef]
  );

  return { items, itemsListShared, setItems };
}

function isActionAdd<T>(
  historyItem: DoublyLinkedListHistory<DragDropItemType<T>>
): historyItem is DoublyLinkedListHistoryType<
  DragDropItemType<T>,
  'Add' | 'AddAfter' | 'AddBefore'
> {
  return ACTIONS_ADD.includes(historyItem.type);
}

function isActionRemove<T>(
  historyItem: DoublyLinkedListHistory<DragDropItemType<T>>
): historyItem is DoublyLinkedListHistoryType<DragDropItemType<T>, 'Remove'> {
  return ACTIONS_REMOVE.includes(historyItem.type);
}

function isActionMove<T>(
  historyItem: DoublyLinkedListHistory<DragDropItemType<T>>
): historyItem is DoublyLinkedListHistoryType<
  DragDropItemType<T>,
  'MoveAfter' | 'MoveBefore'
> {
  return ACTIONS_MOVE.includes(historyItem.type);
}
