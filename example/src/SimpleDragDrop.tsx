import {
  DragDropScrollView,
  type DragDropRenderItem,
} from '@procraft/react-native-drag-drop';
import React, { useState, type ComponentProps, useCallback } from 'react';
import type Animated from 'react-native-reanimated';
import { SimpleItem, type ItemType } from './SimpleItem';

export interface SimpleDragDropProps {
  style: ComponentProps<Animated.ScrollView>['style'];
}

export function SimpleDragDrop(props: SimpleDragDropProps) {
  const { style } = props;

  const [items] = useState<ItemType[]>(() =>
    Array.from({ length: 50 }).map((_, i) => ({
      id: (i + 1).toString(),
      text: Array.from({ length: i + 1 })
        .map(() => (i + 1).toString())
        .join(' | '),
    }))
  );

  const renderItem = useCallback<DragDropRenderItem<ItemType>>(
    (item, isActive, drag) => (
      <SimpleItem item={item.data} isActive={isActive} drag={drag} />
    ),
    []
  );
  const extractId = useCallback((item: ItemType) => item.id, []);

  return (
    <DragDropScrollView
      items={items}
      renderItem={renderItem}
      extractId={extractId}
      style={style}
      config={{ mode: 'SWAP', axis: { horizontal: true, vertical: true } }}
    />
  );
}
