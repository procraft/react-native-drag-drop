import { type Component } from 'react';
import { type AnimatedRef } from 'react-native-reanimated';
import type { DragDropAreaConfig, DragDropListHandlers } from '../types';
import { useDragDropListConfig } from './useDragDropListConfig';
import { useDragDropListItems } from './useDragDropListItems';
import { useDragDropListItemsActions } from './useDragDropListItemsActions';
import { useDragDropListItemsHandler } from './useDragDropListItemsHandler';
import { useDragDropListItemsLayout } from './useDragDropListItemsLayout';
import { useDragDropArea } from './useDragDropArea';

export function useDragDropList<T, TComponent extends Component>(
  areaRef: AnimatedRef<TComponent>,
  horizontal: boolean,
  initialItems: T[],
  extractId: (item: T) => number | string,
  config?: DragDropAreaConfig,
  onItemChangedPosition?: DragDropListHandlers<T>['onItemChangedPosition'],
  onItemAdded?: DragDropListHandlers<T>['onItemAdded'],
  onItemRemoved?: DragDropListHandlers<T>['onItemRemoved']
) {
  const listConfig = useDragDropListConfig(horizontal);
  const { handlers, registerItemHandler } = useDragDropListItemsHandler<T>();
  const { items, itemsListShared } = useDragDropListItems(
    initialItems,
    extractId,
    onItemChangedPosition,
    onItemAdded,
    onItemRemoved
  );
  const { findNeighboursItem, measureItem } = useDragDropListItemsLayout(
    handlers,
    listConfig
  );
  const { itemMoved, tryPutItem, removeItem, onTransitionDone } =
    useDragDropListItemsActions(itemsListShared, findNeighboursItem);
  const { areaId } = useDragDropArea(
    areaRef,
    {
      measureItem,
      itemMoved,
      tryPutItem,
      removeItem,
    },
    config
  );

  return { areaId, items, registerItemHandler, onTransitionDone };
}
