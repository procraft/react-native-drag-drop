import { AutoScrollScrollView } from '@procraft/react-native-autoscroll';
import React, { type ComponentProps } from 'react';
import type Animated from 'react-native-reanimated';
import { useAnimatedRef, type AnimatedRef } from 'react-native-reanimated';
import { useDragDropList } from '../hooks';
import type { DragDropListHandlers, DragDropRenderItem } from '../types';
import type { DragDropAreaConfig } from '../types/DragDropAreaConfig';
import { DragDropItem } from './DragDropItem';

export interface DragDropScrollViewProps<T>
  extends Omit<ComponentProps<Animated.ScrollView>, 'ref'> {
  items: T[];
  innerRef?: AnimatedRef<Animated.ScrollView>;
  config?: DragDropAreaConfig;
  renderItem: DragDropRenderItem<T>;
  extractId: (item: T) => number | string;
  onItemChangedPosition?: DragDropListHandlers<T>['onItemChangedPosition'];
  onItemAdded?: DragDropListHandlers<T>['onItemAdded'];
  onItemRemoved?: DragDropListHandlers<T>['onItemRemoved'];
}

export function DragDropScrollView<T>(props: DragDropScrollViewProps<T>) {
  const {
    config,
    items: initialItems,
    horizontal: horizontalProps,
    innerRef,
    renderItem,
    extractId,
    onItemChangedPosition,
    onItemAdded,
    onItemRemoved,
    ...otherProps
  } = props;

  const animatedRef = useAnimatedRef<Animated.ScrollView>();
  const areaRef = innerRef ?? animatedRef;

  const horizontal =
    typeof horizontalProps === 'object'
      ? horizontalProps?.value ?? false
      : horizontalProps ?? false;

  const { areaId, items, registerItemHandler, onTransitionDone } =
    useDragDropList(
      areaRef,
      horizontal,
      initialItems,
      extractId,
      config,
      onItemChangedPosition,
      onItemAdded,
      onItemRemoved
    );

  return (
    <AutoScrollScrollView
      innerRef={areaRef}
      horizontal={horizontalProps}
      {...otherProps}
    >
      {items.map((item) => (
        <DragDropItem<T>
          key={item.id}
          areaId={areaId}
          config={config}
          item={item}
          renderItem={renderItem}
          registerItemHandler={registerItemHandler}
          onTransitionDone={onTransitionDone}
        />
      ))}
    </AutoScrollScrollView>
  );
}
