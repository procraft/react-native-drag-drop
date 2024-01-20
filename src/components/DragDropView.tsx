import React from 'react';
import type { ViewProps } from 'react-native';
import Animated, {
  useAnimatedRef,
  type AnimatedRef,
} from 'react-native-reanimated';
import { useDragDropList } from '../hooks';
import type { DragDropListHandlers, DragDropRenderItem } from '../types';
import type { DragDropAreaConfig } from '../types/DragDropAreaConfig';
import { DragDropItem } from './DragDropItem';

export interface DragDropViewProps<T> extends Omit<ViewProps, 'ref'> {
  items: T[];
  innerRef?: AnimatedRef<Animated.View>;
  config?: DragDropAreaConfig;
  horizontal?: boolean;
  renderItem: DragDropRenderItem<T>;
  extractId: (item: T) => number | string;
  onItemChangedPosition?: DragDropListHandlers<T>['onItemChangedPosition'];
  onItemAdded?: DragDropListHandlers<T>['onItemAdded'];
  onItemRemoved?: DragDropListHandlers<T>['onItemRemoved'];
}

export function DragDropView<T>(props: DragDropViewProps<T>) {
  const {
    config,
    items: initialItems,
    horizontal,
    innerRef,
    renderItem,
    extractId,
    onItemChangedPosition,
    onItemAdded,
    onItemRemoved,
    ...otherProps
  } = props;

  const animatedRef = useAnimatedRef<Animated.View>();
  const areaRef = innerRef ?? animatedRef;

  const { areaId, items, registerItemHandler, onTransitionDone } =
    useDragDropList(
      areaRef,
      horizontal ?? false,
      initialItems,
      extractId,
      config,
      onItemChangedPosition,
      onItemAdded,
      onItemRemoved
    );

  return (
    <Animated.View ref={areaRef} {...otherProps}>
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
    </Animated.View>
  );
}
