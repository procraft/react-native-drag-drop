import { type Component } from 'react';
import { type AnimatedRef } from 'react-native-reanimated';
import type { DragDropAreaConfig } from '../types';
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
  config?: DragDropAreaConfig
) {
  const listConfig = useDragDropListConfig(horizontal);
  const { handlers, registerItemHandler } = useDragDropListItemsHandler<T>();
  const { items, itemsListShared } = useDragDropListItems(
    initialItems,
    extractId
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
